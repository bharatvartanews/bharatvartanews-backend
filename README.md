<<<<<<< HEAD
# Bharat Varta Backend

## Stack
- Node.js + Express
- PostgreSQL
- Prisma
- JWT Auth
- Multer uploads
- Full analytics

## Setup
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev

## Notes
- Soft delete everywhere
- Shared APIs for Web + Dashboard
- Auth strictness toggle via ENABLE_STRICT_AUTH