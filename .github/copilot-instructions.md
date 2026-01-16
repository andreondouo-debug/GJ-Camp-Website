# GJ Camp Website - AI Coding Agent Instructions

## Project Overview
Production MERN application for youth church camp ("Génération Josué") with role-based authentication, PayPal payments, email verification, camp registration, activities tracking, PWA capabilities, and admin dashboards. **ALL code must be in French** - user messages, console logs, comments, variable names.

## Critical Architecture Context

### Stack & Deployment
- **Backend**: Node.js + Express + MongoDB (Mongoose) → **Render** (https://gj-camp-backend.onrender.com)
- **Frontend**: React 18 + React Router v6 + Axios → **Vercel** (https://gjsdecrpt.fr)
- **Database**: MongoDB Atlas Cloud (production: `gj-camp-prod`)
- **Storage**: Cloudinary (profile photos)
- **Payments**: PayPal SDK (sandbox mode by default)
- **Email**: Brevo API (production) or Ethereal (dev)
- **PWA**: Service worker + manifest.json for installable app

### Directory Structure
```
backend/src/
  ├── controllers/     # authController, registrationController, userController, payoutController
  ├── models/          # User, Registration, Activity, Post, Campus, Payout, Settings, TransactionLog
  ├── routes/          # authRoutes, registrationRoutes, userRoutes, activitiesRoutes, etc.
  ├── middleware/      # auth.js, authorize.js, requireVerifiedEmail.js, requireCampRegistration.js
  ├── constants/       # roles.js (ROLES array, ADMIN_ROLES, MANAGEMENT_ROLES)
  └── config/          # db.js, email-brevo-api.js, paypal.js

frontend/src/
  ├── pages/           # 35 pages (HomePage, ProfilePage, RegistrationDashboard, UserManagementPage)
  ├── components/      # Header, Footer, Carousel, GuardedRoute, DynamicBackground
  ├── context/         # AuthContext (user, token, login, signup, logout, refreshUser)
  └── styles/          # App.css, variables.css (design system with CSS custom properties)
```

## Development Workflow

### Running Locally
```bash
# Terminal 1 - Backend
cd backend && npm run dev  # → http://localhost:5000 (nodemon watches for changes)

# Terminal 2 - Frontend  
cd frontend && npm start   # → http://localhost:3000 (proxies API to :5000)
```

### Environment Variables (Backend `.env`)
```env
# Core
MONGODB_URI=mongodb://localhost:27017/gj-camp  # Local dev
JWT_SECRET=<64+ char strong secret>
FRONTEND_URL=http://localhost:3000

# Email (choose one)
EMAIL_SERVICE=brevo  # or 'gmail', 'sendgrid'
BREVO_API_KEY=<key>

# PayPal
PAYPAL_CLIENT_ID=<sandbox_id>
PAYPAL_CLIENT_SECRET=<sandbox_secret>
PAYPAL_MODE=sandbox  # 'sandbox' or 'live'

# Cloudinary
CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>
```

### Docker Quick Start
```bash
docker-compose up -d          # Starts MongoDB, backend, frontend
docker-compose logs -f        # Follow logs
docker-compose down --volumes # Clean shutdown
```

## Authentication & Authorization

### Role-Based Access Control (RBAC)
Defined in `backend/src/constants/roles.js`:
- **utilisateur**: Default role (basic access)
- **referent**: Campus referent (can manage their campus)
- **responsable**: Manager (access to registrations, activities)
- **admin**: Full access (user management, system settings)

Role groups:
- `MANAGEMENT_ROLES`: ['referent', 'responsable', 'admin']
- `ADMIN_ROLES`: ['responsable', 'admin']
- `SUPER_ADMIN_ROLES`: ['admin']

### Auth Middleware Chain
```javascript
// Example protected route pattern
router.get('/endpoint', 
  auth,                          // Validates JWT, attaches req.user.userId
  requireVerifiedEmail,          // Checks isEmailVerified: true
  authorize(...ADMIN_ROLES),     // Checks role in allowed list
  controller.method
);
```

### JWT Token Flow
1. Login/Signup → `authController.generateToken()` creates JWT (7-day expiry)
2. Frontend stores in localStorage: `token`, `user` object
3. AuthContext provides global state: `{ user, token, login(), logout(), refreshUser() }`
4. API requests include: `Authorization: Bearer ${token}`
5. Backend `auth.js` middleware verifies token, attaches `req.user = { userId, role, isEmailVerified, firstName, lastName }`

### Email Verification
- Signup → User created with `isEmailVerified: false`
- `User.generateEmailVerificationToken()` → hashed token + 24h expiry in DB
- Email sent via `sendVerificationEmail(email, firstName, plainToken)`
- Click link → `GET /api/auth/verify-email/:token` → sets `isEmailVerified: true`
- Use `requireVerifiedEmail` middleware to block unverified users from sensitive routes

## Key Models & Relationships

### User Model (`backend/src/models/User.js`)
```javascript
{
  firstName, lastName, email, password (hashed),
  role: 'utilisateur' | 'referent' | 'responsable' | 'admin',
  isEmailVerified: Boolean,
  emailVerificationToken, emailVerificationExpires,
  passwordResetToken, passwordResetExpires,
  phoneNumber, ministryRole, bio, churchWebsite, socialLinks,
  profilePhoto: { url, publicId },  // Cloudinary
  selectedActivities: [ObjectId],   // refs Activity
  selectedCreneaux: { creneauId: activityId },
  isActive: Boolean,  // Account suspension
  lastLoginAt, emailVerifiedAt
}
```

### Registration Model (`backend/src/models/Registration.js`)
```javascript
{
  user: ObjectId (ref User),
  isGuest: Boolean,  // True if registered by another user
  registeredBy: ObjectId,
  firstName, lastName, email, sex, dateOfBirth, address, phone,
  campus: ObjectId (ref Campus),
  amountPaid: Number,  // 20€ minimum, 120€ total
  amountRemaining: Number,
  paymentMethod: 'paypal' | 'cash' | 'mixed',
  paypalTransactionId, cashPaymentReceivedBy,
  status: 'pending' | 'partial' | 'completed' | 'cancelled',
  selectedActivities: [{ activity: ObjectId, selectedAt: Date }],
  consent: { privacyPolicy: Boolean, photoRelease: Boolean, codeOfConduct: Boolean }
}
```

### Activity Model (`backend/src/models/Activity.js`)
```javascript
{
  title, description, category, creneauId,
  capacity: Number,
  currentParticipants: Number,
  participants: [{ user: ObjectId, registeredAt: Date }],
  isActive: Boolean
}
```

## Payment Integration (PayPal)

### Configuration
- Backend: PayPal SDK in `backend/src/config/paypal.js`
- Frontend: `@paypal/react-paypal-js` with `<PayPalScriptProvider>`
- Test mode: Set `PAYPAL_MODE=sandbox`, use sandbox credentials
- Production: Set `PAYPAL_MODE=live`, use live credentials

### Payment Flow
1. User submits registration form → creates Registration with `status: 'pending'`
2. PayPal button rendered with amount (20€ minimum)
3. User completes payment → frontend gets `transactionId`
4. Frontend calls `POST /api/registrations/confirm-payment` with `{ transactionId, registrationId }`
5. Backend verifies with PayPal API, updates Registration status

### Cash Payments
- Admin marks registration as cash payment in `CashPaymentsManagement.js`
- Sets `paymentMethod: 'cash'`, `cashPaymentReceivedBy: adminUserId`
- Admin can create `Payout` entries to redistribute funds to campuses

## Design System & Styling

### CSS Variables (`frontend/src/styles/variables.css`)
```css
:root {
  /* Primary Colors */
  --color-primary: #a01e1e;          /* GJ Red */
  --color-secondary: #d4af37;         /* Gold */
  --color-dark-blue: #001a4d;         /* Footer */
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  /* Spacing System */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

**Always import variables first**: `@import './variables.css';` at top of component CSS.

### Emoji Convention
- Use extensively in logs and UI: 🚀✅❌⚠️📧💳🎉
- Server startup: `console.log('🚀 Serveur démarré sur le port ${PORT}')`
- Success responses: `{ message: '✅ Inscription réussie !' }`

## Common Patterns & Tasks

### Adding a Protected Admin Route
```javascript
// Backend route
const authorize = require('../middleware/authorize');
const { ADMIN_ROLES } = require('../constants/roles');

router.post('/admin-action', 
  auth, 
  requireVerifiedEmail,
  authorize(...ADMIN_ROLES), 
  controller.adminMethod
);

// Frontend GuardedRoute
<Route path="/admin" element={
  <GuardedRoute requiredRole="admin">
    <AdminPage />
  </GuardedRoute>
} />
```

### Using AuthContext in Components
```javascript
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, token, isAuthenticated, logout, refreshUser } = useContext(AuthContext);
  
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  // Make authenticated API call
  const fetchData = async () => {
    const response = await axios.get(`${API_URL}/api/endpoint`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  };
}
```

### Handling Form Validation Errors
```javascript
// Backend (express-validator)
const { body, validationResult } = require('express-validator');

const validation = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court')
];

router.post('/signup', validation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: errors.array().map(err => err.msg).join(', ') 
    });
  }
  // ...
});
```

### Working with Cloudinary Uploads
```javascript
// Backend middleware chain
const { profilePhotoUpload, uploadProfilePhotoToCloudinary } = require('../middleware/profilePhotoUpload');

router.post('/upload-photo', 
  auth, 
  profilePhotoUpload,              // Multer handles multipart/form-data
  uploadProfilePhotoToCloudinary,  // Uploads to Cloudinary, adds req.cloudinaryResult
  authController.uploadPhoto       // Saves URL to User model
);

// Frontend form
const formData = new FormData();
formData.append('profilePhoto', file);

await axios.post(`${API_URL}/api/auth/upload-photo`, formData, {
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});
```

## Testing & Health Checks

### Backend Health Endpoint
```bash
curl http://localhost:5000/api/health
# → {"message":"✅ Backend fonctionnel"}
```

### Test Email Configuration
```bash
cd backend
node test-email.js  # Sends test email, logs preview URL for Ethereal
```

### Production Deployment Checklist
1. Update `REACT_APP_API_URL` in Vercel to point to Render backend URL
2. Update `FRONTEND_URL` in Render to allow CORS from domain (e.g., `https://gjsdecrpt.fr`)
3. Set strong `JWT_SECRET` (64+ chars) in production
4. Switch PayPal to live mode if accepting real payments
5. Configure production MongoDB Atlas IP whitelist
6. Test key flows: signup → email verify → login → registration → payment

## Project-Specific Notes

### Legacy Code
- `my-web-page/` is old static HTML - **ignore**, main app is in `frontend/`

### Documentation Files
- `ETAT_PROJET_12JAN2026.md`: Latest production status report
- `PRODUCTION_CHECKLIST.md`: Deployment verification steps
- `DEPLOIEMENT_GUIDE.md`: Step-by-step deployment instructions
- `PWA_GUIDE.md`: Progressive Web App setup details
- `PAYPAL_INTEGRATION.md`: Payment integration guide

### API Proxy Configuration
Frontend proxies API calls in dev via `"proxy": "http://localhost:5000"` in `frontend/package.json`. In production, use full URL via `REACT_APP_API_URL` env var.

### PWA Features
- Manifest at `frontend/public/manifest.json`
- Service worker at `frontend/public/service-worker.js`
- Installable on mobile/desktop with offline support
- Icons: `logo-192.png`, `logo-512.png` in `frontend/public/images/`

### Cache Management (Version-Based)
- **System**: Cache invalidation based on `package.json` version + build date
- **Auto-Update**: `update-sw-version.js` runs automatically on build
- **Format**: `v0.1.0-2026-01-16` (version-date)
- **Deployment**: Increment version in `package.json` → build → push → automatic cache refresh
- **Script**: `npm run build` automatically syncs Service Worker version
- **Docs**: See `GESTION_CACHE_VERSION.md` and `GUIDE_RAPIDE_DEPLOY.md`

### Notifications Push (Default Enabled)
- **Default State**: Push notifications are **enabled by default** for all new users
- **User Control**: Users can disable in profile page (`/profile`)
- **Backend Model**: `pushNotifications: true` (default in User schema)
- **Frontend Component**: `NotificationSettings.js` has `useState(true)` for push toggle
- **Permission**: Browser permission still required even when toggle is on
- **Opt-Out**: Users can uncheck toggle anytime to disable
