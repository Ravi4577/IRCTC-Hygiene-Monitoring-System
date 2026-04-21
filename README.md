# IRCTC Hygiene Rating and Monitoring System

A full-stack MERN application for monitoring and rating food vendor hygiene standards on Indian Railways.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router v6, Axios, Chart.js |
| Backend   | Node.js, Express.js, Socket.IO          |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT + bcryptjs                          |
| AI        | Google Gemini API (chatbot)             |
| Uploads   | Multer (local disk)                     |

---

## Project Structure

```
root/
├── client/          # React frontend
│   └── src/
│       ├── components/   # Shared UI (Navbar, Sidebar, Chatbot, etc.)
│       ├── context/      # AuthContext, AlertContext
│       ├── layouts/      # AuthLayout, DashboardLayout
│       ├── pages/        # Feature pages by domain
│       ├── routes/       # AppRoutes (protected + role-based)
│       └── services/     # Axios instance, chatbot/message services
└── server/          # Express backend
    └── src/
        ├── config/       # MongoDB connection
        ├── controllers/  # Route handlers
        ├── middleware/   # auth, errorHandler, validate, upload
        ├── models/       # Mongoose schemas
        ├── routes/       # Express routers
        ├── services/     # Gemini AI, Socket.IO, AI sentiment
        └── utils/        # Seed script
```

---

## Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/irctc-hygiene.git
cd irctc-hygiene
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 3. Configure environment variables

```bash
# Backend
cd server
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, GEMINI_API_KEY

# Frontend
cd ../client
cp .env.example .env
# Edit .env — set REACT_APP_API_URL if needed
```

### 4. Create the admin account + seed sample data

```bash
cd server
npm run seed
```

This creates:
- **1 admin account** using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`
- Sample officer, passenger, vendor accounts (password: `Sample@123`)
- Sample vendors, complaints, inspections, alerts

> ⚠️ **To change admin credentials:** update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then re-run `npm run seed`.

### 5. Start the application

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## Authentication

### Login

All users log in at the same `/login` page with their registered email and password.

| Role      | How to get access                                      |
|-----------|--------------------------------------------------------|
| Admin     | Created via seed script only — no public registration  |
| Officer   | Register at `/register` with role = Officer            |
| Passenger | Register at `/register` with role = Passenger          |
| Vendor    | Created by Admin from the Vendor Management panel      |

### Registration Rules

- **Admin registration is disabled** — admin accounts are created only via the seed script
- Passengers, Officers can self-register at `/register`
- Vendors are created by the Admin from the dashboard

---

## Admin Credentials

Admin credentials are set in `server/.env`:

```env
ADMIN_EMAIL=admin@irctc.com
ADMIN_PASSWORD=Admin@123
```

**To change them:**
1. Edit `server/.env`
2. Run `cd server && npm run seed`

> The password is stored **hashed** in MongoDB — never in plain text.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register (passenger/officer/vendor only) |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |
| GET | /api/complaints | List complaints |
| POST | /api/complaints | Submit complaint (with images) |
| PATCH | /api/complaints/:id/status | Update status |
| GET | /api/vendors | List vendors |
| POST | /api/vendors/admin-create | Admin creates vendor account |
| GET | /api/inspections | List inspections |
| POST | /api/inspections | Create inspection |
| GET | /api/analytics/overview | Admin analytics |
| POST | /api/pnr/verify | Verify PNR |
| GET | /api/messages/conversations | Inbox |
| POST | /api/messages | Send message |
| POST | /api/chatbot/message | Gemini AI chatbot |

---

## GitHub Push Commands

```bash
# From project root
git init
git add .
git commit -m "Initial commit — IRCTC Hygiene Monitoring System"
git branch -M main
git remote add origin https://github.com/your-username/irctc-hygiene.git
git push -u origin main
```

> Make sure `.env` files are listed in `.gitignore` before pushing.

---

## Environment Variables Reference

### server/.env

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `7d`) |
| `CLIENT_URL` | Frontend URL for CORS |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password (hashed on seed) |
| `ADMIN_NAME` | Admin display name |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | Gemini model name (e.g. `gemini-1.5-flash`) |

### client/.env

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_URL` | Backend API base URL |

---

## Features

- Role-based dashboards (Admin, Officer, Passenger, Vendor)
- Complaint management with image upload and AI sentiment analysis
- Vendor ratings with sub-categories
- Inspection system with checklist scoring (A–F grades)
- Gemini AI-powered passenger chatbot
- Real-time messaging between all users
- PNR verification (mock — swap with real IRCTC API)
- Alerts and notifications system
- Analytics dashboard with charts
- Admin vendor management (create, activate/deactivate, delete)
