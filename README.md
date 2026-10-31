# SkillBridge — Student & Freelancer Marketplace

A beginner-friendly full-stack implementation based on the supplied SkillBridge report and screenshots.

## Technology
- Frontend: React + Vite + plain CSS
- Backend: Node.js + Express
- Database: MySQL 8+
- Authentication: bcrypt password hashing + JWT

## Features
- Landing page, How It Works, testimonials
- Register/login with Freelancer or Client role
- Role-specific dashboards
- Client: create, edit and delete jobs; review applications; accept/reject applicants
- Freelancer: browse/search jobs, apply with a bid, track application status
- Freelancer: create and manage services
- Messaging: conversation list and message sending
- Reviews after an application is accepted
- Profile view/update
- Input validation and role-protected API routes

> This is a complete starter implementation. The uploaded report confirms the visible UI and intended workflows, but does not expose the original source code or deployed database. This ZIP is a fresh implementation of those workflows, not a recovery of the original generated source.

## Requirements
- Node.js 18+
- MySQL 8+
- npm

## 1. Create the database
Open MySQL Workbench or the MySQL command line and run:

```sql
SOURCE /full/path/to/SkillBridge/database/schema.sql;
```

Or copy and execute `database/schema.sql` manually.

## 2. Configure the backend
```bash
cd backend
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`.

Edit `.env` and set your MySQL username/password and a long random JWT secret.

Install and start:
```bash
npm install
npm run dev
```
Backend runs at http://localhost:5000

## 3. Configure the frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite (normally http://localhost:5173).

## Demo flow
1. Register one account with role **Client**.
2. Sign in as the client and post a job.
3. Register another account with role **Freelancer**.
4. Browse jobs and apply with a bid.
5. Sign in as the client and accept/reject the application.
6. Sign in as the freelancer to see the updated application status.
7. Create a service and try messaging/reviews.

## Project structure
```text
SkillBridge/
  backend/
    src/
      config/ db.js
      middleware/ auth.js
      routes/ auth.js jobs.js applications.js services.js messages.js reviews.js users.js
      server.js
    .env.example
    package.json
  database/
    schema.sql
  frontend/
    src/
      components/ Navbar.jsx
      context/ AuthContext.jsx
      pages/ Home.jsx Auth.jsx Dashboard.jsx Jobs.jsx Services.jsx Messages.jsx Profile.jsx
      api.js App.jsx main.jsx styles.css
    index.html package.json vite.config.js
```

## Notes
- Do not commit `.env` or share your JWT secret.
- The app uses parameterized SQL queries.
- A user can only edit/delete their own jobs/services and can only review an accepted application.
- For a public deployment, use HTTPS, configure CORS to your real domain, add rate limiting, email verification, password reset, file scanning, and production secrets management.
