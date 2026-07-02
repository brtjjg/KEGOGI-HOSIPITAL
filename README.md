# 🏥 Kegogi Medicare Hospital – Full Management System

A complete hospital website with **reception**, **patient registration**, **worker time tracking**, **visitor log**, and an **admin dashboard** – all data stored in `localStorage`.

## ✨ Features

- Public website: Home, Services, Doctors, Appointment, Contact, Testimonials.
- **Password-protected Admin Panel** (default: `admin123`).
- **Reception functions**:
  - Register patients (name, phone, age, next of kin, kin contact) – auto time‑in.
  - Check‑out patients (time‑out recorded).
  - Register workers (name, role) – auto time‑in/out.
  - Log visitors (name, phone, purpose) – auto time‑in/out.
- **Dashboard** with statistics (total patients, checked in/out, workers).
- All records persist in `localStorage` – no database needed.
- Fully responsive and mobile-friendly.

## 🚀 Deployment on Render (Web Service)

1. Push this repository to GitHub.
2. On Render, create a **Web Service** and connect your repo.
3. Set:
   - **Build Command**: `yarn` (or `npm install`)
   - **Start Command**: `yarn start` (or `node server.js`)
4. Click **Create Web Service**.

Your site will be live at `https://kegogi-medicare.onrender.com`.

## 🔐 Admin Access

- Click the **"Admin"** button in the top nav.
- Enter password: `admin123` (you can change it in `script.js`).

## 📁 Project Structure
