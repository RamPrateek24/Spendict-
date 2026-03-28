# Google Authentication Integration Guide

## Overview
Google authentication has been successfully integrated into the Spendict frontend. This document explains the infrastructure and provides instructions for backend integration.

## Frontend Changes Made

### 1. **Firebase Configuration** (`lib/firebase.ts`)
- Added Firebase Auth initialization
- Configured Google Auth Provider
- Exported `auth` and `googleProvider` for use throughout the app

### 2. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- Created `AuthProvider` component to manage global auth state
- Implements `useAuth()` hook for easy access to auth state and methods
- Manages user state, loading, sign-in, and sign-out

### 3. **Auth Components**
- **AuthPage** (`src/components/AuthPage.tsx`): Login page with Google Sign-In button
- **Updated Navbar** (`src/components/Navbar.tsx`): Displays user profile and logout option

### 4. **App Routing** (`src/App.tsx`)
- Wraps app with `AuthProvider`
- Shows `AuthPage` when user is not authenticated
- Shows main app when user is authenticated

### 5. **Authenticated API Helper** (`src/utils/api.ts`)
- `authenticatedFetch()`: Makes requests with Firebase ID tokens
- Automatically includes `Authorization: Bearer {token}` header
- Ready to use for all backend API calls

## Backend Integration Steps

### Step 1: Install Firebase Admin SDK
```bash
pip install firebase-admin
```

### Step 2: Update `backend/api.py`

Add authentication middleware to validate Firebase tokens:

```python
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthCredentials
import firebase_admin
from firebase_admin import credentials, auth
import joblib
import os
from pathlib import Path

# Initialize Firebase Admin SDK
# Download your service account key from Firebase Console
# Go to: Project Settings > Service Accounts > Generate New Private Key
cred = credentials.Certificate("path/to/your/serviceAccountKey.json")
firebase_admin.initialize_app(cred)

app = FastAPI()

# Allow requests from React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme for bearer tokens
security = HTTPBearer()

# Load ML model
script_dir = Path(__file__).parent
model = joblib.load(script_dir / "expense_model.pkl")
vectorizer = joblib.load(script_dir / "vectorizer.pkl")

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)):
    """
    Verify Firebase ID token
    """
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication credentials: {str(e)}")

@app.post("/predict")
async def predict(data: dict, user = Depends(verify_token)):
    """
    Predict expense category with user authentication
    
    Args:
        data: Dictionary containing 'text' field
        user: Authenticated user (automatically verified via Depends)
    
    Returns:
        Category prediction for the expense
    """
    text = data.get("text")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text field is required")
    
    X = vectorizer.transform([text])
    category = model.predict(X)[0]
    
    return {
        "category": category,
        "user_id": user['uid'],  # Can now track expenses per user
    }

@app.get("/user/profile")
async def get_user_profile(user = Depends(verify_token)):
    """
    Get authenticated user's profile
    """
    return {
        "uid": user['uid'],
        "email": user['email'],
    }

# Health check endpoint (no auth required)
@app.get("/health")
async def health_check():
    return {"status": "ok"}
```

### Step 3: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (spendict-14c0f)
3. Go to Settings (gear icon) > Project Settings
4. Click "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save the JSON file to your `backend/` directory
7. Update the path in `api.py` accordingly

### Step 4: Update Backend for User-Specific Data

Now that you have authentication, you can:

```python
from sqlalchemy import Column, String, create_engine, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session

# Example: Store expenses per user
class UserExpense(Base):
    __tablename__ = "user_expenses"
    
    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.uid"))  # Firebase UID
    merchant = Column(String)
    amount = Column(Float)
    category = Column(String)
    date = Column(DateTime)

@app.post("/expenses")
async def save_expense(expense: ExpenseData, user = Depends(verify_token)):
    """Save expense for authenticated user"""
    # Save with user['uid'] as the user identifier
    pass

@app.get("/expenses")
async def get_user_expenses(user = Depends(verify_token)):
    """Get all expenses for authenticated user"""
    # Query by user['uid']
    pass
```

### Step 5: Frontend Usage

In your React components, use the authenticated API helper:

```typescript
import { authenticatedFetch, parseAuthenticatedResponse } from '../utils/api'

// In your component:
async function predictCategory(text: string) {
  try {
    const response = await authenticatedFetch('/predict', 'POST', { text })
    const result = await parseAuthenticatedResponse(response)
    console.log('Category:', result.category)
  } catch (error) {
    console.error('Prediction failed:', error)
  }
}
```

## Testing

### Run Backend
```bash
cd backend
uvicorn api:app --reload
```

### Test Authentication Flow
1. Start the frontend: `npm run dev`
2. You should see the Google Sign-In page
3. Click "Sign in with Google"
4. After authentication, you'll see the main app
5. The Navbar will show your profile picture and name
6. API calls will automatically include your auth token

## Security Notes

- ✅ Firebase handles password security
- ✅ Tokens are verified server-side
- ✅ User sessions persist across page reloads
- ⚠️ Keep serviceAccountKey.json private (add to .gitignore)
- ⚠️ Use HTTPS in production
- ⚠️ Set proper CORS origins (not "*")

## Troubleshooting

### "Invalid authentication credentials"
- Check that serviceAccountKey.json is correctly loaded
- Verify the Firebase project ID matches

### Google Sign-In not appearing
- Ensure Firebase is properly initialized
- Check browser console for errors
- Verify Google OAuth consent screen is configured

### CORS errors
- Update `allow_origins` in FastAPI CORS middleware
- Include your production domain when deploying

## Next Steps

1. ✅ Frontend authentication is ready to use
2. 📝 Update backend with Firebase Admin SDK
3. 🔒 Implement user-specific data storage
4. 🚀 Deploy to production with proper configuration
