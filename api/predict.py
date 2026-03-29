from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import os
from pathlib import Path

app = FastAPI()

# Allow requests from React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/predict")
def predict(data: dict):
    if model is None or vectorizer is None:
        return {"error": "Model not loaded"}
    
    text = data.get("text", "")
    if not text:
        return {"error": "No text provided"}

    try:
        X = vectorizer.transform([text])
        category = model.predict(X)[0]
        return {"category": category}
    except Exception as e:
        return {"error": str(e)}


@app.get("/health")
def health():
    return {"status": "ok"}
