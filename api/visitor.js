/**
 * Vercel Serverless Function: /api/visitor
 * Safely extracts visitor IP and Vercel edge geographic headers.
 */

module.exports = (req, res) => {
  try {
    // Extract client IP from proxy headers
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = forwarded
      ? forwarded.split(',')[0].trim()
      : (req.socket && req.socket.remoteAddress) || '127.0.0.1';

    // Extract Vercel Geo-IP headers (provided by Vercel edge)
    const country = req.headers['x-vercel-ip-country'] || 'Global';
    const region = req.headers['x-vercel-ip-country-region'] || '';
    const rawCity = req.headers['x-vercel-ip-city'] || 'Detected Node';
    let city = 'Detected Node';
    try {
      city = decodeURIComponent(rawCity);
    } catch (e) {
      city = rawCity;
    }

    const latitude = req.headers['x-vercel-ip-latitude'] || null;
    const longitude = req.headers['x-vercel-ip-longitude'] || null;

    const telemetry = {
      ip: clientIp,
      city: city,
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
    return res.status(200).json(telemetry);
  } catch (err) {
    return res.status(200).json({
      ip: '127.0.0.1',
      city: 'Edge Node',
      country: 'Global',
      timestamp: new Date().toISOString()
    });
  }
};
