from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
import sys
from pathlib import Path

app = FastAPI()

# Allow requests from React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the directory where this script is located
script_dir = Path(__file__).parent

# Initialize model and vectorizer as None
model = None
vectorizer = None

# Load ML model with better error handling
def load_models():
    global model, vectorizer
    try:
        print(f"Current working directory: {os.getcwd()}", file=sys.stderr)
        print(f"Script directory: {script_dir}", file=sys.stderr)
        print(f"Script file: {__file__}", file=sys.stderr)
        
        # Try different possible paths
        possible_paths = [
            script_dir / "expense_model.pkl",
            Path('backend') / "expense_model.pkl",
            Path('./backend') / "expense_model.pkl",
        ]
        
        model_path = None
        for path in possible_paths:
            if path.exists():
                model_path = path
                print(f"Found model at: {model_path}", file=sys.stderr)
                break
        
        if model_path is None:
            print(f"Model not found in any of: {possible_paths}", file=sys.stderr)
            model_path = script_dir / "expense_model.pkl"  # Use default for error message
        
        possible_vectorizer_paths = [
            script_dir / "vectorizer.pkl",
            Path('backend') / "vectorizer.pkl",
            Path('./backend') / "vectorizer.pkl",
        ]
        
        vectorizer_path = None
        for path in possible_vectorizer_paths:
            if path.exists():
                vectorizer_path = path
                print(f"Found vectorizer at: {vectorizer_path}", file=sys.stderr)
                break
        
        if vectorizer_path is None:
            print(f"Vectorizer not found in any of: {possible_vectorizer_paths}", file=sys.stderr)
            vectorizer_path = script_dir / "vectorizer.pkl"  # Use default for error message
        
        print(f"Loading model from: {model_path}", file=sys.stderr)
        print(f"Loading vectorizer from: {vectorizer_path}", file=sys.stderr)
        
        model = joblib.load(model_path)
        vectorizer = joblib.load(vectorizer_path)
        print("✓ Models loaded successfully!", file=sys.stderr)
    except Exception as e:
        print(f"ERROR loading models: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()

# Load models on startup
load_models()

@app.get("/")
def root():
    return {"message": "Spendict API", "models_loaded": model is not None}

@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": model is not None}

@app.post("/predict")
def predict(data: dict):
    if model is None or vectorizer is None:
        return {"error": "Models not loaded"}
    
    text = data.get("text", "")
    if not text:
        return {"error": "No text provided"}

    try:
        X = vectorizer.transform([text])
        category = model.predict(X)[0]
        return {"category": category}
    except Exception as e:
        print(f"ERROR in prediction: {e}", file=sys.stderr)
        return {"error": str(e)}