import json
import joblib
from pathlib import Path
from http.server import BaseHTTPRequestHandler

# Get the directory where this script is located
api_dir = Path(__file__).parent.parent / "backend"

# Load ML model
try:
    model = joblib.load(api_dir / "expense_model.pkl")
    vectorizer = joblib.load(api_dir / "vectorizer.pkl")
except FileNotFoundError as e:
    print(f"Warning: Model files not found: {e}")
    model = None
    vectorizer = None


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        """Handle POST requests"""
        
        # Set CORS headers
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            data = json.loads(body)
            text = data.get("text", "")
            
            if not text:
                self.wfile.write(json.dumps({"error": "No text provided"}).encode())
                return
            
            if model is None or vectorizer is None:
                self.wfile.write(json.dumps({"error": "Model not loaded"}).encode())
                return
            
            X = vectorizer.transform([text])
            category = model.predict(X)[0]
            
            self.wfile.write(json.dumps({"category": category}).encode())
        except Exception as e:
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        """Handle GET requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "ok"}).encode())
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
