import json
import joblib
from pathlib import Path

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


def handler(request):
    """Vercel serverless function handler"""
    
    # Handle CORS
    if request.method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
        }
    
    # Handle GET /health
    if request.method == "GET":
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            "body": json.dumps({"status": "ok"}),
        }
    
    # Handle POST /predict
    if request.method == "POST":
        try:
            body = json.loads(request.body)
            text = body.get("text", "")
            
            if not text:
                return {
                    "statusCode": 400,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json",
                    },
                    "body": json.dumps({"error": "No text provided"}),
                }
            
            if model is None or vectorizer is None:
                return {
                    "statusCode": 500,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "application/json",
                    },
                    "body": json.dumps({"error": "Model not loaded"}),
                }
            
            X = vectorizer.transform([text])
            category = model.predict(X)[0]
            
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                "body": json.dumps({"category": category}),
            }
        except Exception as e:
            return {
                "statusCode": 500,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                "body": json.dumps({"error": str(e)}),
            }
    
    return {
        "statusCode": 405,
        "body": json.dumps({"error": "Method not allowed"}),
    }
