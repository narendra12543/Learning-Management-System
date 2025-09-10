# OTP Email Verification System

## Overview
This system implements secure email verification using 6-digit OTP codes for traditional email/password registrations, while bypassing verification for social media logins.

## Features
- ✅ 6-digit OTP generation and validation
- ✅ 10-minute OTP expiration
- ✅ Resend OTP functionality (after 1 minute)
- ✅ Professional email templates
- ✅ Welcome email after verification
- ✅ Social media login bypass
- ✅ Auto-focus OTP input fields

## Backend Implementation

### Database Schema
```javascript
// User Model additions
emailVerificationOTP: { type: String },
emailVerificationOTPExpires: { type: Date },
isEmailVerified: { type: Boolean, default: false },
socialMediaLogin: { type: Boolean, default: false }
```

### API Endpoints
```
POST /api/v1/auth/register     - Register with OTP
POST /api/v1/auth/verify-otp   - Verify OTP code
POST /api/v1/auth/resend-otp   - Resend new OTP
POST /api/v1/auth/login        - Login (checks verification)
```

### Email Templates
- `otp-verification.html` - OTP verification email
- `welcome-email.html` - Welcome email after verification

## Frontend Implementation

### Components
- `OTPVerification.jsx` - OTP input component with timer
- Updated `Signup.jsx` - Integrated OTP flow

### User Flow
1. User registers → OTP sent to email
2. User enters 6-digit OTP → Email verified
3. Welcome email sent → Redirect to dashboard

## Usage

### Registration Flow
```javascript
// 1. User submits registration form
const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  body: JSON.stringify(userData)
});

// 2. If needsOTPVerification: true, show OTP screen
if (data.needsOTPVerification) {
  setShowOTPVerification(true);
}
```

### OTP Verification
```javascript
// Verify OTP
const response = await fetch('/api/v1/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify({ email, otp: '123456' })
});
```

### Resend OTP
```javascript
// Resend new OTP
const response = await fetch('/api/v1/auth/resend-otp', {
  method: 'POST',
  body: JSON.stringify({ email })
});
```

## Configuration

### Environment Variables
```env
# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Email Service Setup
1. Enable 2FA on Gmail
2. Generate App Password
3. Configure SMTP settings

## Security Features
- OTP expires in 10 minutes
- Rate limiting on OTP requests
- Secure OTP generation using crypto.randomBytes
- Email validation before OTP sending
- Social login bypass for verified accounts

## Error Handling
- Invalid OTP → Clear input fields
- Expired OTP → Show resend option
- Network errors → User-friendly messages
- Rate limiting → Prevent spam

## Testing
```bash
# Test OTP generation
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456",...}'

# Test OTP verification
curl -X POST http://localhost:5000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

## File Structure
```
backend/
├── controllers/authController.js    # OTP logic
├── models/User.js                   # User schema
├── services/emailService.js         # Email functions
├── templates/
│   ├── otp-verification.html        # OTP email
│   └── welcome-email.html           # Welcome email
└── routes/authRoutes.js             # API routes

frontend/
├── components/Auth/
│   └── OTPVerification.jsx          # OTP component
└── pages/Auth/Signup.jsx            # Updated signup
```

## Customization
- Modify OTP length in `authController.js`
- Change expiration time (default: 10 minutes)
- Update email templates for branding
- Customize resend delay (default: 1 minute)

## Troubleshooting
- **OTP not received**: Check spam folder, verify SMTP settings
- **OTP expired**: Use resend functionality
- **Email service errors**: Verify app password and SMTP config
- **Frontend errors**: Check API URL configuration