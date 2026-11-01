# Huddle – Meeting Room Booking System

ระบบจองห้องประชุมออนไลน์ ผู้ใช้ดูตารางว่างของห้องและจองได้ทันที ระบบป้องกันการจองซ้อน (double booking) อัตโนมัติ ผู้ดูแลระบบ (Admin) จัดการห้องและดูสถิติการใช้งานได้

| | |
|---|---|
| **Live Demo** | https://huddle-murn.onrender.com |
| **API health** | https://huddle-murn.onrender.com/api/health |
| **GitHub** | https://github.com/Rommie22194/Huddle |
| **UI Prototype (Penpot)** | https://design.penpot.app/?screen=viewer&file-id=5009c98b-0fb2-816e-8008-d9206c560488&page-id=5009c98b-0fb2-816e-8008-d9206c560489&section=interactions&frame-id=39eed252-2d23-8090-8008-d922593810a5&index=0&share-id=d693279c-8a27-4d2b-99d9-7b98a0723212 |
| **Video** | `<ลิงก์ YouTube Unlisted>` |

## Test Accounts

| Role | Email | Password |
|---|---|---|
| User | `user@mrbs.com` | `User@1234` |
| Admin | `admin@mrbs.com` | `Admin@1234` |

**ขั้นตอนเข้าใช้งาน:** เปิดเว็บ → Log in (หรือ Sign up สมัครใหม่) → หน้า Schedule จะแสดงทุกห้องของวันนั้น → คลิกช่องเวลาที่ว่าง → กรอกชื่อการประชุม → Book room → ดู/แก้ไข/ยกเลิกได้ที่ My bookings · แก้ชื่อ/เปลี่ยนรหัสผ่านได้ที่ชื่อผู้ใช้มุมขวาบน (Profile) · Admin มีเมนู Admin (สถิติ + Export CSV) และ Edit rooms เพิ่ม

> ถ้าเปิดเว็บครั้งแรกแล้วโหลดช้า (~30–50 วินาที) เป็นเพราะ Render (แพ็กเกจฟรี) ปลุก server ที่หลับอยู่ รอสักครู่แล้วลองใหม่

## Features

- **Authentication** – สมัคร / เข้าสู่ระบบ / ออกจากระบบ (JWT ใน httpOnly cookie, รหัสผ่าน hash ด้วย bcrypt)
- **Schedule board** – ตารางห้องว่างรายวัน (ทุกห้อง × ช่องละ 30 นาที, 08:00–20:00) เลื่อนวันได้ คลิกช่องว่างแล้วไปหน้าจองพร้อมกรอกวัน-เวลาให้อัตโนมัติ
- **Rooms** – ค้นหาห้องตามชื่อ/สถานที่ กรองตามความจุ แต่ละห้องบอกสถานะตอนนี้ ("Free until 14:00" / "In use until 11:00")
- **Room page** – ตารางรายชั่วโมงของห้องนั้น + ฟอร์มจองที่เตือนทันทีถ้าเวลาทับกับการจองอื่น
- **Suggest free rooms** – ถ้าห้องที่เลือกไม่ว่าง ระบบแนะนำห้องอื่นที่ว่างในเวลาเดียวกันและจุคนได้พอ กดเลือกแล้วย้ายไปห้องนั้นโดยข้อมูลที่กรอกไว้ไม่หาย (ใช้ได้ทั้งตอนจองใหม่และตอนแก้ไขการจอง)
- **Profile** – แก้ชื่อ/แผนก และเปลี่ยนรหัสผ่าน (ต้องใส่รหัสเดิมก่อน)
- **Bookings (CRUD)** – สร้าง, ดู, แก้ไข, ยกเลิกการจอง (แท็บ Upcoming / Past / Cancelled)
- **Validation** – ห้ามจองซ้อน, ห้ามจองย้อนหลัง, เวลาจบต้องหลังเวลาเริ่ม, จำนวนคนไม่เกินความจุ, จองได้ไม่เกิน 8 ชม. (ตรวจทั้งฝั่ง client และ server ด้วย Zod)
- **Admin** – สถิติการใช้ห้อง, ดู/แก้ไข/ยกเลิกการจองทั้งหมด, **Export CSV** (เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน), CRUD ห้องประชุม (เปิด/ปิดการจองห้องได้)
- **Responsive** – ใช้งานได้ทั้งมือถือ แท็บเล็ต และเดสก์ท็อป

## Tech Stack

| Layer | Technology | เหตุผล |
|---|---|---|
| Frontend | React 19 + Vite + React Router + Tailwind CSS 4 | Vite เร็ว ตั้งค่าน้อย, Tailwind ทำ responsive ได้ไว |
| Backend | Node.js + Express 5 (JavaScript, REST API) | เรียนรู้ง่าย มี middleware ครบ, Express 5 จับ error ของ async ให้อัตโนมัติ |
| Database | PostgreSQL + Prisma ORM | ข้อมูลมีความสัมพันธ์ (User–Booking–Room), Prisma ทำ migration และป้องกัน SQL injection |
| Auth | JWT (jsonwebtoken) + bcryptjs + httpOnly cookie | ปลอดภัยกว่าเก็บ token ใน localStorage |
| Validation | Zod | ใช้ schema เดียวตรวจข้อมูลทุก request |
| Security | Helmet | ตั้ง security headers ให้อัตโนมัติ |
| Hosting | Render (เว็บ + API) + Supabase (PostgreSQL) | ฟรีทั้งหมด, Render deploy อัตโนมัติเมื่อ push GitHub |

## Project Structure

```
client/                    # Frontend (React + Vite)
  src/
    pages/                 # หน้าเว็บ: Home, Login, Schedule, Rooms, RoomDetail, MyBookings, Profile, Admin...
    components/            # Navbar, BookingForm, BookingList, RoomCard, ui
    context/               # AuthProvider (เก็บสถานะ login)
    lib/api.js             # fetch helper + ฟังก์ชันจัดการวันเวลา
  vite.config.js           # proxy /api -> http://localhost:4000 ตอน dev
server/                    # Backend (Express)
  prisma/
    schema.prisma          # Database schema (User, Room, Booking)
    seed.js                # ข้อมูลตัวอย่าง + test accounts
  src/
    index.js               # เริ่ม server
    app.js                 # ตั้งค่า Express + routes
    routes/                # auth, rooms, bookings, admin
    lib/                   # prisma, auth middleware, validators, กฎการจอง
docs/                      # SRS และแผนงาน
```

## REST API

| Method | Endpoint | สิทธิ์ | คำอธิบาย |
|---|---|---|---|
| POST | `/api/auth/register` | Public | สมัครสมาชิก |
| POST | `/api/auth/login` | Public | เข้าสู่ระบบ |
| POST | `/api/auth/logout` | Public | ออกจากระบบ |
| GET | `/api/auth/me` | User | ข้อมูลผู้ใช้ปัจจุบัน |
| PUT | `/api/auth/profile` | User | แก้ชื่อ / แผนก |
| PUT | `/api/auth/password` | User | เปลี่ยนรหัสผ่าน |
| GET | `/api/rooms?q=&minCapacity=` | User | รายการห้อง |
| GET | `/api/rooms/schedule?from=&to=` | User | ทุกห้องพร้อมการจองในช่วงเวลา (สูงสุด 7 วัน) |
| POST | `/api/rooms` | Admin | เพิ่มห้อง |
| GET | `/api/rooms/:id?from=&to=` | User | รายละเอียดห้อง + การจองในช่วงเวลา |
| PUT | `/api/rooms/:id` | Admin | แก้ไขห้อง |
| DELETE | `/api/rooms/:id` | Admin | ลบห้อง |
| GET | `/api/bookings` (`?scope=all` สำหรับ admin) | User | รายการการจอง |
| POST | `/api/bookings` | User | สร้างการจอง |
| GET | `/api/bookings/:id` | Owner/Admin | ดูการจอง |
| PUT | `/api/bookings/:id` | Owner/Admin | แก้ไขการจอง |
| DELETE | `/api/bookings/:id` | Owner/Admin | ยกเลิกการจอง |
| GET | `/api/admin/stats` | Admin | สถิติ |
| GET | `/api/admin/bookings.csv?roomId=` | Admin | ดาวน์โหลดการจองเป็น CSV |
| GET | `/api/health` | Public | ตรวจว่า server ทำงาน |

## Run Locally

ต้องมี Node.js 20.6+ และ PostgreSQL (ใช้ Docker ง่ายสุด)

**1. เปิดฐานข้อมูล**
```bash
docker run -d --name mrbs-postgres -e POSTGRES_USER=mrbs -e POSTGRES_PASSWORD=mrbs -e POSTGRES_DB=mrbs -p 5433:5432 postgres:16-alpine
```

**2. Backend** (terminal ที่ 1, ในโฟลเดอร์ `server`)
```bash
cp .env.example .env
```
```bash
npm install
```
```bash
npx prisma migrate dev
```
```bash
npm run db:seed
```
```bash
npm run dev
```
API จะรันที่ http://localhost:4000

**3. Frontend** (terminal ที่ 2, ในโฟลเดอร์ `client`)
```bash
npm install
```
```bash
npm run dev
```
เปิด http://localhost:5173

## Deploy

ระบบจริงใช้ **Render (เว็บ + API ใน service เดียว)** และ **Supabase (PostgreSQL)** ทั้งคู่ region Singapore แพ็กเกจฟรี

```
Browser ──HTTPS──> Render web service "huddle"
                   ├─ Express serves the React build (client/dist)
                   └─ /api/*  ──Prisma──> Supabase Postgres (session pooler)
```

เว็บกับ API อยู่โดเมนเดียวกัน cookie login จึงใช้ได้โดยไม่ต้องตั้ง CORS

### 1) Database – Supabase
1. สร้าง project ที่ [supabase.com](https://supabase.com) (region Singapore)
2. สร้าง user สำหรับแอป ใน SQL Editor:
   ```sql
   create role huddle_app with login password '<strong-password>';
   grant usage, create on schema public to huddle_app;
   ```
3. Connection string (Session pooler, IPv4 – Render ใช้ IPv6 ไม่ได้):
   `postgresql://huddle_app.<project-ref>:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?schema=public`

### 2) Web + API – Render
1. [render.com](https://render.com) → New → **Web Service** → เลือก repo นี้ (Root Directory เว้นว่าง)
2. Build Command: `npm run build` · Start Command: `npm start` · Plan: Free
3. Environment Variables: `DATABASE_URL` (จากข้อ 1), `JWT_SECRET` (ข้อความสุ่มยาว ๆ), `NODE_ENV=production`, `NODE_VERSION=22`
4. ทุกครั้งที่ push ขึ้น `main` Render จะ deploy ใหม่อัตโนมัติ – build จะ build หน้าเว็บ, รัน migration และ seed ข้อมูลตัวอย่างให้เอง (seed ใช้ upsert รันซ้ำได้)

> แพ็กเกจฟรี: Render หลับเมื่อไม่มีคนใช้ 15 นาที (เปิดครั้งแรกรอ ~30–50 วิ) · Supabase จะ pause ถ้าไม่มีการใช้งาน 7 วัน – เข้า dashboard กด Restore ก่อนเดโม
> Tables อยู่ใน schema `public` แต่เปิด Row Level Security ไว้ และไม่ได้ให้สิทธิ์ role `anon`/`authenticated` จึงอ่านผ่าน Supabase REST API ไม่ได้

## Team Workflow (Git)

- `main` = โค้ดที่ deploy ได้เสมอ, ทำงานใน branch `feature/<ชื่อฟีเจอร์>`
- เปิด GitHub Issue ก่อนเริ่มงาน → สร้าง branch → Pull Request อ้างอิง issue (`Closes #<เลข>`) → ให้เพื่อน review → Merge
- ดูแผนแบ่งงานใน [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md)
