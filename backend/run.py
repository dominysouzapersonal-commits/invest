"""Wrapper to capture startup errors and show them via HTTP if the app crashes."""
import os
import sys
import traceback

PORT = int(os.environ.get("PORT", 10000))

try:
    print(f"Python {sys.version}", flush=True)
    print(f"PORT={PORT}", flush=True)
    print("Importing app...", flush=True)
    from app.main import app
    print("Import OK. Starting uvicorn...", flush=True)
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
except Exception:
    error = traceback.format_exc()
    print(f"STARTUP ERROR:\n{error}", flush=True)

    from http.server import HTTPServer, BaseHTTPRequestHandler

    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(500)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"STARTUP ERROR:\n\n{error}".encode())

    print(f"Error server on port {PORT}", flush=True)
    HTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
