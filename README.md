# 📊 DataPulse — Full-Stack Analytics Platform

> A comprehensive MERN-stack data analytics platform with survey builder, CSV analytics, and PowerBI-style dashboards.

---

## ✨ Features

### 🗳️ Survey Builder
- Drag-and-drop survey creator with 10+ question types
- Rating scales, NPS, multiple choice, checkboxes, text, date, email, yes/no
- Shareable public links (e.g. `/s/abc123`)
- **Kiosk Mode** — tablet-friendly, auto-reset, inactivity timer
- Live analytics with completion rates and response distributions

### 📁 Dataset Analytics
- Upload CSV or JSON files (up to 50MB)
- Auto-detect column types (number, string, date, boolean)
- Statistical summary: min, max, mean, median, std deviation
- Distribution histograms for numeric columns
- Value counts & pie charts for categorical columns
- Tabular data explorer

### 📊 Dashboard Builder (PowerBI-style)
- Drag-and-drop canvas
- Widget types: Bar, Line, Area, Pie, Donut, KPI Card, Table, Text
- Connect widgets to your uploaded datasets
- Configure axes, aggregations, color themes
- Fullscreen widget view
- Save & share dashboards

### 🔐 Authentication
- JWT-based auth with bcrypt passwords
- Role-based access (admin, analyst, viewer)
- Protected and public routes

---

## 🛠️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, TailwindCSS       |
| Routing   | React Router v6                   |
| State     | Zustand                           |
| Charts    | Recharts                          |
| Animation | Framer Motion                     |
| Backend   | Express.js (Node 18+)             |
| Database  | MongoDB + Mongoose                |
| Auth      | JWT + bcryptjs                    |
| Files     | Multer (CSV/JSON upload)          |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone & Install

```bash
# Install all dependencies
npm run install:all

# Or manually:
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI and JWT secret
```

### 3. Start Development Servers

```bash
# Start both backend and frontend (from root)
npm run dev
```

Or separately:
```bash
npm run dev:backend   # http://localhost:5001
npm run dev:frontend  # http://localhost:5173
```

### 4. Open the App

Visit **http://localhost:5173** → Register an account → Start exploring!

---

## 📁 Project Structure

```
DataPulse/
├── backend/
│   ├── models/
│   │   ├── User.js         # Auth & user profiles
│   │   ├── Survey.js       # Survey schema with questions
│   │   ├── Response.js     # Survey responses
│   │   ├── Dataset.js      # Uploaded CSV/JSON datasets
│   │   └── Dashboard.js    # Dashboard with widgets
│   ├── routes/
│   │   ├── auth.js         # Register, login, /me
│   │   ├── surveys.js      # CRUD + analytics
│   │   ├── responses.js    # Submit + export CSV
│   │   ├── uploads.js      # CSV upload & analysis
│   │   └── dashboards.js   # Dashboard CRUD
│   ├── middleware/
│   │   └── auth.js         # JWT protect middleware
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardHome.jsx      # Overview
        │   ├── SurveysPage.jsx        # Survey list
        │   ├── SurveyBuilderPage.jsx  # Form builder
        │   ├── SurveyAnalyticsPage.jsx
        │   ├── SurveyKioskPage.jsx    # Tablet kiosk
        │   ├── DatasetsPage.jsx       # Upload CSV
        │   ├── DatasetDetailPage.jsx  # Data explorer
        │   ├── DashboardsPage.jsx
        │   ├── DashboardBuilderPage.jsx # PowerBI-style
        │   └── PublicSurveyPage.jsx   # Shareable surveys
        ├── components/
        │   └── Layout.jsx             # Sidebar + nav
        ├── stores/
        │   └── authStore.js           # Zustand auth state
        └── utils/
            └── api.js                 # Axios instance
```

---

## 🔗 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/surveys` | List my surveys |
| POST | `/api/surveys` | Create survey |
| PUT | `/api/surveys/:id` | Update survey |
| DELETE | `/api/surveys/:id` | Delete survey |
| GET | `/api/surveys/:id/analytics` | Survey analytics |
| GET | `/api/surveys/public/:token` | Public survey |
| POST | `/api/responses/submit` | Submit response |
| GET | `/api/responses/survey/:id/export` | Export CSV |
| POST | `/api/upload/csv` | Upload CSV file |
| GET | `/api/upload` | List datasets |
| GET | `/api/upload/:id` | Dataset detail |
| GET/POST | `/api/dashboards` | List / Create |
| GET/PUT/DELETE | `/api/dashboards/:id` | Dashboard CRUD |

---

## 🎨 Design System

DataPulse uses an Apple-inspired design language:
- **Colors**: Apple Blue `#0071e3`, Green `#34c759`, semantic tones
- **Typography**: SF Pro Display / system fonts
- **Components**: `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.badge-*`
- **Animations**: Framer Motion with 250ms ease-out transitions

---

## 📄 License

MIT — built for the DataPulse analytics platform.
