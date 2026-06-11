# Termiz — доставка еды

Веб-приложение + PWA для заказа еды из ресторана Termiz. Клиенты заказывают без регистрации; панель ресторана — для управления меню и заказами.

## Стек

- Next.js 16, TypeScript, Tailwind CSS
- Prisma + SQLite (локально) / PostgreSQL (production через Docker)
- Auth.js (next-auth v5) — только для партнёров
- Framer Motion, Zustand
- SSE для трекинга заказов, Web Push

## Быстрый старт

```bash
npm install
docker compose up -d
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### Аккаунт партнёра

| Email | Пароль |
|-------|--------|
| partner@test.ru | password123 |

Клиентам регистрация не нужна — достаточно указать имя и телефон при оформлении. Заказы можно найти по телефону на `/orders`.

### Промокоды (демо)

| Код | Скидка |
|-----|--------|
| TERMIZ10 | 10% |
| WELCOME500 | 500 ₸ |

### Самовывоз

Два пункта: ул. Катаева, 66 и пр. Назарбаева, 48/3 — выбираются при оформлении.

## Маршруты

| URL | Описание |
|-----|----------|
| `/` | Меню ресторана (главная) |
| `/cart` | Корзина, промокод, минимальная сумма |
| `/checkout` | Оформление: доставка или самовывоз |
| `/orders` | Поиск заказов по телефону |
| `/orders/[id]` | Отслеживание заказа + push-уведомления |
| `/login` | Вход для партнёров |
| `/partner/dashboard` | Панель ресторана |
| `/partner/menu` | Управление меню (цены, фото, доступность) |
| `/partner/orders` | Входящие заказы |
| `/partner/promos` | Промокоды |
| `/partner/settings` | Настройки, график работы, пункты самовывоза |

### График и предзаказы

В настройках партнёра можно задать часы работы по дням, время последнего заказа и приём предзаказов вне рабочего времени.

## Деплой на VPS (Docker)

Подробно: [deploy/README.md](deploy/README.md)

```powershell
# 1. VPS: bash deploy/server-setup-docker.sh
# 2. Создать /var/www/termiz/.env (deploy/env.docker.example)
# 3. С ПК (Docker Desktop + SSH-ключ):
npm run deploy:docker
```

## Локальная БД (PostgreSQL)

```bash
docker compose up -d
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

## Тесты

```bash
npx playwright install chromium
npm run test:e2e
```

## PWA

Приложение поддерживает установку на телефон через manifest и service worker (`/sw.js`). На главной появляется баннер «Установить», если браузер поддерживает `beforeinstallprompt`.

## Дизайн

- Цвета: белый + оранжевый (`#FF6B00`)
- Design system: `design-system/MASTER.md`
