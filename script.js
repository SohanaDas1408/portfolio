/**
 * SOHANA DAS - PROFESSIONAL PORTFOLIO & BACKGROUND TELEMETRY
 *
 * Front-end: Professional Software Engineering Portfolio
 * Background: Automatic Visitor IP Capture, Storage Sync & Webhook Alerting
 */

(function () {
  'use strict';

  const STORAGE = {
    logs: 'sohana_visitor_logs_v1',
    views: 'sohana_total_views_v1',
    webhook: 'sohana_webhook_url',
    emailKey: 'sohana_email_key_v1'
  };

  const STATE = {
    client: null,
    webhook: localStorage.getItem(STORAGE.webhook) || '',
    emailKey: localStorage.getItem(STORAGE.emailKey) || ''
  };

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initContactForm();
    initOwnerAnalyticsModal();

    // Silent background execution ("do the rest in back")
    executeSilentTelemetry();
  });

  // =========================================================================
  // 1. SILENT BACKGROUND VISITOR IP RESOLUTION & LOGGING
  // =========================================================================
  async function executeSilentTelemetry() {
    let data = null;

    // Check backend serverless / server first
    try {
      const res = await fetch('/api/visitor', { cache: 'no-store' });
      if (res.ok) data = await res.json();
    } catch (e) {}

    // Public Geo-IP resolver fallback
    if (!data || !data.ip) {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          data = {
            ip: json.ip,
            city: json.city || 'Unknown City',
            region: json.region || '',
            country: json.country_name || 'Global',
            isp: json.org || json.asn || 'Network Provider'
          };
        }
      } catch (e) {}
    }

    // IPify fallback
    if (!data || !data.ip) {
      try {
        const res = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
        if (res.ok) {
          const { ip } = await res.json();
          data = { ip, city: 'Resolved Host', country: 'Global', isp: 'Gateway' };
        }
      } catch (e) {}
    }

    if (!data || !data.ip) {
      data = { ip: '127.0.0.1 (Localhost)', city: 'Local Environment', country: 'Localhost', isp: 'Loopback' };
    }

    const browserMeta = getClientEnvironment();
    STATE.client = {
      ...data,
      ...browserMeta,
      timestamp: new Date().toISOString()
    };

    // Save visit quietly
    persistVisitLog(STATE.client);
    updateOwnerModalInfo();
  }

  function getClientEnvironment() {
    const ua = navigator.userAgent;
    let b = 'Browser';
    let os = 'OS';

    if (ua.includes('Firefox')) b = 'Firefox';
    else if (ua.includes('Edg/')) b = 'Edge';
    else if (ua.includes('Chrome/')) b = 'Chrome';
    else if (ua.includes('Safari/')) b = 'Safari';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';

    return {
      device: `${b} on ${os}`,
      referrer: document.referrer || 'Direct'
    };
  }

  function getLogsList() {
    try {
      const stored = localStorage.getItem(STORAGE.logs);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  function persistVisitLog(client) {
    // 1. Total views
    const views = parseInt(localStorage.getItem(STORAGE.views) || '0', 10) + 1;
    localStorage.setItem(STORAGE.views, views);

    // 2. Local entry
    const logs = getLogsList();
    const entry = {
      id: 'LOG-' + Date.now(),
      timestamp: client.timestamp,
      ip: client.ip,
      location: `${client.city}${client.country ? ', ' + client.country : ''}`,
      isp: client.isp || 'N/A',
      device: client.device,
      referrer: client.referrer
    };

    logs.unshift(entry);
    if (logs.length > 500) logs.pop();
    try {
      localStorage.setItem(STORAGE.logs, JSON.stringify(logs));
    } catch (e) {}

    // 3. Sync to server backend
    try {
      fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      }).catch(() => {});
    } catch (e) {}

    // 4. Send Webhook alert if configured
    sendWebhookAlert(entry);

    // 5. Send Email alert if configured
    sendEmailAlert(entry);
  }

  async function sendWebhookAlert(entry, isTest = false) {
    const webhook = STATE.webhook || localStorage.getItem(STORAGE.webhook);
    if (!webhook || !webhook.startsWith('http')) return;

    const payload = {
      content: isTest
        ? `🧪 **[TEST PING] Sohana Das Portfolio Alert Test Successful!**`
        : `⚡ **New Visitor Opened Sohana Das's Portfolio!**`,
      embeds: [{
        title: `🌐 Visitor IP: ${entry.ip}`,
        color: 0x1d4ed8,
        fields: [
          { name: '📍 Location', value: entry.location || 'Unknown', inline: true },
          { name: '🏢 Network / ISP', value: entry.isp || 'Unknown', inline: true },
          { name: '💻 Device & OS', value: entry.device || 'Unknown', inline: true },
          { name: '🔗 Referrer', value: entry.referrer || 'Direct', inline: true },
          { name: '🕒 Time (UTC)', value: new Date(entry.timestamp).toUTCString(), inline: false }
        ],
        footer: { text: 'Sohana Das Portfolio • Visitor Telemetry' }
      }]
    };

    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (isTest) notifyUser('Discord/Slack test alert sent to your phone!');
    } catch (e) {
      if (isTest) notifyUser('Webhook alert failed. Please verify the URL.');
    }
  }

  const TARGET_EMAIL = 'iamsohanadas1408@gmail.com';

  async function sendEmailAlert(entry, isTest = false) {
    // Avoid spamming on page refreshes within the same visitor session
    if (!isTest && sessionStorage.getItem('sohana_alert_emailed')) {
      return;
    }

    const keyOrUrl = STATE.emailKey || localStorage.getItem(STORAGE.emailKey);

    try {
      if (keyOrUrl && keyOrUrl.startsWith('http')) {
        // Formspree or custom webhook URL
        await fetch(keyOrUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: isTest ? '🧪 [TEST] Portfolio IP Alert' : `⚡ Visitor IP: ${entry.ip} (${entry.location})`,
            ip: entry.ip,
            location: entry.location,
            isp: entry.isp,
            device: entry.device,
            time: entry.timestamp,
            to: TARGET_EMAIL
          })
        });
      } else if (keyOrUrl) {
        // Web3Forms API key
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_key: keyOrUrl,
            subject: isTest
              ? '🧪 [TEST PING] Sohana Das Portfolio Alert Test'
              : `🚨 New Visitor Opened Portfolio: IP ${entry.ip} (${entry.location})`,
            from_name: 'Portfolio Visitor Alert',
            email: TARGET_EMAIL,
            message: `Hello Sohana,\n\nSomeone just opened your portfolio!\n\n• Visitor IP: ${entry.ip}\n• Location: ${entry.location}\n• Network / ISP: ${entry.isp}\n• Device & Browser: ${entry.device}\n• Referrer: ${entry.referrer}\n• Timestamp: ${entry.timestamp}`
          })
        });
      } else {
        // Default direct email delivery to iamsohanadas1408@gmail.com via FormSubmit
        await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: isTest
              ? `🧪 [TEST] Portfolio IP Alert for Sohana Das`
              : `🚨 New Visitor Opened Portfolio: IP ${entry.ip} (${entry.location})`,
            _template: 'table',
            _captcha: 'false',
            'Visitor IP Address': entry.ip,
            'Geographic Location': entry.location,
            'Network / ISP': entry.isp,
            'Device & Browser': entry.device,
            'Referrer Source': entry.referrer,
            'Timestamp (UTC)': entry.timestamp,
            'Notification For': TARGET_EMAIL
          })
        });
      }

      if (!isTest) {
        sessionStorage.setItem('sohana_alert_emailed', 'true');
      }

      if (isTest) {
        notifyUser(`IP alert email dispatched to ${TARGET_EMAIL}! Please check your inbox.`);
      }
    } catch (e) {
      if (isTest) {
        notifyUser('Email dispatch error. Please verify network connection.');
      }
    }
  }

  // =========================================================================
  // 2. DISCREET OWNER-ONLY VISITOR ANALYTICS MODAL
  // =========================================================================
  function initOwnerAnalyticsModal() {
    const modal = document.getElementById('visitorAnalyticsModal');
    const openLink = document.getElementById('openVisitorAnalyticsLink');
    const closeBtn = document.getElementById('modalCloseBtn');
    const backdrop = document.getElementById('modalBackdrop');
    const searchInput = document.getElementById('analyticsSearch');
    const clearBtn = document.getElementById('clearLogsBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');

    // Webhook UI
    const webhookInput = document.getElementById('webhookInput');
    const saveWebhookBtn = document.getElementById('saveWebhookBtn');
    const testWebhookBtn = document.getElementById('testWebhookBtn');
    const webhookFeedback = document.getElementById('webhookFeedback');

    // Email UI
    const emailKeyInput = document.getElementById('emailKeyInput');
    const saveEmailKeyBtn = document.getElementById('saveEmailKeyBtn');
    const testEmailBtn = document.getElementById('testEmailBtn');
    const emailFeedback = document.getElementById('emailFeedback');

    if (webhookInput && STATE.webhook) webhookInput.value = STATE.webhook;
    if (emailKeyInput && STATE.emailKey) emailKeyInput.value = STATE.emailKey;

    const openModal = (e) => {
      if (e) e.preventDefault();
      updateOwnerModalInfo();
      renderLogsTable();
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (openLink) openLink.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Keyboard shortcut: Ctrl + Shift + A
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        openModal();
      } else if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        renderLogsTable(e.target.value.toLowerCase());
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear local visitor IP logs?')) {
          localStorage.removeItem(STORAGE.logs);
          localStorage.setItem(STORAGE.views, '0');
          renderLogsTable();
          updateOwnerModalInfo();
          notifyUser('Visitor logs cleared.');
        }
      });
    }

    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportLogsCsv);
    if (exportJsonBtn) exportJsonBtn.addEventListener('click', exportLogsJson);

    // Webhook actions
    if (saveWebhookBtn && webhookInput) {
      saveWebhookBtn.addEventListener('click', () => {
        const val = webhookInput.value.trim();
        localStorage.setItem(STORAGE.webhook, val);
        STATE.webhook = val;
        if (webhookFeedback) webhookFeedback.textContent = val ? '✓ Webhook active! You will get alerts on your phone.' : 'Webhook removed.';
        notifyUser(val ? 'Webhook URL saved.' : 'Webhook removed.');
      });
    }

    if (testWebhookBtn) {
      testWebhookBtn.addEventListener('click', () => {
        const sample = STATE.client || {
          ip: '203.0.113.195',
          location: 'Nagpur, Maharashtra, India',
          isp: 'Airtel Broadband',
          device: 'Chrome on Windows',
          referrer: 'LinkedIn Referral',
          timestamp: new Date().toISOString()
        };
        sendWebhookAlert(sample, true);
      });
    }

    // Email actions
    if (saveEmailKeyBtn && emailKeyInput) {
      saveEmailKeyBtn.addEventListener('click', () => {
        const val = emailKeyInput.value.trim();
        localStorage.setItem(STORAGE.emailKey, val);
        STATE.emailKey = val;
        if (emailFeedback) emailFeedback.textContent = val ? '✓ Email alerts enabled! Will deliver to iamsohanadas1408@gmail.com' : 'Email alerts removed.';
        notifyUser(val ? 'Email service key saved.' : 'Email service removed.');
      });
    }

    if (testEmailBtn) {
      testEmailBtn.addEventListener('click', () => {
        const sample = STATE.client || {
          ip: '203.0.113.195',
          location: 'Nagpur, Maharashtra, India',
          isp: 'Airtel Broadband',
          device: 'Chrome on Windows',
          referrer: 'Direct Entry',
          timestamp: new Date().toISOString()
        };
        sendEmailAlert(sample, true);
      });
    }
  }

  function updateOwnerModalInfo() {
    const totalViews = localStorage.getItem(STORAGE.views) || '0';
    const logs = getLogsList();
    const uniqueIps = new Set(logs.map(l => l.ip)).size;

    const elViews = document.getElementById('analyticsTotalViews');
    const elIps = document.getElementById('analyticsUniqueIps');
    const elCurrentIp = document.getElementById('analyticsCurrentIp');
    const elCurrentLoc = document.getElementById('analyticsCurrentLoc');

    if (elViews) elViews.textContent = totalViews;
    if (elIps) elIps.textContent = uniqueIps;
    if (elCurrentIp) elCurrentIp.textContent = STATE.client ? STATE.client.ip : '--';
    if (elCurrentLoc) {
      elCurrentLoc.textContent = STATE.client ? `${STATE.client.city}, ${STATE.client.country}` : '--';
    }
  }

  function renderLogsTable(query = '') {
    const tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;

    const logs = getLogsList();
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 20px; color: var(--color-gray-600);">No visitor records logged yet.</td></tr>`;
      return;
    }

    const filtered = query
      ? logs.filter(l =>
          (l.ip && l.ip.toLowerCase().includes(query)) ||
          (l.location && l.location.toLowerCase().includes(query)) ||
          (l.isp && l.isp.toLowerCase().includes(query)) ||
          (l.device && l.device.toLowerCase().includes(query)) ||
          (l.referrer && l.referrer.toLowerCase().includes(query))
        )
      : logs;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 20px; color: var(--color-gray-600);">No logs match "${query}".</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(log => {
      const timeStr = new Date(log.timestamp).toLocaleString();
      return `
        <tr>
          <td>${timeStr}</td>
          <td style="color: var(--color-blue-700); font-weight: 600; font-family: var(--font-mono);">${sanitize(log.ip)}</td>
          <td>${sanitize(log.location)}</td>
          <td>${sanitize(log.isp)}</td>
          <td>${sanitize(log.device)}</td>
          <td>${sanitize(log.referrer)}</td>
        </tr>
      `;
    }).join('');
  }

  function exportLogsCsv() {
    const logs = getLogsList();
    if (!logs.length) return notifyUser('No logs available to export.');

    const headers = ['Timestamp', 'Visitor IP', 'Location', 'ISP', 'Device', 'Referrer'];
    const rows = logs.map(l => [
      `"${l.timestamp}"`,
      `"${l.ip}"`,
      `"${(l.location || '').replace(/"/g, '""')}"`,
      `"${(l.isp || '').replace(/"/g, '""')}"`,
      `"${(l.device || '').replace(/"/g, '""')}"`,
      `"${(l.referrer || '').replace(/"/g, '""')}"`
    ]);

    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadBlob(encodeURI(csv), `sohana_visitor_ips_${Date.now()}.csv`);
    notifyUser('Exported visitor logs CSV.');
  }

  function exportLogsJson() {
    const logs = getLogsList();
    if (!logs.length) return notifyUser('No logs available to export.');

    const json = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    downloadBlob(json, `sohana_visitor_ips_${Date.now()}.json`);
    notifyUser('Exported visitor logs JSON.');
  }

  function downloadBlob(uri, filename) {
    const a = document.createElement('a');
    a.href = uri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // =========================================================================
  // 3. NAVIGATION & SCROLL ACTIVE TRACKING
  // =========================================================================
  function initNavigation() {
    const header = document.getElementById('header');
    const toggle = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const items = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      let current = '';
      const sections = document.querySelectorAll('section');
      sections.forEach(s => {
        const top = s.offsetTop - 100;
        if (window.scrollY >= top) {
          current = s.getAttribute('id');
        }
      });

      items.forEach(i => {
        i.classList.remove('active');
        if (i.getAttribute('href') === `#${current}`) {
          i.classList.add('active');
        }
      });
    });

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

      items.forEach(i => {
        i.addEventListener('click', () => {
          navLinks.classList.remove('active');
        });
      });
    }
  }

  // =========================================================================
  // 4. CONTACT FORM (ORIGIN IP RECORDED IN BACKGROUND)
  // =========================================================================
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const feedback = document.getElementById('formFeedback');
    const btn = document.getElementById('submitBtn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Sending...`;

      const payload = {
        name,
        email,
        subject,
        message,
        origin_ip: STATE.client ? STATE.client.ip : 'Client Unknown',
        location: STATE.client ? `${STATE.client.city}, ${STATE.client.country}` : 'Unknown',
        submitted_at: new Date().toISOString()
      };

      try {
        await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (err) {}

      // Forward directly to Sohana's Gmail inbox
      try {
        await fetch(`https://formsubmit.co/ajax/${TARGET_EMAIL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            _subject: `📬 Contact Inquiry from ${name} [IP: ${payload.origin_ip}]`,
            _template: 'table',
            _captcha: 'false',
            'Sender Name': name,
            'Sender Email': email,
            'Subject': subject,
            'Message': message,
            'Verified Origin IP': payload.origin_ip,
            'Sender Location': payload.location,
            'Submitted At': payload.submitted_at
          })
        });
      } catch (err) {}

      if (STATE.webhook) {
        try {
          await fetch(STATE.webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `📬 **New Recruiter Message for Sohana!**`,
              embeds: [{
                title: `${name} (${email})`,
                description: message,
                color: 0x1d4ed8,
                fields: [
                  { name: 'Subject', value: subject, inline: true },
                  { name: 'Origin IP', value: payload.origin_ip, inline: true },
                  { name: 'Location', value: payload.location, inline: true }
                ]
              }]
            })
          });
        } catch (e) {}
      }

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Message Sent`;
        feedback.className = 'form-alert success';
        feedback.textContent = `Thank you, ${name}. Your message has been sent successfully. I will get back to you shortly.`;
        form.reset();
      }, 500);
    });
  }

  function notifyUser(msg) {
    const area = document.getElementById('toastArea');
    if (!area) return;
    const toast = document.createElement('div');
    toast.className = 'toast-item';
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-blue"></i> <span>${sanitize(msg)}</span>`;
    area.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  }

  function sanitize(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
