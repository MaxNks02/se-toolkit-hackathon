# 7-Day Sprint Plan: Innopolis Event Manager (TMA)

To finish this in one week, we are following an aggressive "Feature-Freeze" approach. By Day 5, no new features—only fixes.

---

## 🗓 Day-by-Day Sprint

### **Day 1: Backend Foundation & Database**
* **Goal:** Get the API skeleton and DB live.
* **Tasks:**
    * Initialize Spring Boot project (Spring Web, Data JPA, Postgres Driver).
    * Create PostgreSQL tables: `users`, `events`, `participants`.
    * Set up Docker Compose for a local PostgreSQL instance.
    * **The "Must-Have":** Implement the Telegram `initData` validation service (security).

### **Day 2: Core API Development**
* **Goal:** Business logic for events.
* **Tasks:**
    * Create REST controllers for `GET /events` (fetch all) and `POST /events` (create).
    * Implement the `/join` logic (mapping a User ID to an Event ID).
    * Add a simple "Innopolis Location" enum/list (ArtSpace, 318, Sports Complex) to avoid free-text errors.

### **Day 3: Frontend & Telegram SDK**
* **Goal:** Get the app running inside Telegram.
* **Tasks:**
    * Scaffold Vue 3 project with Vite and Tailwind CSS.
    * Install `@telegram-apps/sdk`.
    * Implement the Auth bridge: Send `initData` to your Java backend to get a JWT or Session.
    * Test basic connectivity: Display the user's Telegram Name on the home screen.

### **Day 4: UI Construction (The Mobile Experience)**
* **Goal:** Build the actual screens.
* **Tasks:**
    * **Home View:** A list of event cards showing time, title, and "slots remaining."
    * **Create View:** A minimal form (Title, Date, Location).
    * **Integration:** Connect Vue components to your Spring Boot API.
    * **Theme:** Use CSS variables (e.g., `var(--tg-theme-button-color)`) so it looks native.

### **Day 5: Dockerization & Orchestration**
* **Goal:** "Write once, run anywhere."
* **Tasks:**
    * Write a Multi-stage `Dockerfile` for the Java backend.
    * Write a `Dockerfile` for the Vue frontend (using Nginx to serve static files).
    * Link everything in `docker-compose.yml` (App + DB + Nginx).
    * Test the entire stack on your local machine as one unit.

### **Day 6: Deployment & SSL (Crucial)**
* **Goal:** Live URL with HTTPS.
* **Tasks:**
    * Deploy to your VPS.
    * Set up Nginx as a reverse proxy to handle incoming traffic.
    * **HTTPS:** Generate a certificate via Certbot (Let's Encrypt). *Telegram will not load your app without HTTPS.*
    * Point `@BotFather` to your new URL.

### **Day 7: Polishing & Bug Hunting**
* **Goal:** Zero crashes.
* **Tasks:**
    * Add Haptic Feedback (vibration) on "Join" button clicks.
    * Fix CSS layout issues on small screens.
    * Final testing in the Innopolis environment.
    * **Launch!**

---

## ⚡ Speed Hacks
* **UI:** Don't build custom components. Use a library like **PrimeVue** or just raw **Tailwind** to save time.
* **Security:** If you're really pressed for time, use the Telegram ID as a simple Auth header (but validate it!) rather than building a full OAuth/JWT system.
* **Testing:** Use `ngrok` during Days 3 and 4 to see your local code on your phone immediately without deploying.
