# User Dashboard Backend

Production-ready Node.js/Express microservice for the User Dashboard.

Features
- Emergency: SOS, contacts, reminders (BullMQ over Redis; events via RabbitMQ)
- Medical: appointments, labs, queue (placeholder), pharmacy, transfers, vaccinations
- Home Services: househelp, companionship, assistance
- Wellness: resources listing
- Family: members CRUD, shared medical history
- Support: dispute filing and listing
- Profile: personal, medical, insurance, preferences

Tech Stack
- Node.js 20+, Express
- PostgreSQL (pg)
- Redis (ioredis)
- RabbitMQ (amqplib)
- BullMQ (reminders worker)
- Winston logger
- Nginx + systemd for EC2 deployment

Local Development
1. Copy `.env.example` to `.env` and adjust
2. `npm install`
3. Ensure Postgres, Redis, RabbitMQ running locally
4. Initialize DB: `psql "$POSTGRES_URL" -f db/schema.sql`
5. Run API: `npm run dev`
6. Optional worker (if not running in same process): `npm run worker:reminders`

EC2 Deployment (Ubuntu)
1. SSH to EC2
2. Place repo at `/opt/userdashboard` (or run installer from repo root)
3. `bash scripts/install_ec2_ubuntu.sh`
4. `bash scripts/deploy.sh`
5. Health: `curl localhost:8082/health`

API
- Base: `/api`
- See `src/routes/modules/*.js` and `src/controllers/*` for endpoints and request validation.
- Add authentication middleware as needed.

Security & Hardening
- Helmet, CORS, validation via `express-validator`
- Use private subnets and security groups for DB and MQ
- Rotate credentials; set strong secrets in `.env`
