# SkillSwap - MCA Sem-II Full-Stack Project

## Project Report

**Submitted for:** MCA Sem-II "Full-Stack Application with Database Integration"
**Project Name:** SkillSwap
**Tagline:** "Learn from your batchmates, teach what you know."
**Date:** April 17, 2026

---

## 1. Problem Definition

### 1.1 Problem Statement

In a large university, students want to learn new skills from their own peers and faculty but have no centralized way to discover who is skilled in what, book 1:1 learning sessions, or get proper feedback. SkillSwap solves this by creating a peer-to-peer skill-sharing platform where students and faculty can showcase their expertise, request or offer learning sessions, book time slots, and rate each other — making campus learning more accessible, interactive, and community-driven.

### 1.2 Solution Overview

SkillSwap is a web-based platform that enables:

- Users to create profiles showcasing their skills and proficiency levels
- Students to browse and search for mentors based on skills
- Booking of 1:1 learning sessions with conflict prevention
- Rating and review system for mentorship quality
- Real-time notifications for session updates

### 1.3 Objectives

1. Build a responsive, user-friendly web application
2. Implement secure authentication with role-based access
3. Design a flexible database schema for skills and sessions
4. Create an intuitive booking system with conflict detection
5. Implement a review/rating mechanism for mentorship quality
6. Provide real-time notifications for session updates

---

## 2. Database Design (MongoDB)

### 2.1 ER Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      USER        │       │    SKILL        │       │ SKILL_CATEGORY  │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ _id (PK)        │       │ _id (PK)        │       │ _id (PK)        │
│ roll_number     │       │ name            │       │ name            │
│ full_name       │       │ categoryId (FK) │───────│                 │
│ email           │       └─────────────────┘       └─────────────────┘
│ password_hash   │                                           ▲
│ role            │                                           │
│ department      │       ┌─────────────────┐                   │
│ avg_rating      │       │   USER_SKILL    │───────────────────┘
│ bio             │       ├─────────────────┤
│ avatar_url      │       │ _id (PK)        │
│ created_at      │       │ userId (FK)     │───────────────┐
└─────────────────┘       │ skillId (FK)    │               │
        │                │ proficiency_level│               │
        │                │ years_of_exp    │               │
        │                └─────────────────┘               │
        │                                                  │
        ├──────────────────┬──────────────────┬────────────┤
        ▼                  ▼                  ▼            ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  SKILL_SESSION  │ │SESSION_REVIEW   │ │  NOTIFICATION    │ │ LEARNING_GOAL    │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ _id (PK)        │ │ _id (PK)        │ │ _id (PK)        │ │ _id (PK)        │
│ mentorId (FK)───┼─│ sessionId (FK)  │ │ userId (FK)─────┼─┐ │ userId (FK)─────┼─┐
│ menteeId (FK)   │ │ reviewerId (FK) │ │ message         │ │ │ skillId (FK)    │ │
│ skillId (FK)    │ │ rating (1-5)    │ │ is_read         │ │ │ description     │ │
│ title           │ │ comment         │ │ created_at      │ │ │ status          │ │
│ description     │ │ created_at      │ └─────────────────┘ │ │ priority        │ │
│ scheduled_date  │ └─────────────────┘                     │ │ created_at      │ │
│ status          │                                       │ └─────────────────┘ │
│ created_at      │                                       │                     │
└─────────────────┘                                       │                     │
                                                          │                     │
┌─────────────────┐                                       │                     │
│ MENTOR_REQUEST  │                                       │                     │
├─────────────────┤                                       │                     │
│ _id (PK)        │                                       │                     │
│ requesterId(FK)─┼───────────────────────────────────────┘                     │
│ receiverId(FK)──┼─────────────────────────────────────────────────────────────┘
│ skillId (FK)    │
│ message         │
│ status          │
│ created_at      │
└─────────────────┘
```

### 2.2 Relationships

| Relationship                     | Type | Description                                 |
| -------------------------------- | ---- | ------------------------------------------- |
| User → SkillCategory            | 1:N  | A user can have many skills                 |
| SkillCategory → Skill           | 1:N  | A category can have many skills             |
| User → UserSkill                | 1:N  | A user can add many skills to their profile |
| Skill → UserSkill               | 1:N  | A skill can be added by many users          |
| User → SkillSession (as Mentor) | 1:N  | A mentor can have many sessions             |
| User → SkillSession (as Mentee) | 1:N  | A mentee can have many sessions             |
| SkillSession → SessionReview    | 1:1  | A session has at most one review            |
| User → SessionReview            | 1:N  | A reviewer can write many reviews           |
| User → Notification             | 1:N  | A user can have many notifications          |
| User → LearningGoal             | 1:N  | A user can have many learning goals         |
| Skill → LearningGoal            | 1:N  | A skill can be a learning goal for many     |
| User → MentorRequest (as Requester) | 1:N | A user can send many mentor requests      |
| User → MentorRequest (as Receiver) | 1:N | A user can receive many mentor requests    |
| Skill → MentorRequest           | 1:N  | A skill can be requested by many users      |

### 2.3 Collection Schemas

```
┌─────────────────────────────────────────────────────────────────┐
│ USER Collection                                                   │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ roll_number      : String (Unique Index)                         │
│ full_name        : String                                        │
│ email            : String (Unique Index)                        │
│ password_hash    : String (bcrypt hashed)                        │
│ role             : String ('student' | 'faculty')               │
│ department       : String (nullable)                            │
│ bio              : String (nullable)                             │
│ avatar_url       : String (nullable)                             │
│ avg_rating       : Number (default: 0)                          │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SKILL_CATEGORY Collection                                         │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ name             : String (Unique Index)                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SKILL Collection                                                  │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ name             : String                                        │
│ categoryId       : ObjectId (Foreign Key → SkillCategory)        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ USER_SKILL Collection (Junction Table)                           │
├─────────────────────────────────────────────────────────────────┤
│ _id                  : ObjectId (Primary Key)                   │
│ userId               : ObjectId (Foreign Key → User)            │
│ skillId              : ObjectId (Foreign Key → Skill)           │
│ proficiency_level    : String ('beginner'|'intermediate'|etc.)  │
│ years_of_experience  : Number                                    │
│ created_at           : DateTime (default: now())                │
│                                                                      │
│ @@unique([userId, skillId])  // Prevents duplicate skill entries │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SKILL_SESSION Collection                                          │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ mentorId         : ObjectId (Foreign Key → User)                │
│ menteeId         : ObjectId (Foreign Key → User)                │
│ skillId          : ObjectId (Foreign Key → Skill)               │
│ title            : String                                        │
│ description      : String (nullable)                             │
│ scheduled_date   : DateTime                                       │
│ status           : String ('pending'|'confirmed'|               │
│                                      'completed'|'cancelled')    │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ SESSION_REVIEW Collection                                         │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectKey (Primary Key)                       │
│ sessionId        : ObjectId (Unique, Foreign Key → SkillSession) │
│ reviewerId       : ObjectId (Foreign Key → User)                 │
│ rating           : Number (1-5)                                  │
│ comment          : String (nullable)                             │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ NOTIFICATION Collection                                           │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ userId           : ObjectId (Foreign Key → User)                │
│ message          : String                                        │
│ is_read          : Boolean (default: false)                     │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ LEARNING_GOAL Collection                                          │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ userId           : ObjectId (Foreign Key → User)                │
│ skillId          : ObjectId (Foreign Key → Skill)               │
│ description      : String (nullable)                             │
│ status           : String ('wanted'|'learning'|'completed')     │
│ priority         : String ('low'|'medium'|'high')               │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ MENTOR_REQUEST Collection                                         │
├─────────────────────────────────────────────────────────────────┤
│ _id              : ObjectId (Primary Key)                        │
│ requesterId      : ObjectId (Foreign Key → User)                │
│ receiverId       : ObjectId (Foreign Key → User)                │
│ skillId          : ObjectId (Foreign Key → Skill)               │
│ message          : String (nullable)                             │
│ status           : String ('pending'|'accepted'|'rejected')     │
│ created_at       : DateTime (default: now())                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. MongoDB Advanced Features

### 3.1 Aggregation Pipeline (VIEW Equivalent) - Top Mentors Leaderboard

The leaderboard uses MongoDB's aggregation pipeline to calculate mentor rankings:

```javascript
// Pipeline stages:
1. $match       → Filter only faculty members
2. $lookup      → Join with completed sessions
3. $unwind      → Flatten session arrays
4. $lookup      → Join with reviews
5. $unwind      → Flatten review arrays
6. $group       → Calculate avg rating per mentor
7. $sort        → Sort by rating (descending)
8. $limit       → Return top 20 mentors
```

### 3.2 Transaction (STORED PROCEDURE Equivalent) - Session Booking

Multi-document operation ensuring data consistency:

```javascript
async function bookSession(mentorId, menteeId, skillId, title, scheduledDate) {
  // Step 1: Validate mentor exists and is faculty
  const mentor = await prisma.user.findUnique({ where: { id: mentorId } });
  if (!mentor || mentor.role !== 'faculty') throw new Error('Invalid mentor');

  // Step 2: Check for scheduling conflicts
  const conflict = await prisma.skillSession.findFirst({
    where: { mentorId, scheduled_date: scheduledDate, status: { in: ['pending', 'confirmed'] } }
  });
  if (conflict) throw new Error('Time slot already booked');

  // Step 3: Create session
  const session = await prisma.skillSession.create({ data: {...} });

  // Step 4: Create notification (all in transaction via Prisma)
  await prisma.notification.create({ data: { userId: mentorId, message: 'New session request' } });

  return session;
}
```

### 3.3 Trigger Equivalent - Auto-Update Average Rating

After each review is submitted, the mentor's average rating is recalculated:

```javascript
async function createReview(sessionId, reviewerId, rating) {
  // 1. Create the review
  const review = await prisma.sessionReview.create({ data: { sessionId, reviewerId, rating } });

  // 2. Get the session to find mentor
  const session = await prisma.skillSession.findUnique({ where: { id: sessionId } });

  // 3. Calculate new average from ALL reviews for this mentor
  const mentorReviews = await prisma.sessionReview.findMany({
    where: { session: { mentorId: session.mentorId } }
  });
  const avgRating = mentorReviews.reduce((sum, r) => sum + r.rating, 0) / mentorReviews.length;

  // 4. Update mentor's avg_rating (TRIGGER equivalent)
  await prisma.user.update({
    where: { id: session.mentorId },
    data: { avg_rating: avgRating }
  });

  return review;
}
```

---

## 4. Technology Stack

| Layer                | Technology        | Purpose               |
| -------------------- | ----------------- | --------------------- |
| **Frontend**   | React 18 + Vite   | UI Framework          |
| **Styling**    | Tailwind CSS      | Responsive Design     |
| **Animation**  | Framer Motion     | Smooth Transitions    |
| **Backend**    | Node.js + Express | REST API Server       |
| **Language**   | TypeScript        | Type Safety           |
| **Database**   | MongoDB 8.0       | Document Database     |
| **ORM**        | Prisma 5          | Database Abstraction  |
| **Auth**       | JWT + bcrypt      | Secure Authentication |
| **Validation** | Zod               | Schema Validation     |

---

## 5. API Endpoints

### Authentication

| Method | Endpoint           | Description       | Auth |
| ------ | ------------------ | ----------------- | ---- |
| POST   | /api/auth/register | Register new user | No   |
| POST   | /api/auth/login    | Login user        | No   |
| GET    | /api/auth/profile  | Get current user  | Yes  |

### Skills

| Method | Endpoint               | Description          | Auth |
| ------ | ---------------------- | -------------------- | ---- |
| GET    | /api/skills            | Get all skills       | No   |
| GET    | /api/skills/categories | Get categories       | No   |
| GET    | /api/skills/users/:id  | Get user skills      | No   |
| POST   | /api/skills            | Add skill to profile | Yes  |
| DELETE | /api/skills/:id        | Remove skill         | Yes  |

### Sessions

| Method | Endpoint                 | Description         | Auth |
| ------ | ------------------------ | ------------------- | ---- |
| GET    | /api/sessions            | Get user sessions   | Yes  |
| POST   | /api/sessions            | Book new session    | Yes  |
| PATCH  | /api/sessions/:id/status | Update status       | Yes  |
| GET    | /api/sessions/stats      | Get dashboard stats | Yes  |

### Reviews

| Method | Endpoint                 | Description        | Auth |
| ------ | ------------------------ | ------------------ | ---- |
| POST   | /api/reviews             | Submit review      | Yes  |
| GET    | /api/reviews/mentor/:id  | Get mentor reviews | No   |
| GET    | /api/reviews/leaderboard | Get top mentors    | No   |

### Notifications

| Method | Endpoint                    | Description       | Auth |
| ------ | --------------------------- | ----------------- | ---- |
| GET    | /api/notifications          | Get notifications | Yes  |
| PATCH  | /api/notifications/:id/read | Mark as read      | Yes  |
| PATCH  | /api/notifications/read-all | Mark all as read  | Yes  |

---

## 6. Project Structure

```
SkillSwap/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # MongoDB Schema (9 collections)
│   │   └── seed.ts           # Database seeder (20 users, 35+ skills)
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── config/           # Environment configuration
│   │   ├── controllers/      # 5 controllers (auth, skill, session, review, notification)
│   │   ├── services/        # Business logic layer
│   │   ├── middleware/      # Auth (JWT) + Validation (Zod)
│   │   ├── routes/          # API route definitions
│   │   └── types/           # TypeScript interfaces
│   ├── .env                  # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, Sidebar, Cards, Modals, Avatar, StarRating, Skeleton
│   │   ├── pages/           # 13 pages (Home, Login, Register, Dashboard, Profile, etc.)
│   │   ├── context/         # AuthContext for authentication state
│   │   ├── services/        # Axios API client
│   │   ├── types/           # TypeScript interfaces
│   │   └── App.tsx          # Main app with routing (13 routes)
│   ├── .env                 # API URL configuration
│   └── package.json
│
├── AGENTS.md                # OpenCode instructions
├── README.md                # Setup guide
├── Project_Report.md       # This document
└── ScreenShot.png          # Application screenshots
```

---

## 7. Implementation Details

### 7.1 Authentication Flow

1. User submits email/password
2. Server validates credentials with bcrypt
3. Server generates JWT token with userId, email, role
4. Frontend stores token in localStorage
5. All subsequent requests include Bearer token
6. Middleware validates token and attaches user to request

### 7.2 Role-Based Access Control

- **Students**: Browse skills, book sessions, submit reviews
- **Faculty**: Manage skills, accept/reject sessions, receive reviews

### 7.3 Session Booking Flow

1. Student searches mentors by skill
2. Student clicks "Book Session" on mentor card
3. Modal opens with date/time picker
4. System checks for conflicts (same mentor, same time)
5. Session created with status: 'pending'
6. Mentor receives notification
7. Mentor accepts/rejects session
8. If accepted, status: 'confirmed'
9. After session, status: 'completed'
10. Mentee submits review (optional)
11. Mentor avg_rating auto-updates

### 7.4 Frontend Features

- Dark mode interface (Supabase-inspired)
- Responsive design (mobile-friendly)
- Real-time notifications badge
- Smooth page transitions (Framer Motion)
- Form validation with error messages
- Loading states with skeleton loaders
- User profiles with bio and avatar
- Favorite mentors list
- Learning goals tracker
- Mentor request system

---

## 8. Sample Data

### 8.1 Users (20 records)

**Faculty (5):**

- Dr. Priya Sharma (FAC001) - Computer Science - Rating: 5.0
- Prof. Rajesh Kumar (FAC002) - Data Science - Rating: 4.8
- Dr. Anita Desai (FAC003) - Machine Learning - Rating: 4.9
- Prof. Vikram Singh (FAC004) - Web Development - Rating: 4.7
- Dr. Meera Patel (FAC005) - Mobile Development - Rating: 4.6

**Students (15):**

- MCA2024001 - MCA2024015

### 8.2 Skill Categories (9)

- Programming Languages
- Web Development
- Data Science & Analytics
- Machine Learning & AI
- Mobile Development
- Cloud & DevOps
- Design & UI/UX
- Soft Skills
- Others

### 8.3 Skills (35+)

Including: Python, JavaScript, React, Node.js, MongoDB, SQL, TensorFlow, AWS, Figma, Communication, etc.

### 8.4 Sessions

- 8 completed sessions with reviews
- 3 confirmed upcoming sessions
- 3 pending approval

---

## 9. Testing Credentials

| Role    | Email                       | Password    |
| ------- | --------------------------- | ----------- |
| Faculty | priya.sharma@university.edu | password123 |
| Student | aarav.gupta@student.edu     | password123 |

---

## 10. Evaluation Criteria Mapping

| Criterion              | Implementation                                |
| ---------------------- | --------------------------------------------- |
| Full-Stack Application | React + Node.js + Express + MongoDB           |
| Database Schema        | 9 MongoDB collections with relationships      |
| Aggregation Pipeline   | Leaderboard (VIEW equivalent)                 |
| Transaction            | Session booking with conflict check           |
| Trigger                | Auto-update avg_rating on review              |
| Authentication         | JWT + bcrypt (secure)                         |
| Role-based Access      | Student/Faculty with middleware               |
| Responsive UI          | Tailwind CSS mobile-first                     |
| Animations             | Framer Motion transitions                     |
| TypeScript             | Full type safety frontend & backend           |
| Advanced Features      | Learning goals, Mentor requests, Favorites    |

---

## 11. Screenshots Description

### 11.1 Home Page

- Landing page with project overview
- Quick login/register options
- Feature highlights
- Supabase-inspired dark theme

### 11.2 Login Page

- Centered card with logo
- Email and password fields
- Supabase-inspired dark theme
- "Register here" link

### 11.3 Dashboard

- Welcome header with user name
- 4 stat cards (Skills, Sessions, Rating, Notifications)
- Recent notifications list
- Quick action buttons

### 11.3 Browse Mentors

- Search bar with skill filter
- Mentor cards with avatar, name, skills, rating
- "View Profile" and "Book Session" buttons
- Booking modal with date picker

### 11.4 Sessions Page

- Tab navigation (Upcoming/Past/Pending)
- Session cards with status badges (Pending/Confirmed/Completed)
- Accept/Reject buttons for mentors
- Review submission for completed sessions

### 11.5 Leaderboard

- Ranked list with gold/silver/bronze medals
- Mentor name, department, rating, session count
- "Book Now" quick action

### 11.6 My Skills

- List of user's skills with proficiency
- Add/Edit/Delete functionality
- Category-based grouping

### 11.7 Profile Page

- User avatar and bio
- Personal information display
- Edit profile functionality
- Statistics summary

### 11.8 Requests Page

- Incoming mentor request list
- Accept/Reject request actions
- Request status indicators
- Message preview from requester

### 11.9 Favorites Page

- Saved/favorite mentors list
- Quick access to mentor profiles
- Direct session booking from list

---

## 12. Conclusion

SkillSwap successfully demonstrates:

- Full-stack MERN development with TypeScript
- MongoDB document-based database design (9 collections)
- Advanced DBMS features (Aggregation, Transactions, Triggers)
- Secure JWT-based authentication
- Role-based access control
- Interactive UI with smooth animations
- Responsive design for all devices
- Learning goals tracking system
- Mentor request management
- User profiles with bio and avatars
- Favorites/saved mentors feature

The application is production-ready and can be deployed with proper environment configuration.

---

**Submitted by:** **Vishal Singh** ,**Chirag Varshney** and **Aryan Joshi**
**Roll Number: 590028039, 590024860 and 590028005**
**Date:** April 17, 2026
