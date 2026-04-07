import os
import requests
from flask import Flask, request, send_from_directory, jsonify, Response

app = Flask(__name__, static_folder='.')

# Configurable Webhook Endpoints
TARGET_URLS = {
    "process_doc": "https://n8n.cognigenai.in/webhook/0577d629-452d-45d5-ba0a-260934fcc50e",
    "eligibility": "https://n8n.cognigenai.in/webhook/299f8076-3169-4b30-99d7-66b25015088b",
    "other_policies": "https://test-n8n.zynd.ai/webhook/1cf41349-c5de-4ed3-8be9-e764406dc28e/pay"
}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/proxy', methods=['POST', 'OPTIONS'])
def proxy():
    if request.method == 'OPTIONS':
        return Response(status=204)

    target_key = request.args.get('target', 'eligibility')
    target_url = TARGET_URLS.get(target_key, TARGET_URLS["eligibility"])
    
    # Forward query parameters (except 'target')
    forward_params = {k: v for k, v in request.args.items() if k != 'target'}
    
    # Note: Headers are re-filtered inside the proxy logic below

    print(f"\n✦ [PROXY] Forwarding {target_key} -> {target_url}")
    print(f"  [DEBUG] Method: {request.method}, Content-Type: {request.content_type}")

    try:
        # Transparently forward headers (excluding Host and Content-Length)
        headers = {key: value for (key, value) in request.headers if key.lower() not in ['host', 'content-length']}
        
        # FORCE uncompressed response from n8n to avoid decoding issues
        headers['Accept-Encoding'] = 'identity'
        
        print(f"  [DEBUG] Preparing to send request to n8n...")
        raw_body = request.get_data()
        print(f"  [DEBUG] Raw body size: {len(raw_body)} bytes")
        
        import time
        start_time = time.time()
        
        # Forward the raw data from the request
        resp = requests.post(
            target_url,
            params=forward_params,
            data=raw_body,
            headers=headers,
            timeout=180 
        )
        
        end_time = time.time()
        # Handle potential decompression
        content = resp.content
        
        print(f"  [DEBUG] n8n took {end_time - start_time:.2f} seconds to respond")
        print(f"  [DEBUG] Response Status: {resp.status_code}")
        print(f"  [DEBUG] Upstream Headers: {dict(resp.headers)}")
        
        if resp.status_code >= 400:
            print(f"  [CRITICAL] n8n Error: {resp.status_code}")
            return Response(resp.content, resp.status_code, [('Content-Type', 'application/json')])

        # Hex Trace for encoding diagnosis
        hex_trace = content[:20].hex(' ')
        print(f"  [DEBUG] Hex Trace (First 20 bytes): {hex_trace}")
        
        # Requests .text property automatically decompresses/decodes
        decoded_text = resp.text
        print(f"  [DEBUG] Body Preview: {decoded_text[:200]}...")

        # Explicitly handle encoding for text responses
        is_json = 'application/json' in resp.headers.get('Content-Type', '').lower()
        
        # Exclude hop-by-hop headers and encoding headers (requests decompresses automatically)
        excluded_resp_headers = {'content-encoding', 'content-length', 'transfer-encoding', 'connection', 'keep-alive'}
        resp_headers = [(name, value) for (name, value) in resp.headers.items()
                       if name.lower() not in excluded_resp_headers]

        if is_json or decoded_text.strip().startswith(('{', '[')):
            # Force UTF-8 for JSON responses back to the browser
            body = decoded_text.encode('utf-8')
            resp_headers = [(n, v) for (n, v) in resp_headers if n.lower() != 'content-type']
            resp_headers.append(('Content-Type', 'application/json; charset=utf-8'))
        else:
            body = resp.content

        return Response(body, resp.status_code, resp_headers)
        
    except requests.exceptions.RequestException as e:
        print(f"  [CRITICAL] Proxy Network Error: {str(e)}")
        return jsonify({"error": "n8n connection failed", "details": str(e)}), 502
    except Exception as e:
        import traceback
        print(f"  [CRITICAL] Proxy Code Crash!")
        traceback.print_exc()
        return jsonify({"error": "Internal Proxy Error", "details": str(e)}), 500

@app.route('/<path:path>')
def static_proxy(path):
    return send_from_directory('.', path)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8001))
    app.run(host='0.0.0.0', port=port)
