# Smart Car Rental Management System

A web-based car rental management system developed using React, Vite, Firebase, Tailwind CSS, Express, and Stripe.

## Features

* User registration and login (Firebase Auth)
* Browse and view available cars with pricing and filters
* Car booking and reservation management
* Online payment integration (Stripe Sandbox / Test Mode + Wallet support)
* Automatic refund management via Stripe API
* Driver assignment & management
* User dashboard with booking history & wallet balance
* Admin dashboard for car, driver, and booking management
* Invoicing & email notifications

## Technologies Used

* React 19 & Vite
* Tailwind CSS
* Firebase Authentication & Cloud Firestore
* Stripe (Test Mode / Sandbox)
* EmailJS & Nodemailer
* Express.js Node Backend

## Setup & Running the Project

### 1. Frontend Setup
Install frontend dependencies:
```bash
npm install
```

Configure your frontend `.env` file (copied from `.env.template`):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:5000
```

Start the Vite development server:
```bash
npm run dev
```

### 2. Backend Setup
Navigate into the backend folder:
```bash
cd backend
npm install
```

Configure your backend `.env` file (copied from `backend/.env.template`):
```env
PORT=5000
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_CURRENCY=lkr
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json
```

Start the backend server:
```bash
node server.js
```
