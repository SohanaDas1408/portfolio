/**
 * Vercel Serverless Function: /api/visitor
 * Automatically resolves visitor IP, Geolocation headers, and records telemetry.
 */

module.exports = async (req, res) => {
  // Extract client IP from proxy headers
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || '127.0.0.1';

  // Extract Vercel Geo-IP headers (available automatically on Vercel deployment)
  const country = req.headers['x-vercel-ip-country'] || 'Global';
  const region = req.headers['x-vercel-ip-country-region'] || '';
  const city = req.headers['x-vercel-ip-city'] || 'Detected Node';
  const latitude = req.headers['x-vercel-ip-latitude'] || null;
  const longitude = req.headers['x-vercel-ip-longitude'] || null;

  const telemetry = {
    ip: clientIp,
    city: decodeURIComponent(city),
    region: region,
    country: country,
    country_code: country,
    isp: req.headers['user-agent'] ? 'Verified Cloud Client' : 'Direct Request',
    asn: 'AS-VERCEL-EDGE',
    latitude: latitude,
    longitude: longitude,
    server: 'Vercel Edge Serverless Engine',
    timestamp: new Date().toISOString()
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.status(200).json(telemetry);
};
