/**
 * SOHANA DAS - SELF-HOSTED NODE.JS EXPRESS SERVER
 * - Real-time IP Capture via reverse proxy / direct headers
 * - Persistent visitor IP logging to logs/visitors.json
 * - Static file serving with cache management
 * - REST API endpoints: /api/visitor, /api/log, /api/logs, /api/contact
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const LOGS_FILE = path.join(__dirname, 'logs', 'visitors.json');

// Ensure logs directory and file exist
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
  fs.mkdirSync(path.join(__dirname, 'logs'), { recursive: true });
}
if (!fs.existsSync(LOGS_FILE)) {
  fs.writeFileSync(LOGS_FILE, JSON.stringify([], null, 2));
}

// Middleware
app.set('trust proxy', true);
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Helper to get client IP cleanly
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

// Helper to append log entry to disk
function appendLog(entry) {
  try {
    const raw = fs.readFileSync(LOGS_FILE, 'utf8');
    const logs = JSON.parse(raw || '[]');
    logs.unshift(entry);
    // Keep last 1,000 logs
    if (logs.length > 1000) logs.pop();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
  } catch (err) {
    console.error('Error writing to visitor log:', err);
  }
}

// 1. GET /api/visitor - Returns client IP and server metadata
app.get('/api/visitor', (req, res) => {
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'Unknown Agent';

  const telemetry = {
    ip: ip,
    city: 'Server Ingress Node',
    region: 'Network Boundary',
    country: 'Detected Host',
    country_code: 'IN',
    isp: 'Local / Reverse Proxy Gateway',
    asn: 'AS-PRIVATE',
    userAgent: userAgent,
    timestamp: new Date().toISOString()
  };

  // Record this visit
  const logEntry = {
    id: 'SRV-' + Date.now(),
    timestamp: telemetry.timestamp,
    ip: telemetry.ip,
    location: 'Server Ingress',
    isp: telemetry.isp,
    device: userAgent,
    referrer: req.headers['referer'] || 'Direct Entry'
  };
  appendLog(logEntry);
  console.log(`\n🚨 [VISITOR ALERT] New visitor opened your portfolio!`);
  console.log(`   IP Address: ${telemetry.ip}`);
  console.log(`   Device:     ${userAgent}`);
  console.log(`   Time (UTC): ${telemetry.timestamp}\n`);

  res.json(telemetry);
});

// 2. POST /api/log - Client syncs enriched geolocation telemetry
app.post('/api/log', (req, res) => {
  const data = req.body;
  if (data && data.ip) {
    appendLog({
      id: data.id || 'CLI-' + Date.now(),
      timestamp: data.timestamp || new Date().toISOString(),
      ip: data.ip,
      location: data.location || 'Unknown',
      isp: data.isp || 'Unknown',
      device: data.device || 'Unknown',
      referrer: data.referrer || 'Direct',
      latency: data.latency || 'N/A'
    });
  }
  res.json({ success: true, message: 'Logged to server ledger' });
});

// 3. GET /api/logs - Retrieve full server-side visitor logs
app.get('/api/logs', (req, res) => {
  try {
    const raw = fs.readFileSync(LOGS_FILE, 'utf8');
    const logs = JSON.parse(raw || '[]');
    res.json({
      total: logs.length,
      unique_ips: new Set(logs.map(l => l.ip)).size,
      logs: logs
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

// 4. POST /api/contact - Stamped recruiter message transmission
app.post('/api/contact', (req, res) => {
  const submission = req.body;
  const ip = getClientIp(req);
  console.log(`[CONTACT RECEIVED] From IP: ${ip} | Name: ${submission.name} <${submission.email}>`);

  // Append contact submission to a secure contacts log
  const contactsFile = path.join(__dirname, 'logs', 'contacts.json');
  try {
    const raw = fs.existsSync(contactsFile) ? fs.readFileSync(contactsFile, 'utf8') : '[]';
    const contacts = JSON.parse(raw || '[]');
    contacts.unshift({
      ...submission,
      verified_ip: ip,
      received_at: new Date().toISOString()
    });
    fs.writeFileSync(contactsFile, JSON.stringify(contacts, null, 2));
  } catch (e) {
    console.error('Contact log write error', e);
  }

  res.json({ success: true, message: 'Transmission received and logged.' });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 SOHANA DAS PORTFOLIO & IP TELEMETRY SERVER`);
  console.log(`📡 Live at: http://localhost:${PORT}`);
  console.log(`📋 Visitor IP Access Ledger: ${LOGS_FILE}`);
  console.log(`===================================================`);
});
