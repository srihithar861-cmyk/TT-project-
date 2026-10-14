# ScholarSpace Platform

This repository contains both the backend and frontend for ScholarSpace.

## Project Structure
- `ScholarSpace-Backend-main/`: Spring Boot Java 21 REST API backend with MySQL / TiDB Cloud support.
- `ScholarSpace-Frontend-main/`: Vite + React frontend single page application.

## Deploying Backend to Render
- **Root Directory**: `ScholarSpace-Backend-main`
- **Runtime**: `Java`
- **Build Command**: `chmod +x mvnw && ./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`

## Deploying Frontend to Vercel
- **Root Directory**: `ScholarSpace-Frontend-main`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
