
# CASEFLOW – Advocate Case Follow-Up & Action Management System
**Tagline:** *Simplify Cases. Strengthen Justice.*

## Architecture & Technology Stack
- **Presentation Layer**: Angular 17, TypeScript, Angular Material, HTML5, CSS3 (Soft Pastel Legal SaaS Design System)
- **Application Layer**: Java 17, Spring Boot 3.2.5, Spring Security + JWT, Spring Data JPA / Hibernate, Spring Scheduler, WebSocket/STOMP
- **Data & Storage Layer**: PostgreSQL 15 (Flyway schema migrations), MinIO Object Storage (legal document binaries), Redis 7 (dashboard caching)

## Quick Start Instructions (Ubuntu / Linux)

### 1. Start Infrastructure Services (PostgreSQL, Redis, MinIO)
```bash
cd caseflow
cp .env.example .env
docker compose up -d
```

### 2. Build & Run Spring Boot Backend
```bash
cd caseflow/backend
mvn clean package -DskipTests
mvn spring-boot:run
```
The backend starts on `http://localhost:8080` and automatically runs Flyway migration `V1__init_schema.sql` and seeds demo Advocate and Client data.

### 3. Install & Run Angular Frontend
```bash
cd caseflow/frontend
npm install
npm start
```
Open `http://localhost:4200` in your browser.

### Demo Credentials
- **Advocate Portal**: `advocate@caseflow.legal` / `Advocate@123`
- **Client Portal**: `client@caseflow.legal` / `Client@123`

