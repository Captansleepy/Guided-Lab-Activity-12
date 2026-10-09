# CSC220 React & API Integration

Completed implementation of the supplied **Week 11 Guided Lab** (React + Express + MongoDB + CORS + JWT), stored in the Activity 12 repository.

## Requirements

- Node.js 22.12+ (or Node.js 24)
- MongoDB running locally, or a MongoDB Atlas connection string
- Two terminals

## 1. Start the API

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env`: set `MONGO_URI` to your MongoDB connection string and replace `JWT_SECRET` with a long random value. For example, generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

On macOS/Linux, use `cp .env.example .env` instead of `Copy-Item`.

```powershell
npm run dev
```

The API starts at http://localhost:3000 after MongoDB connects. The example URI uses a local database named `csc220`. For Atlas, configure your database user and network access before starting.

## 2. Register the lab account once

In Postman, send **POST** to `http://localhost:3000/api/auth/register`, using **Body → raw → JSON**:

```json
{
  "email": "student1@example.com",
  "password": "password123"
}
```

Expect `201 Created`, with the account ID and email only. These are the sample credentials from the lab, not a real account. Passwords are hashed with bcrypt before storage.

## 3. Start React in another terminal

From the repository root:

```powershell
cd client
npm install
npm run dev
```

Open http://localhost:5173. Vite uses a strict port so it matches the API's allowed CORS origin.

## Features

- Public student list fetched with `useEffect` and `fetch`.
- Loading, empty-list, and error messages.
- Login with a JWT stored only in React state.
- Protected student creation and deletion, with immediate state updates.
- MongoDB persistence and stable `_id` React keys.
- Scores from 0–100, with Passed/Failed at 60.
- Logout clears the token and disables Add/Delete (optional challenge).
- Failed Add requests preserve the form values so you can retry.
- Responsive layout and labeled, required form inputs.

## API endpoints

| Method | Path | Authentication | Result |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | Receive JWT |
| GET | `/api/students` | Public | List students |
| POST | `/api/students` | Bearer JWT | Create student |
| DELETE | `/api/students/:id` | Bearer JWT | Delete student; 204 with no body |

## Manual lab checks

1. Load the page: check loading feedback followed by student data or the empty message.
2. Stop the API and refresh: check the error message. Restart the API and refresh.
3. Log in, add a student, and refresh: the student remains; log in again because the token is held only in memory.
4. Delete a student and refresh: the student remains deleted.
5. Log out: Add/Delete become disabled. Direct POST/DELETE requests without a token return 401.
6. Temporarily remove the CORS block in `server/app.js`, restart, and refresh to observe the browser CORS error. Restore it afterwards.

## Build

```powershell
cd client
npm run build
```

## Submission

The supplied document calls this **Week 11 – Activity 19**. Submit this repository URL and a screenshot showing the working React page with student data to the corresponding LMS activity. Follow your instructor's naming if it differs from the repository name.

`.env`, `node_modules/`, build output, and logs are ignored by Git. Never commit real database credentials.

## Automated verification

```powershell
npm test --prefix server
npm run build --prefix client
```

The server tests cover authentication failures, valid/invalid JWTs, login, student validation, list/create/delete routes, and the empty 204 response. They use isolated model stubs and do **not** verify a live MongoDB connection or database persistence. Complete the manual checklist against your own MongoDB database and capture your submission screenshot there.
