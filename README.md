# 📊 DataPulse

> A powerful full-stack data analytics and survey platform designed for modern teams.

🎥 Demo Video
https://github.com/user-attachments/assets/8facc921-791f-4eac-ba24-f35ce25591c5

🌐 **Live App**: https://datapulse-delta.vercel.app

---

## ✨ Features

* 🔐 **Authentication**
  Secure JWT-based user registration and login

* 📋 **Survey Builder**
  Create, customize, and share surveys via public links

* 📁 **Dataset Uploads**
  Upload CSV/JSON files and analyze data instantly

* 📊 **Dashboard Builder**
  Build interactive dashboards with charts and widgets

* 📈 **Real-time Analytics**
  Monitor survey responses with live insights

* 🌙 **Modern UI/UX**
  Responsive design with smooth animations and clean layout

---

## 🛠️ Tech Stack

### Frontend

* **React 18** — UI framework
* **Vite** — Fast build tool
* **Tailwind CSS** — Utility-first styling
* **Zustand** — State management
* **React Query** — Data fetching & caching
* **Recharts** — Data visualization
* **Framer Motion** — Animations
* **Axios** — API communication

### Backend

* **Node.js** — Runtime environment
* **Express.js** — Web framework
* **MongoDB Atlas** — Cloud database
* **Mongoose** — ODM for MongoDB
* **JWT** — Authentication
* **Multer** — File uploads
* **bcryptjs** — Password hashing

### Deployment

* **Vercel** — Frontend hosting
* **Render** — Backend hosting
* **MongoDB Atlas** — Database

---

## 🚀 Getting Started (Local Development)

### Prerequisites

* Node.js (v20 or higher)
* MongoDB (local instance or Atlas)
* Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/sauravsingh019/DATAPULSE.git
cd DATAPULSE
```

---

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside `/backend`:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

---

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:
👉 http://localhost:5173

---

## 🌍 Deployment

### Frontend (Vercel)

* Root Directory: `frontend`
* Build Command: `npm run build`

Environment Variable:

```
VITE_API_URL=https://datapulse-backend-72jz.onrender.com/api
```

---

### Backend (Render)

* Root Directory: `backend`
* Build Command: `npm install`
* Start Command: `npm start`

Environment Variables:

```
PORT=10000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://datapulse-delta.vercel.app
```

---

## 📁 Project Structure

```
DataPulse/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── stores/
│   │   └── utils/
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

## 📄 License

This project is open-source and available under the MIT License.

---
