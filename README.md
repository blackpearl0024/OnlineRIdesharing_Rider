
# Online Ride-Sharing — Rider App

**Online Ride-Sharing (Rider)** — a full‑stack prototype for riders built with **Next.js (frontend)** and **Java (backend)**.  
Focus: realistic ride booking & tracking experience with map-based routing, alternate routes, simulated traffic, wallet/ test payments, and vehicle classification.

> **Tech highlight:** Next.js + Leaflet map, OSRM routing server, Clerk for auth, Photon geocoding, Razorpay test + in-app wallet, MongoDB for persistence, Java (Spring Boot) backend APIs.

---

## Table of Contents
- [Live features](#live-features)
- [Architecture](#architecture)
- [Getting started (dev)](#getting-started-dev)
  - [Prerequisites](#prerequisites)
  - [OSRM server (routing)](#osrm-server-routing)
  - [Frontend (Next.js)](#frontend-nextjs)
  - [Backend (Java / Spring Boot)](#backend-java--spring-boot)
- [Environment variables (examples)](#environment-variables-examples)
- [How features work (quick)](#how-features-work-quick)
- [Testing payments / Wallet flow](#testing-payments--wallet-flow)
- [Common commands](#common-commands)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License & credits](#license--credits)
- [Contact](#contact)

---

## Live features
- Rider sign up / sign in using **Clerk** (passwordless or email/password flows).
- Interactive **Leaflet** map for picking origin/destination and tracking rides.
- **Route optimization** using a self-hosted or remote **OSRM** server.
- Show **alternate routes** and highlight estimated ETA for each.
- **Traffic simulation** (client-side JavaScript) to create realistic vehicle movement and congestion for demo/testing.
- **Photon** API (open-source geocoder) to convert address strings → latitude/longitude.
- **Vehicle classifications** (e.g., bike / hatchback / sedan / SUV) with pricing differences.
- **Razorpay** test integration for payments — real payment flow is simulated with a wallet system to avoid real transactions in testing.
- **MongoDB** stores users, rides, vehicle types, payments/wallets, and ride history.
- Java (Spring Boot) backend exposing REST APIs consumed by the Next.js frontend.

---

## Architecture
```

[Next.js Frontend]  <--->  [Spring Boot Backend (REST APIs)]  <--->  [MongoDB]
|
+--> OSRM routing server (HTTP)
|
+--> Photon Geocoding API (HTTP)
|
+--> Clerk (Auth)
|
+--> Razorpay (test)  (payments)  + Wallet simulation in backend

````

---

## Getting started (dev)

### Prerequisites
- Node.js (>=16) and npm/yarn
- Java 11+ / Maven (for backend)
- MongoDB (local or cloud Atlas)
- OSRM (if you want local routing server) — Linux recommended for local OSRM.
- Clerk account (for auth) — or use Clerk dev keys
- Razorpay test account (or use test keys)
- Photon geocoding: you may use public Photon API or self-hosted instance

---

### OSRM server (routing)
You can use a public routing server for development but for realistic route optimization and alternate-route responses use an OSRM instance.

**Local OSRM (quick summary)**:
1. Download an OSM extract (e.g., `region.osm.pbf`) from Geofabrik for your area.
2. Install OSRM tools (osrm-backend).
3. Run:
   ```bash
   osrm-extract -p profiles/car.lua region.osm.pbf
   osrm-contract region.osrm
   osrm-routed --port 5000 region.osrm
````

4. Test: `http://localhost:5000/route/v1/driving/<lon1>,<lat1>;<lon2>,<lat2>?alternatives=true`

**Notes**

* Set `alternatives=true` to get alternate routes.
* OSRM returns route geometries, durations, distances — frontend decodes polyline to display routes.

---

### Frontend (Next.js)

Assumes project structure: `frontend/` or root contains Next.js app.

1. Clone repo & go to frontend:

   ```bash
   git clone https://github.com/blackpearl0024/OnlineRIdesharing_Rider.git
   cd OnlineRIdesharing_Rider/frontend
   ```

2. Install deps:

   ```bash
   npm install
   # or
   yarn install
   ```

3. `.env.local` — create and add variables (see below example).

4. Run dev server:

   ```bash
   npm run dev
   # opens at http://localhost:3000
   ```

---

### Backend (Java / Spring Boot)

Assumes your backend is in `/backend` and uses Maven.

1. Go to backend:

   ```bash
   cd ../backend
   ```

2. Configure `application.properties` (see env example below).

3. Run:

   ```bash
   ./mvnw spring-boot:run
   # or
   mvn spring-boot:run
   ```

---

## Environment variables (examples)

### Frontend `.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_OSRM_URL=http://localhost:5000
NEXT_PUBLIC_PHOTON_URL=https://photon.komoot.io
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_pk_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
NEXT_PUBLIC_APP_NAME=OnlineRideSharingRider
```

### Backend `application.properties` or env

```
MONGODB_URI=mongodb://localhost:27017/onlineridesharing
CLERK_API_KEY=clerk_sk_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=rzp_test_secret
OSRM_BASE_URL=http://localhost:5000
PHOTON_BASE_URL=https://photon.komoot.io
JWT_SECRET=some_secure_secret
SERVER_PORT=8080
```

---

## How features work (quick)

* **Geocoding (Photon)**: Frontend sends address string → Photon → receives lat,lon for marker placement.
* **Routing (OSRM)**: Frontend requests `route/v1/driving` from OSRM with `alternatives=true`. OSRM returns primary + alternate route(s). Frontend shows all and user picks one.
* **Traffic simulation**: Client-side JS spawns simulated vehicles moving along route polylines; congestion can be simulated by adjusting speeds on route segments.
* **Vehicle classification**: Select vehicle class at booking; backend calculates fare per class.
* **Payment (Razorpay + Wallet)**:

  * Use Razorpay **test keys** only.
  * On payment success webhook (or simulated callback), backend credits rider wallet or marks ride paid.
* **Auth (Clerk)**: Frontend uses Clerk to sign in. Backend verifies Clerk session tokens on requests.

---

## Testing payments / Wallet flow

1. Use Razorpay test keys (dashboard → test credentials).
2. For production-like flow without real transactions:

   * Use Razorpay test checkout (it simulates success/failure).
   * Or implement a backend “dev-topup” endpoint that credits wallet for development.
3. Backend should record `paymentId`, `orderId`, and `status` even in test mode.

---

## Common commands

* Frontend:

  * `npm run dev` — start Next.js
  * `npm run build && npm run start` — production build
* Backend:

  * `./mvnw spring-boot:run` — run backend
  * `mvn test` — run tests
* DB:

  * `mongod` or connect Atlas via connection string

---

## Troubleshooting

* **OSRM route 500 / no routes** — check OSM extract region and profile. Use coordinates inside region bounds.
* **Clerk login failing** — ensure Clerk publishable & secret keys are configured; check allowed origins/redirect URLs in Clerk dashboard.
* **CORS errors** — add CORS config on backend to allow `http://localhost:3000`.
* **Razorpay webhook failing** — ensure backend webhook URL is reachable and webhook secret matches.
* **Photon returns many results** — pick top suggestion or let user refine input.

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes and push
4. Open a PR with a clear description and any screenshots/demos

---

## License & credits

* Open-source components (Next.js, Leaflet, OSRM, Photon, Clerk, Razorpay, MongoDB). Check each tool’s license.
* Recommended license: **MIT**.

---

## Acknowledgements

* OSRM — routing engine
* Leaflet — mapping UI
* Photon — geocoder
* Clerk — authentication
* Razorpay — payments (test mode)
* MongoDB — persistence

---

## Contact

For questions or suggestions, open an issue in this repository.

```

---

```
