# 🔗 Minify — Intelligent URL Shortener & Analytics

A modern, calming, and high-performance full-stack URL shortener. Converts long URLs into clean, cryptographically secure short links, generates offline QR codes, and tracks real-time visitor analytics (devices, operating systems, browsers, and timestamps).

---

## 📑 Table of Contents
- [Features](#-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start Guide](#-quick-start-guide)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

- **Cryptographically Secure Short IDs**: Generates randomized 8-character Base62 keys ($62^8$ combinations) to prevent predictable guessing.
- **Deduplication Engine**: Returns existing short links if the target URL has already been shortened.
- **Server-Side HTTP 302 Redirection**: Instantly hops visitors to the target website while capturing visitor headers.
- **Offline QR Code Generation**: Instant QR rendering on the client side using pure HTML5 canvas (`QRious`).
- **Comprehensive Analytics**:
  - Total click counter
  - Device distribution (Desktop vs Mobile vs Tablet)
  - Browser & OS breakdown
  - Chronological visit logs with timestamps & IP tracking
- **Dark & Light Mode**: Calming Slate (Dark) and Sage Cream (Light) themes with system memory (`localStorage`).

---

## 🛠️ Architecture & Tech Stack

- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM), `useragent`, `cors`, `dotenv`
- **Frontend**: Vite, Vanilla HTML5, Modern CSS (CSS custom properties, glassmorphism), ES6+ JavaScript
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## 📋 Prerequisites

Before running the application, make sure you have:
1. **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
2. **MongoDB**:
   - **Option A (Local)**: Ensure MongoDB Community Server is installed and running on port `27017`.
   - **Option B (Cloud)**: A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string.

---

## 🚀 Quick Start Guide

To run the application, you will open **two terminal windows** (one for the backend and one for the frontend).

### 1. Backend Setup

Open your first terminal in the project root:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create your .env file from the example
# Windows (PowerShell):
Copy-Item .env.example .env
# Linux / macOS / Git Bash:
cp .env.example .env

# 4. Start the backend server
# For production start:
npm start
# OR for development with auto-reload (nodemon):
npm run dev
```

The backend server will start at: **`http://localhost:3000`**
You should see:
```text
=================================================
   URL Shortener Server Running on Port: 3000
   Base URL: http://localhost:3000
=================================================
MongoDB successfully connected! Host: 127.0.0.1
```

---

### 2. Frontend Setup

Open your second terminal in the project root:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the frontend development server
npm run dev
```

Vite will serve the frontend at: **`http://localhost:5173`**
Open [http://localhost:5173](http://localhost:5173) in your browser to start shortening URLs!

---

## ⚙️ Environment Configuration

Backend configuration is handled in [`backend/.env`](file:///c:/Users/ayush/OneDrive/Documents/projects/url%20shortner/backend/.env). Reference template is available in [`backend/.env.example`](file:///c:/Users/ayush/OneDrive/Documents/projects/url%20shortner/backend/.env.example):

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `3000` | The port the Express API listens on |
| `BASE_URL` | `http://localhost:3000` | Base domain used when building the full shortened link |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/url-shortener` | MongoDB connection URI (use your Atlas URI if hosted in cloud) |

---

## 📡 API Reference

| Method | Endpoint | Description | Request Body / Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/url` | Shortens a new or existing URL | `{"originalUrl": "https://example.com"}` |
| `GET` | `/:id` | Redirects to destination URL and logs analytics | Param: `id` (e.g. `/aB9xQ1zR`) |
| `GET` | `/url/analytics/:id` | Retrieves click statistics and device analytics | Param: `id` (e.g. `/url/analytics/aB9xQ1zR`) |

---

## ❓ Troubleshooting

#### 1. MongoDB Connection Error (`ECONNREFUSED 127.0.0.1:27017`)
- Ensure your local MongoDB service is running:
  - **Windows**: Open `Services` app $\rightarrow$ find `MongoDB Server` $\rightarrow$ click `Start`.
  - Alternatively, pass a free MongoDB Atlas connection string in [`backend/.env`](file:///c:/Users/ayush/OneDrive/Documents/projects/url%20shortner/backend/.env).

#### 2. Port `3000` Already In Use
- Change `PORT=3001` in [`backend/.env`](file:///c:/Users/ayush/OneDrive/Documents/projects/url%20shortner/backend/.env) and update `BASE_URL=http://localhost:3001`.

#### 3. `Failed to load source map for qrious.min.js.map`
- This is a non-breaking Vite warning indicating the minified QR library didn't package an optional debugging map file. It does not affect functionality.
