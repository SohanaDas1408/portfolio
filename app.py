"""
SOHANA DAS - SELF-HOSTED PYTHON FLASK SERVER
Captures real-time visitor IP, persists logs to logs/visitors.json, and serves the portfolio.
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGS_DIR = os.path.join(BASE_DIR, 'logs')
LOGS_FILE = os.path.join(LOGS_DIR, 'visitors.json')
CONTACTS_FILE = os.path.join(LOGS_DIR, 'contacts.json')

os.makedirs(LOGS_DIR, exist_ok=True)
if not os.path.exists(LOGS_FILE):
    with open(LOGS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

def get_client_ip():
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.remote_addr or '127.0.0.1'

def append_visitor_log(entry):
    try:
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
    except Exception:
        logs = []
    logs.insert(0, entry)
    logs = logs[:1000]
    with open(LOGS_FILE, 'w', encoding='utf-8') as f:
        json.dump(logs, f, indent=2)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/api/visitor', methods=['GET'])
def get_visitor():
    ip = get_client_ip()
    user_agent = request.headers.get('User-Agent', 'Unknown')
    telemetry = {
        'ip': ip,
        'city': 'Flask Ingress Node',
        'region': 'Network Layer',
        'country': 'Detected Client',
        'country_code': 'IN',
        'isp': 'Flask Engine / Gateway',
        'asn': 'AS-PYTHON',
        'userAgent': user_agent,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    append_visitor_log({
        'id': f'PY-{int(datetime.utcnow().timestamp()*1000)}',
        'timestamp': telemetry['timestamp'],
        'ip': ip,
        'location': 'Server Node',
        'isp': telemetry['isp'],
        'device': user_agent,
        'referrer': request.headers.get('Referer', 'Direct Entry')
    })
    return jsonify(telemetry)

@app.route('/api/log', methods=['POST'])
def save_log():
    data = request.get_json(silent=True) or {}
    if data and 'ip' in data:
        append_visitor_log({
            'id': data.get('id', f'CLI-{int(datetime.utcnow().timestamp()*1000)}'),
            'timestamp': data.get('timestamp', datetime.utcnow().isoformat() + 'Z'),
            'ip': data['ip'],
            'location': data.get('location', 'Unknown'),
            'isp': data.get('isp', 'Unknown'),
            'device': data.get('device', 'Unknown'),
            'referrer': data.get('referrer', 'Direct'),
            'latency': data.get('latency', 'N/A')
        })
    return jsonify({'success': True, 'message': 'Logged to Flask ledger'})

@app.route('/api/logs', methods=['GET'])
def get_logs():
    try:
        with open(LOGS_FILE, 'r', encoding='utf-8') as f:
            logs = json.load(f)
        return jsonify({
            'total': len(logs),
            'unique_ips': len(set(l.get('ip') for l in logs)),
            'logs': logs
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or {}
    ip = get_client_ip()
    entry = {
        **data,
        'verified_ip': ip,
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
        print('Error saving contact:', e)
    return jsonify({'success': True, 'message': 'Contact inquiry logged.'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print('===================================================')
    print(f'🐍 SOHANA DAS PYTHON FLASK PORTFOLIO SERVER')
    print(f'📡 Live at: http://127.0.0.1:{port}')
    print(f'📋 Visitor IP Ledger: {LOGS_FILE}')
    print('===================================================')
    app.run(host='0.0.0.0', port=port, debug=False)
