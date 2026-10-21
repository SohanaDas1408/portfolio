"""
SOHANA DAS - ZERO-DEPENDENCY PYTHON SERVER (serve.py)
Uses Python's standard library only (no pip install required!).
Captures visitor IP, logs visits to logs/visitors.json, and serves the portfolio.
"""

import os
import json
import socket
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = int(os.environ.get('PORT', 8000))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
LOGS_FILE = os.path.join(LOGS_DIR, 'visitors.json')
CONTACTS_FILE = os.path.join(LOGS_DIR, 'contacts.json')

os.makedirs(LOGS_DIR, exist_ok=True)
if not os.path.exists(LOGS_FILE):
    with open(LOGS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

def append_visitor_log(entry):
    try:
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
    except Exception:
        logs = []
    logs.insert(0, entry)
    logs = logs[:1000]
    try:
        with open(LOGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(logs, f, indent=2)
    except Exception as e:
        print("Error saving log:", e)

class TelemetryHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def get_client_ip(self):
        forwarded = self.headers.get('X-Forwarded-For')
        if forwarded:
            return forwarded.split(',')[0].strip()
        return self.client_address[0] or '127.0.0.1'

    def send_json(self, data, status=200):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)

        if parsed.path == '/api/visitor':
            client_ip = self.get_client_ip()
            user_agent = self.headers.get('User-Agent', 'Unknown')
            telemetry = {
                'ip': client_ip,
                'city': 'Python Ingress Node',
                'region': 'Standard Route',
                'country': 'Connected Client',
                'country_code': 'IN',
                'isp': 'Direct Gateway',
                'asn': 'AS-PYTHON-CORE',
                'userAgent': user_agent,
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }
            entry = {
                'id': f'PY-{int(datetime.utcnow().timestamp()*1000)}',
                'timestamp': telemetry['timestamp'],
                'ip': client_ip,
                'location': 'Python Server Node',
                'isp': telemetry['isp'],
                'device': user_agent,
                'referrer': self.headers.get('Referer', 'Direct Entry')
            }
            append_visitor_log(entry)
            print(f"\n🚨 [VISITOR ALERT] New visitor opened your portfolio!")
            print(f"   IP Address: {client_ip}")
            print(f"   Device:     {user_agent}")
            print(f"   Time (UTC): {telemetry['timestamp']}\n")
            self.send_json(telemetry)
            return

        if parsed.path == '/api/logs':
            try:
                with open(LOGS_FILE, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
                self.send_json({
                    'total': len(logs),
                    'unique_ips': len(set(l.get('ip') for l in logs)),
                    'logs': logs
                })
            except Exception as e:
                self.send_json({'error': str(e)}, status=500)
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8'))
        except Exception:
            payload = {}

        if parsed.path == '/api/log':
            if payload and 'ip' in payload:
                append_visitor_log({
                    'id': payload.get('id', f'CLI-{int(datetime.utcnow().timestamp()*1000)}'),
                    'timestamp': payload.get('timestamp', datetime.utcnow().isoformat() + 'Z'),
                    'ip': payload['ip'],
                    'location': payload.get('location', 'Unknown'),
                    'isp': payload.get('isp', 'Unknown'),
                    'device': payload.get('device', 'Unknown'),
                    'referrer': payload.get('referrer', 'Direct'),
                    'latency': payload.get('latency', 'N/A')
                })
            self.send_json({'success': True, 'message': 'Logged to persistent ledger'})
            return

        if parsed.path == '/api/contact':
            client_ip = self.get_client_ip()
            entry = {
                **payload,
                'verified_ip': client_ip,
                'received_at': datetime.utcnow().isoformat() + 'Z'
            }
            try:
                contacts = []
                if os.path.exists(CONTACTS_FILE):
                    with open(CONTACTS_FILE, 'r', encoding='utf-8') as f:
                        contacts = json.load(f)
                contacts.insert(0, entry)
                with open(CONTACTS_FILE, 'w', encoding='utf-8') as f:
                    json.dump(contacts, f, indent=2)
            except Exception as e:
                print("Error saving contact:", e)
            self.send_json({'success': True, 'message': 'Contact transmission recorded.'})
            return

        self.send_json({'error': 'Not found'}, status=404)

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', PORT), TelemetryHandler)
    print("==================================================================")
    print("⚡ SOHANA DAS PORTFOLIO & VISITOR IP TELEMETRY SERVER")
    print(f"📡 Local Server URL:  http://localhost:{PORT}")
    print(f"🌐 Network Access:    http://127.0.0.1:{PORT}")
    print(f"📋 Visitor IP Ledger: {LOGS_FILE}")
    print("💡 Zero dependencies required! Press Ctrl+C to stop.")
    print("==================================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
