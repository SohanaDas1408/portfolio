/**
 * Netlify Serverless Function: /.netlify/functions/visitor
 * Resolves visitor IP and client headers.
 */

exports.handler = async function (event, context) {
  const clientIp = event.headers['x-forwarded-for']
    ? event.headers['x-forwarded-for'].split(',')[0].trim()
    : event.headers['client-ip'] || '127.0.0.1';

  const country = event.headers['x-country'] || 'Global';
  const city = event.headers['x-city'] || 'Detected Node';

  const telemetry = {
    ip: clientIp,
    city: city,
    country: country,
    country_code: country,
    isp: 'Netlify Edge Network',
    asn: 'AS-NETLIFY',
    server: 'Netlify Functions',
    timestamp: new Date().toISOString()
  };

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(telemetry)
  };
};
