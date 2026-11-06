# product-dashboard

The operations team's product dashboard. It lists every product in the marketplace with its price, stock and sales, and each product opens to show who owns it. The backend is an Express API over MySQL, the frontend a React page.

## Stack

| Part | Technology | Local address |
|---|---|---|
| Frontend | React 19, Vite 8 | http://localhost:5173 |
| API | Node.js 22, Express 5 | http://localhost:4000 |
| Database | MySQL 8.4, Sequelize 6 with sequelize-cli migrations | `localhost:3309` |

Docker Compose runs MySQL. The API and the frontend run on your machine. In development, Vite forwards every `/api` request to the API.

## Run it

API, from `backend/`:

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npm run db:migrate
npm run db:seed
npm start
```

Frontend, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. In `backend/`, `npm run dev` restarts the API on file changes and `npm run db:reset` drops, migrates and reseeds. In `frontend/`, `npm run build` followed by `npm run preview` serves the production build on http://localhost:4173.

If port 3309 is taken on your machine, change `DB_PORT` in `backend/.env` before `docker compose up`.

## How the dashboard works

- When the page opens, it loads everything from `GET /api/dashboard`. It loads it again every 15 seconds so the numbers stay current.
- It shows one row per product, sorted by name: product, category, price, stock, units sold and revenue.
- Clicking a row opens it and shows the product's owner: name, company, email, phone, city, owner since, and how many products they sell. Clicking again closes it. One row is open at a time.

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Database connectivity check |
| GET | `/api/dashboard` | Every product with its sales totals and its owner |

```bash
curl http://localhost:4000/api/dashboard
```

The response holds every product; with the default seed that is 500. This example shows only the first one:

```json
{
  "updatedAt": "2026-11-06T08:17:39.380Z",
  "products": [
    {
      "id": 10,
      "name": "Basic Bag 10",
      "category": "Books",
      "priceCents": 3287,
      "stock": 311,
      "description": "A popular choice for gifts, offices and first apartments. Made from durable materials that hold up to daily use. Backed by a two-year warranty from the manufacturer. Every unit is checked twice before it leaves the warehouse. Compatible with most standard accessories on the market.",
      "createdAt": "2026-02-25T03:35:54.000Z",
      "sales": {
        "units": 56,
        "revenueCents": 184072
      },
      "owner": {
        "id": 31,
        "name": "Grace Lewis",
        "company": "Lewis Supply",
        "email": "grace.lewis.31@example.com",
        "phone": "+1 555 0124",
        "city": "Vienna",
        "notes": "Occasionally late with restocking before holidays. Requested access to the new bulk upload tool. Interested in joining the featured sellers programme. Payouts go to a business account in the euro area.",
        "createdAt": "2025-07-28T08:09:51.000Z",
        "productCount": 7
      }
    }
  ]
}
```

## Scripts

Run them from `backend/`.

| Command | What it does |
|---|---|
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Insert test data: `SEED_PRODUCTS` products, 500 by default, one owner per 10 products and about 50 sales per product. The data is the same on every run. Refuses on a non-empty table |
| `npm run db:reset` | Drop all tables, migrate and seed again |
| `SEED_PRODUCTS=20000 npm run db:reset` | Production-sized data: 2,000 owners, 20,000 products, about 1,000,000 sales. Takes about 10 seconds |

## Environment variables

In `backend/.env`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP port of the API |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | see `.env.example` | MySQL connection. Docker Compose reads the same values |
| `SEED_PRODUCTS` | `500` | How many products `db:seed` creates |
| `SQL_LOG` | `0` | `1` prints every SQL query |

## Known issues

In production:

- About 2,000 owners and 20,000 products, with about 1,000,000 sales over the last two years.
- Around ten people from the operations team keep the dashboard open during working hours.
- They mostly look at the first screen of products. They open a handful of rows a day to check an owner.

What happens today:

- With production data, the dashboard takes about 7 seconds to appear. Every load downloads about 19 MB, and the page loads again every 15 seconds.
- While the page is open, opening a row feels sluggish.
- When several people load the dashboard at once, it gets slower for everyone. Five loads at the same time take over 20 seconds each.
- With the default seed it looks fine, so the problem does not show up in development.

Measured on a developer machine, with the production build of the frontend:

| Data | API response time | Response size | Dashboard appears after |
|---|---|---|---|
| Default seed, 500 products | 0.13 s | 0.5 MB | 0.2 s |
| 5,000 products | 1.1 s | 4.8 MB | 1.3 s |
| Production size, 20,000 products | 5.8 s | 19.3 MB | 6.8 s |

## Your task

Find out why the dashboard is slow with production data, and make it fast. You may change the API, the frontend and the database: what is loaded, when it is loaded, and how.

Requirements:

1. Reproduce and investigate the performance problem.
2. Identify the main bottleneck using appropriate debugging or profiling tools.
3. Analyze database queries and application logic where relevant.
4. Implement an optimization based on the findings.
5. Compare performance before and after the change.
6. Ensure that the optimization does not break existing functionality.

Expected outcome:

- The dashboard appears quickly with production-sized data, also when several people have it open.
- Everything the operations team can do today still works: see all products with price, stock and sales, and open a product to see its owner.

How we work:

- Research freely: official documentation first, anything else that helps. Keep a note of what you relied on.
- When blocked, ask a focused question and include what you already tried.
- Commit in small steps so the path you took is visible.
- At the end we review the implementation together. Be ready to walk through the code, explain the trade-offs you made, and name what you would do differently with more time.
