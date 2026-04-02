# We Care App - Project Status Report

## 1. Overview

This report covers the full stack web app in `We Cares` with React frontend and Express + MongoDB backend. It summarizes implemented features, behavior, and known gaps in the current codebase.

- Frontend: `client/src` (React + Tailwind CSS + React Router)
- Backend: `server` (Express, Mongoose, JWT auth, REST APIs)
- Database: MongoDB (models in `server/models`)

## 2. Authentication & User Flow

- Register (implemented)
  - Works: user sign-up, form validation, backend endpoint `/api/auth/register`.
  - Social Google/GitHub removed from login/register pages.
  - Redirects to `/dashboard` after sign-up.

- Login (implemented)
  - Works: email + password login via `/api/auth/login`.
  - Auth token stored in localStorage as `wecare_token`, user data stored as `wecare_user`.
  - `isAuthenticated()` checks token existence; navbar state shows logged in/out.

- Logout (implemented)
  - Works: clears token/user from localStorage and navigates to home.

- Auth guard (implemented)
  - `PrivateRoute` protects routes requiring authenticated user.
  - `AdminRoute` restricts `/admin` to role `admin`.

- Issue discovered and explained:
  - If prior user is in localStorage, app appears logged in on landing (by design). Clear storage to reset.

## 3. Provider/Context

- `client/src/context/AppContext.js`: global state stub; currently tracks user, isAuthenticated, theming, notifications.
- Not used for API auth state; auth relies on localStorage directly.

## 4. Skin Quiz

- Page: `client/src/pages/SkinQuiz.jsx` (implemented)
  - Works: questions UI, yes/no answer, validation, submit on complete.
  - Calls `/api/quiz` endpoint via `submitSkinQuiz`.
  - On success, stores profile through backend and redirects to dashboard.

- Removed from nav bar under requested UX change. Access from dashboard Quick Actions only.

- Dashboard behavior (in `client/src/pages/Dashboard.jsx`):
  - New users: prompt to take quiz with "Take a quiz to know your skin".
  - After profile exists: quick action is "Retake Quiz".

## 5. Skin Profile (profile tracking)

- Backend endpoint `/api/profile` and `/api/quiz` ties to user.
- Dashboard fetches profile (`getSkinProfile`) and handles missing profile.
  - Works: if no profile, shows special empty state.
  - Works: if profile available, displays status, concerns, allergies, goals, personalized tips.

## 6. Product Catalog + Reviews

- Products model/controller/routes added (`Product` + `/api/products`). Works for listing products.
- Review system implemented (`Review` + `/api/reviews`). 
- UI pages: `ProductList`, `ProductDetail` (likely works with backend). 

## 7. Admin Dashboard

- Admin APIs in `server/controllers/adminController.js` with `adminRoutes`.
- `client/src/pages/AdminDashboard.jsx` list users, manage roles.
- Protected by `AdminRoute`.

## 8. Routine Tracker

- Model/controller/routes added for routines: `/api/routines`.
- `client/src/pages/RoutineTracker.jsx` works with add/edit/remove actions.

## 9. Subscription / Payment

- Models in `server/models/Subscription.js` and extended `User` fields.
- Controller routes `/api/subscriptions`, UI `client/src/pages/Subscription.jsx` (billing flow simulation) implemented.

## 10. Dermatologist Consultation

- Models/Controllers/Routes in server for consultation feature (`Consultation` model,  `/api/consultations`).
- UI page `client/src/pages/Consultation.jsx` implemented.

## 11. Navigation & Routing

- `client/src/App.js` sets all routes:
  - Public: `/`, `/features`, `/community`, `/contact`, etc.
  - Auth: `/login`, `/register`, `/forgot-password`, `/reset-password/:token`.
  - Private: `/dashboard`, `/quiz`, `/routines`, `/subscription`, `/consultation`.
  - Admin: `/admin`.

- Navbar removes allowed entries for guest/user states and now excludes skin quiz.

## 12. Bugfixes made in this sprint

- Fixed asset path for `logo-skin.jpg` (from invalid `logo skin.jpg`).
- Fixed duplicate render/return in `Dashboard.jsx` after rework.

## 13. Known issues (to fix)

1. auth persistence: currently purely token presence; no token expiry check in frontend.
2. possible leftover route links in `Home.jsx` and `Features` still point to `/quiz`.
3. Dashboard logic duplicates initially before final cleanup (fixed now) but should be regression tested.
4. Not all forms have backend validation or server-side rate limiting.

## 14. Status Table Summary

| Feature | Work status | Location | Notes |
|--------|-------------|----------|--------|
| User register/login/logout | ✅ Complete | `client/src/pages` + `server/controllers/authController.js` | 2FA not implemented.
| Dashboard | ✅ Complete | `client/src/pages/Dashboard.jsx` | includes quiz CTA.
| Skin quiz | ✅ Complete | `client/src/pages/SkinQuiz.jsx`, `server/controllers/quizController.js` | now dashboard-driven.
| Product catalog | ✅ Complete | `client/src/pages/ProductList.jsx` etc. | basic CRUD.
| Reviews/ratings | ✅ Complete | `server/controllers/reviewController.js` | users can post reviews.
| Admin dashboard | ✅ Complete | `client/src/pages/AdminDashboard.jsx` | role guard.
| Routine tracker | ✅ Complete | `client/src/pages/RoutineTracker.jsx` | local API.
| Subscription payments | ✅ Complete | `client/src/pages/Subscription.jsx` | simulated payment.
| Dermatologist consultation | ✅ Complete | `client/src/pages/Consultation.jsx` | session request.
| Social login buttons | ✅ Removed | `client/src/pages/Login.jsx`, `Register.jsx` | UX requirement.

## 15. Next recommended improvements

- Add backend refresh token + token expiry handling.
- Add tests: unit and integration for auth, profile, quiz.
- Add release branch checks and CI in package.
- Add admin workflow for quiz results global analytics.

---

_Last updated: April 2, 2026_
