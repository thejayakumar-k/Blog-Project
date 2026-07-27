# Blog Project

A full-stack blog application with a React frontend and Express/MongoDB backend.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or local MongoDB)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/Blog_Project.git
cd Blog_Project
```

### 2. Backend Setup

```bash
cd blog-project-starter-backend-main
npm install
```

Create a `.env` file in the backend folder:

```
MONGO_URI=your_mongodb_connection_string
```

Replace `your_mongodb_connection_string` with your MongoDB Atlas connection string.

Start the backend server:

```bash
node index.js
```

Server runs on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd blog-project-starter-frontend-main
npm install
```

Create a `.env` file in the frontend folder:

```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
VITE_API_URL=your_backend_api_url
```

Get Firebase values from your [Firebase Console](https://console.firebase.google.com/) > Project Settings > General > Your apps.

For local development, set `VITE_API_URL=http://localhost:5000`. For production, use your deployed backend URL.

Start the frontend dev server:

```bash
npm run dev
```

App runs on `http://localhost:5173`

## Available Scripts

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Backend

| Command | Description |
|---------|-------------|
| `node index.js` | Start server on port 5000 |

## Tech Stack

**Frontend:** React, Vite, Tailwind CSS, React Router, Firebase Auth

**Backend:** Express, Mongoose, MongoDB

## Project Structure

```
Blog_Project/
├── blog-project-starter-frontend-main/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── config/          # Firebase config
│   │   └── assets/          # Images
│   ├── .env.example         # Env template
│   └── package.json
│
└── blog-project-starter-backend-main/
    ├── index.js             # Express server
    ├── .env.example         # Env template
    └── package.json
```
