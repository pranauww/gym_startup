# Gym App Monorepo

A cross-platform social gym tracker with real-time pose detection, workout analytics, and social features.

## Project Structure

```
gym_app/
  frontend/      # React Native (Expo) app
  backend/       # Node.js (Express) API server
  ml-models/     # Python ML models (TensorFlow/PyTorch)
```

## Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Python 3.8+
- PostgreSQL
- AWS account (for S3)
- Expo CLI (`npm install -g expo-cli`)

---

## Setup Instructions

### 1. Clone the repo
```sh
git clone https://github.com/pranauww/gym_startup.git
cd gym_app
```

### 2. Frontend (React Native Expo)
```sh
cd frontend
npm install
# Start the Expo app
npm start
```

### 3. Backend (Express API)
```sh
cd backend
npm install
# Create a .env file (see .env.example)
# Run database migrations (see backend/README.md)
npm run dev
```

### 4. ML Models
```sh
cd ml-models
# (Set up your Python environment, see ml-models/README.md)
```

### 5. Database (PostgreSQL)
- Create a database and user (see backend/README.md for schema and setup)

### 6. AWS S3
- Set up an S3 bucket and add credentials to backend/.env

---

## Features
- Real-time workout tracking with camera & pose detection
- Automatic exercise recognition, rep counting, and form feedback
- Social feed, comments, likes, and friend system
- Weekly competitions and leaderboards

---

## Contributing
PRs and issues welcome! 