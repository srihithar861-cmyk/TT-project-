# Scholarship Platform

## Run locally

1. Start the Spring Boot backend from `backend/backend` with `mvn spring-boot:run`. It listens on `http://localhost:8080` and uses the MySQL database configured in `src/main/resources/application.properties`.
2. Start the frontend from `frontend-app` with `npm install` (first run only), then `npm run dev`.
3. Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to the backend.

The student profile form saves a student through `POST /api/students` and then loads recommendations from `GET /api/matching/{studentId}`.
