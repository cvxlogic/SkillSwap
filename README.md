# SkillSwap - MCA Sem-II Full-Stack Project

> "Learn from your batchmates, teach what you know."

A peer-to-peer skill-sharing platform for universities where students and faculty can showcase skills, book 1:1 learning sessions, and rate each other.

---

## Features

- **User Authentication** - JWT-based login/register with bcrypt password hashing
- **Role-based Access** - Students can book sessions, Faculty can manage skills and accept/reject requests
- **Skill Management** - Browse skills by category, add skills to profile with proficiency levels
- **Session Booking** - Book 1:1 sessions with conflict prevention
- **Review System** - Rate mentors after sessions, auto-calculated average ratings
- **Leaderboard** - MongoDB aggregation pipeline showing top mentors
- **Notifications** - Real-time notifications for session updates
- **Responsive Design** - Dark mode UI with smooth animations

---

## Tech Stack

| Layer      | Technology                   |
| ---------- | ---------------------------- |
| Frontend   | React 18 + Vite + TypeScript |
| Styling    | Tailwind CSS                 |
| Animation  | Framer Motion                |
| Backend    | Node.js + Express.js         |
| Database   | MongoDB 8.0 + Prisma ORM     |
| Auth       | JWT + bcrypt                 |
| Validation | Zod                          |

---

## Prerequisites

- **Node.js** v18+
- **MongoDB** v6.0+ (with replica set)
- **npm** or **yarn**

---

## Quick Start

### 1. Setup MongoDB

Make sure MongoDB is running with replica set:

```bash
# Start MongoDB with replica set
mongod --replSet rs0 --dbpath /path/to/data --port 27017
```

Initialize replica set (run once):

```bash
mongosh --eval 'rs.initiate()'
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your MongoDB URI if needed

# Generate Prisma client
npx prisma generate

# Push schema to MongoDB
npx prisma db push

# Seed database with sample data
npx ts-node prisma/seed.ts

# Start development server
npm run dev
```

Backend runs on **http://localhost:5001**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# (VITE_API_URL should point to http://localhost:5001/api)

# Start development server
npm run dev
```

Frontend runs on **http://localhost:3000** (or next available port)

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="mongodb://localhost:27017/skillswap_db?replicaSet=rs0"
JWT_SECRET="your-secret-key-min-32-characters"
PORT=5001
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5001/api
```

---

## Test Accounts

| Role    | Email                       | Password    |
| ------- | --------------------------- | ----------- |
| Faculty | priya.sharma@university.edu | password123 |
| Student | aarav.gupta@student.edu     | password123 |

---

## Database Schema

7 MongoDB Collections:

- **User** - User accounts with roles
- **SkillCategory** - Skill categories
- **Skill** - Skills linked to categories
- **UserSkill** - User-skill junction table
- **SkillSession** - Session bookings
- **SessionReview** - Session ratings/reviews
- **Notification** - User notifications

---

## API Endpoints

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| POST   | /api/auth/register       | Register user         |
| POST   | /api/auth/login          | Login                 |
| GET    | /api/auth/profile        | Get current user      |
| GET    | /api/skills              | Get all skills        |
| GET    | /api/skills/categories   | Get categories        |
| POST   | /api/skills              | Add skill to profile  |
| GET    | /api/sessions            | Get user sessions     |
| POST   | /api/sessions            | Book session          |
| PATCH  | /api/sessions/:id/status | Update session status |
| POST   | /api/reviews             | Submit review         |
| GET    | /api/reviews/leaderboard | Get top mentors       |
| GET    | /api/notifications       | Get notifications     |

---

## MongoDB Advanced Features

### Aggregation Pipeline (VIEW)

Leaderboard uses MongoDB aggregation to calculate mentor rankings:

- $match → Filter faculty
- $lookup → Join sessions & reviews
- $group → Calculate average ratings
- $sort → Rank by rating

### Transaction (STORED PROCEDURE)

Session booking uses multi-document operations:

- Validates mentor exists
- Checks for scheduling conflicts
- Creates session + notification atomically

### Trigger (Auto-Update)

After review submission:

- Calculates new average rating
- Updates mentor's avg_rating field
- Creates notification for mentor

---

## Project Structure

```
SkillSwap/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── config/
│   │   ├── types/
│   │   └── index.ts
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   └── package.json
│
├── Project_Report.pdf
└── README.md
```

---

## Scripts

### Backend

```bash
npm run dev     # Start with ts-node
npm run build   # Compile TypeScript
npm start       # Start production server
```

### Frontend

```bash
npm run dev     # Start Vite dev server
npm run build   # Build for production
```

---

## License

MCA Sem-II Project - Educational Purpose

---

## Author

**Vishal Singh** , [**Chirag Varshney**](https://github.com/cvxlogic) and **Aryan Joshi** | MCA Sem-II | Full-Stack Application with Database Integration
