# Деплой Termiz

## Docker (рекомендуется)

Стек на сервере: **Docker + PostgreSQL + Next.js** (nginx на хосте).

### 1. Первичная настройка VPS (один раз)

```bash
ssh root@109.235.117.49
bash deploy/server-setup-docker.sh
```

### 2. `.env` на сервере

```bash
nano /var/www/termiz/.env
```

Скопируйте из `deploy/env.docker.example`. Сгенерируйте секреты:

```bash
openssl rand -base64 32   # AUTH_SECRET
openssl rand -base64 24   # POSTGRES_PASSWORD
```

Первый деплой: `RUN_SEED=1` (потом уберите).

### 3. Деплой с Windows

Нужны: **Docker Desktop**, SSH-ключ (`scripts/setup-vps-ssh.ps1`).

```powershell
cd D:\Проекты\termiz
$env:DEPLOY_SSH_KEY = "$env:USERPROFILE\.ssh\id_ed25519_termiz"
npm run deploy:docker
```

### 4. GitHub Actions

Секреты: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`  
Workflow: `.github/workflows/deploy-docker.yml` (при `git push`).

### Полезные команды на сервере

```bash
cd /var/www/termiz
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml restart app
```

### Локальная разработка

```bash
docker compose up -d          # Postgres
npm run db:push && npm run db:seed
npm run dev
```

---

## pm2 без Docker (альтернатива)

См. `scripts/deploy-vps.ps1` — легче для 1 GB RAM, но без Postgres в контейнере.
