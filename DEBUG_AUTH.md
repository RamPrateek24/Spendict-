# Google Sign-In Debugging Guide

## Steps to Diagnose the Issue

### 1. Check Browser Console for Errors
1. Open your browser (Chrome/Firefox/Edge)
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Reload the page (`F5`)
5. Look for errors starting with `[AuthContext]` or `[AuthPage]`
6. **Screenshot or copy any errors you see**

### 2. Check Firebase Console Configuration

Go to [Firebase Console](https://console.firebase.google.com) → Your Project "spendict-14c0f":

#### Enable Google Authentication
1. Click **Build** → **Authentication**
2. Click **Get Started** (if needed)
3. In the **Sign-in method** tab, look for **Google**
4. If not enabled: Click Google → Toggle **Enable** → Save
5. Make sure you've set up the **OAuth consent screen**

#### Configure OAuth Consent Screen
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select project "spendict-14c0f"
3. Click **APIs & Services** → **OAuth consent screen**
4. If not configured:
   - Choose **External** user type
   - Fill in required fields (App name: "Spendict")
   - Add your email as test user
   - Complete setup

#### Authorized Domains
1. In Firebase → **Authentication** → **Get Started** (if visible)
2. Look for "Authorized domains"
3. Make sure `localhost:5173` and `localhost:5174` are added
4. If not:
   - Add these domains to the authorized list

### 3. Test Firebase Connection

1. Open your app: `http://localhost:5173`
2. Open **Browser Console** (F12)
3. Paste this command:
```javascript
debugAuthSetup = () => {
  const { auth } = window.__FIREBASE__;
  console.log('Auth:', auth);
  console.log('Current user:', auth.currentUser);
  return auth;
};
debugAuthSetup();
```
4. **Report what it shows**

### 4. Test Google Sign-In Button

1. On the login page, **open Browser Console**
2. Look at logs as you click "Sign in with Google"
3. What happens?
   - [ ] Nothing (button doesn't respond)
   - [ ] Google popup appears briefly then closes
   - [ ] Google popup stays open
   - [ ] Error message appears
   - [ ] Page redirects but blanks out
   - [ ] Loading spinner shows forever

### 5. Common Issues & Fixes

#### Issue: "Pop-up blocked" error
**Fix:** Check browser settings:
- Chrome Settings → Privacy & Security → Cookies → Allowed sites
- Add `localhost:5173` to allowed list

#### Issue: "auth/operation-not-supported-in-this-environment"
**Fix:** Firebase SDK not properly initialized
- Restart dev server: Stop it, run `npm run dev` again

#### Issue: "auth-disabled" error
**Fix:** Google authentication not enabled in Firebase
- Go to Firebase Console → Authentication → Sign-in methods
- Enable Google provider

#### Issue: Loading spinner never stops
**Fix:** Auth state listener not firing
- Look in Console for log messages starting with `[AuthContext]`
- If no logs appear, auth listener might not be set up

#### Issue: Page redirects but content doesn't load
**Fix:** Components rendering before auth is verified
- This is a timing issue - dev improvements added above should help

#### Issue: No Google button in sign-in page
**Fix:** AuthContext not properly provided
- Check that App.tsx wraps with `<AuthProvider>`

### 6. Test Each Component

**In Browser Console, run:**

```javascript
// Check if AuthContext is working
fetch('/').then(r => r.text()).then(html => {
  console.log('App loaded:', html.includes('Spendict'));
});
```

### 7. Restart Everything

If stuck:
```bash
# Stop dev server (Ctrl+C)
npm run dev

# Fresh start (full rebuild)
npm run build
npm run preview
```

---

## Information to Report

If still not working, please provide:

1. **Browser Console output** (copy any `[AuthContext]` or error messages)
2. **Screenshot of Firebase Console** → Authentication section
3. **What happens when you click sign-in button?**
4. **Error messages (if any)**
5. **Try the debugging commands above and report results**

---

## Quick Fix Checklist

- [ ] Google provider enabled in Firebase Console
- [ ] OAuth consent screen configured
- [ ] localhost:5173 in authorized domains
- [ ] Browser dev tools showing `[AuthContext]` logs
- [ ] No JavaScript errors in console
- [ ] Dev server restarted after changes
- [ ] Pop-ups not blocked in browser

---

## Fastest Path to Debug

1. **Open Browser Console (F12)**
2. **Reload page**
3. **Look for any `[Auth]` messages or RED errors**
4. **Report what you see in the console**

This will help identify exactly where the sign-in process is breaking.
