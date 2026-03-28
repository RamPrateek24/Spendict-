# Google Authentication - Quick Start Guide

## What's Been Set Up ✅

### Frontend Changes
1. **Firebase Auth Integration** - Google OAuth provider configured
2. **Auth Context** - Global state management for authenticated user
3. **Auth Page Component** - Beautiful login screen with Google Sign-In button
4. **Dynamic Navigation** - Navbar shows user profile and logout option
5. **Authenticated API Calls** - Helper functions to send auth tokens with requests
6. **Protected Routes** - App only accessible after authentication

### New Files Created
- `src/contexts/AuthContext.tsx` - Authentication state & logic
- `src/components/AuthPage.tsx` - Login page UI
- `src/utils/api.ts` - Authenticated API fetch helper
- `AUTHENTICATION_GUIDE.md` - Comprehensive backend integration guide

### Files Updated
- `lib/firebase.ts` - Added Auth initialization
- `src/App.tsx` - Added auth routing and provider
- `src/components/Navbar.tsx` - Added user profile & logout
- `src/types/index.ts` - Added auth-related types
- `src/utils/predictCategory.ts` - Updated to use authenticated calls

## Testing the Frontend Setup

### 1. Start your app
```bash
npm run dev
```

### 2. You should see:
- ✅ A login page with Google Sign-In button
- ✅ Background effects and Spendict branding
- ✅ A smooth sign-up/login experience

### 3. After signing in:
- ✅ Main app loads with your profile in navbar
- ✅ User profile picture and name displayed
- ✅ "Sign Out" option in user dropdown menu
- ✅ Your session persists on page reload

## Backend Integration - Next Steps 📝

To make your API calls work with authentication:

### 1. Install Firebase Admin SDK
```bash
cd backend
pip install firebase-admin
```

### 2. Get Firebase Service Account Key
- Go to Firebase Console → Project Settings → Service Accounts
- Click "Generate New Private Key"
- Save as `backend/serviceAccountKey.json`

### 3. Update `backend/api.py`
See `AUTHENTICATION_GUIDE.md` for the complete updated backend code

### 4. Restart Backend
```bash
# In a new terminal
cd backend
uvicorn api:app --reload
```

## Frontend Features Ready to Use

### Authentication Hook
```typescript
import { useAuth } from '@/contexts/AuthContext'

function MyComponent() {
  const { user, signOut, loading } = useAuth()
  
  return (
    <div>
      {user && <span>Welcome, {user.displayName}</span>}
      {loading && <span>Loading...</span>}
    </div>
  )
}
```

### Authenticated API Calls
```typescript
import { authenticatedFetch, parseAuthenticatedResponse } from '@/utils/api'

// Make authenticated requests
const response = await authenticatedFetch('/predict', 'POST', { text: 'Your text' })
const data = await parseAuthenticatedResponse(response)
```

## Security Features ✅

- ✅ Passwords handled by Google (never stored by you)
- ✅ Firebase tokens verified server-side
- ✅ Session persistence across page reloads
- ✅ Automatic token refresh
- ✅ User data isolated per account

## Troubleshooting

### "Google Sign-In button not showing"
- Check browser console for errors
- Ensure `npm install` completed successfully
- Verify Firebase config in `lib/firebase.ts` is loaded

### "After signin, page shows loading spinner"
- This is likely because backend doesn't have auth yet
- Complete the "Backend Integration" steps above

### "Backend returns 401 Unauthorized"
- Backend hasn't been updated with Firebase Admin SDK
- Follow steps in AUTHENTICATION_GUIDE.md

## Need More Help?

1. **Read**: `AUTHENTICATION_GUIDE.md` - Full backend integration guide
2. **Reference**: Check `src/contexts/AuthContext.tsx` for the auth implementation
3. **Example**: Look at `src/components/AuthPage.tsx` for login UI pattern

## What's Next?

1. ✅ Frontend auth is complete
2. 📝 Update backend with Firebase Admin SDK
3. 🔒 Implement user-specific data storage
4. 🚀 Deploy with proper Firebase configuration
5. 📊 Add dashboard to track user expenses

---

**Your app is now authentication-ready!** 🎉

The frontend will automatically redirect unauthenticated users to the login page and show the main app after they sign in with Google.
