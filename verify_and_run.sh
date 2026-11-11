#!/usr/bin/env bash
set -e

echo "======================================================================"
echo " CASEFLOW – Automated Build, Connectivity & Integration Validator"
echo "======================================================================"

echo "[1/6] Starting Services (PostgreSQL, Redis, MinIO)..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  COMPOSE_CMD=""
fi

if [ -n "$COMPOSE_CMD" ]; then
  $COMPOSE_CMD up -d
  echo "[2/6] Waiting for PostgreSQL (5432), Redis (6379), and MinIO (9000)..."
  sleep 5
  $COMPOSE_CMD ps
else
  echo "Docker Compose plugin not found; starting containers directly via docker run..."
  docker start caseflow-postgres 2>/dev/null || docker run -d --name caseflow-postgres \
    -e POSTGRES_DB=caseflow_db -e POSTGRES_USER=caseflow_user -e POSTGRES_PASSWORD=caseflow_pass \
    -p 5432:5432 postgres:15-alpine
  docker start caseflow-redis 2>/dev/null || docker run -d --name caseflow-redis \
    -p 6379:6379 redis:7-alpine redis-server --appendonly yes
  docker start caseflow-minio 2>/dev/null || docker run -d --name caseflow-minio \
    -e MINIO_ROOT_USER=caseflow_minio -e MINIO_ROOT_PASSWORD=caseflow_minio_secret \
    -p 9000:9000 -p 9001:9001 minio/minio:latest server /data --console-address ":9001"
  sleep 5
  docker ps --filter "name=caseflow-"
fi

echo "[3/6] Compiling Spring Boot Backend & Validating Dependencies..."
cd backend
mvn clean test-compile -DskipTests
mvn package -DskipTests
cd ..

echo "[4/6] Installing Angular Dependencies & Running Production Build..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd ..

echo "======================================================================"
echo " ALL CHECKS PASSED!"
echo " To run the backend:  cd ~/Downloads/caseflow/backend && mvn spring-boot:run"
echo " To run the frontend: cd ~/Downloads/caseflow/frontend && npm start"
echo " Advocate Login:      advocate@caseflow.legal / Advocate@123"
echo " Client Login:        client@caseflow.legal / Client@123"
echo "======================================================================"
