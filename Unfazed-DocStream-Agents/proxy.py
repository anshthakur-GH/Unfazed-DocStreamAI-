"""
proxy.py — Local CORS proxy for Unfazed Policy Navigator
Runs on http://localhost:8001/proxy
Forwards POST requests to https://n8n.cognigenai.in/webhook/...
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import urllib.request
import urllib.error
import json
import urllib.parse

# Configurable Webhook Endpoints
TARGET_URLS = {
    "process_doc": "https://test-n8n.zynd.ai/webhook/979cfe28-657f-4314-b806-5d7df0c989c9/pay",
    "eligibility": "https://test-n8n.zynd.ai/webhook/299f8076-3169-4b30-99d7-66b25015088b",
    "other_policies": "https://test-n8n.zynd.ai/webhook/1cf41349-c5de-4ed3-8be9-e764406dc28e/pay"
}

CORS_HEADERS = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-ID",
}


class ProxyHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        print(f"[proxy] {self.address_string()} – {format % args}")

    def send_cors_headers(self):
        for key, val in CORS_HEADERS.items():
            self.send_header(key, val)

    # ── Handle browser preflight ───────────────────────────────────────────────
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_cors_headers()
        self.end_headers()

    # ── Proxy POST to n8n ──────────────────────────────────────────────────────
    def do_POST(self):
        length    = int(self.headers.get("Content-Length", 0))
        body      = self.rfile.read(length) if length else b""
        ctype     = self.headers.get("Content-Type", "application/octet-stream")
        
        # Determine target from query parameter
        parsed_path = urllib.parse.urlparse(self.path)
        query = urllib.parse.parse_qs(parsed_path.query)
        target_key = query.get('target', ['eligibility'])[0]
        
        # Build forward query string (everything except 'target')
        forward_query = {k: v[0] for k, v in query.items() if k != 'target'}
        
        target_url = TARGET_URLS.get(target_key, TARGET_URLS["eligibility"])
        if forward_query:
            sep = "&" if "?" in target_url else "?"
            target_url += f"{sep}{urllib.parse.urlencode(forward_query)}"
            
        print(f"   Forwarding to: {target_url} (Key: {target_key})")

        # Build the forwarded request
        req = urllib.request.Request(target_url, data=body, method="POST")
        req.add_header("Content-Type", ctype)
        
        # Forward all X- headers
        for h, v in self.headers.items():
            if h.lower().startswith("x-"):
                req.add_header(h, v)

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                status       = resp.status
                resp_body    = resp.read()
                resp_ctype   = resp.headers.get("Content-Type", "application/json")
        except urllib.error.HTTPError as e:
            status     = e.code
            resp_body  = e.read()
            resp_ctype = "application/json"
            print(f"   [Error] n8n returned {status}")
            try:
                # Print a bit of the error body to terminal for debugging
                err_text = resp_body.decode('utf-8', errors='ignore')
                print(f"   [Error Body] {err_text[:500]}...")
            except: pass
        except Exception as e:
            print(f"   [Exception] {str(e)}")
            self.send_response(502)
            self.send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        self.send_response(status)
        self.send_cors_headers()
        self.send_header("Content-Type", resp_ctype)
        self.send_header("Content-Length", str(len(resp_body)))
        self.end_headers()
        self.wfile.write(resp_body)


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8001), ProxyHandler)
    print("✦  Unfazed Policy Navigator — CORS Proxy")
    print("   Listening on  http://localhost:8001")
    print("   Forwarding to n8n webhooks...")
    print("   Press Ctrl+C to stop\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nProxy stopped.")
