# แผนงาน 1 สัปดาห์ + แบ่งงาน + โครงคลิป

## แบ่งงาน (3 คน — ถ้า 2 คนให้รวม B กับ C)

| สมาชิก | รับผิดชอบ | ไฟล์หลัก |
|---|---|---|
| **A – Backend / DB** | Express server, Prisma schema, seed, Auth API, Booking API + กฎจองซ้อน, Deploy Render/Neon | `server/` ทั้งหมด |
| **B – Frontend User** | Vite setup, Navbar, AuthProvider, Login/Register, Rooms, Room detail + BookingForm, My Bookings | `client/src/components/`, `client/src/context/`, `client/src/pages/` (ยกเว้น Admin) |
| **C – Admin + เอกสาร** | Admin Dashboard, Manage Rooms, Deploy Vercel, Figma, SRS, ตัดต่อคลิป | `client/src/pages/AdminDashboard.jsx`, `ManageRooms.jsx`, `docs/` |

## Timeline

| วัน | งาน |
|---|---|
| 1 | สร้าง GitHub repo + เพิ่มเพื่อนเป็น collaborator, เปิด Issues ตามตารางด้านล่าง, เขียน SRS ร่าง, เริ่ม Figma |
| 2 | A: schema + auth API · B: layout/Navbar/Login · C: Figma ให้ครบทุกหน้า + ลิงก์ prototype flow |
| 3 | A: rooms + bookings API · B: Rooms + Room detail · C: Admin pages |
| 4 | B: My Bookings · A: deploy backend ขึ้น Render + Neon · C: deploy frontend ขึ้น Vercel + SRS ฉบับสมบูรณ์ |
| 5 | ทดสอบร่วมกัน แก้บั๊ก (เปิด Issue ทุกบั๊กที่เจอ → PR แก้) ทดสอบบนมือถือ |
| 6 | อัดคลิป (เปิดกล้องทุกคน) |
| 7 | ตัดต่อ อัป YouTube (Unlisted) อัปเดต README ด้วยลิงก์ทั้งหมด ส่งงาน |

## GitHub Issues แนะนำ (เปิดแล้วทำทีละอัน)

1. Setup Express server + React (Vite) client
2. Design database schema (Prisma) & seed data
3. Auth API (register/login/logout) + auth middleware
4. Rooms API (CRUD)
5. Bookings API (CRUD) + overlap validation
6. Navbar & layout (responsive)
7. Login / Register pages
8. Rooms list with search & filter
9. Room detail with daily timeline + booking form
10. My Bookings page (edit / cancel)
11. Admin dashboard (stats + all bookings)
12. Admin manage rooms page
13. Deploy backend (Render + Neon) and frontend (Vercel)
14. Write SRS document
15. Daily schedule board (all rooms × time slots)
16. Profile page + change password
17. Export bookings to CSV (admin)
18. Bug: schedule board columns have uneven widths (fix: `table-fixed`)
19. Bug: mobile menu does not close after navigation  ← ตัวอย่าง bug จริงที่เจอระหว่างพัฒนา

## ขั้นตอน Git ต่อ 1 issue

```bash
git checkout main
```
```bash
git pull
```
```bash
git checkout -b feature/bookings-api
```
แก้โค้ด → commit เป็นระยะ ๆ:
```bash
git add .
```
```bash
git commit -m "Add booking overlap validation (#5)"
```
```bash
git push -u origin feature/bookings-api
```
แล้วเปิด Pull Request บน GitHub เขียน `Closes #5` → ให้เพื่อนอีกคน review + approve → Merge

> **สำคัญ:** อาจารย์ดูประวัติการทำงานร่วมกัน ให้แต่ละคน commit / เปิด PR ด้วยบัญชี GitHub ของตัวเอง และกระจาย commit หลายวัน อย่า push ทั้งโปรเจกต์ใน commit เดียว

## โครงคลิป (≤ 20 นาที, เปิดกล้องทุกคน)

| นาที | เนื้อหา | ใครพูด | สิ่งที่แสดง |
|---|---|---|---|
| 0–2 | ชื่อโครงงาน, สมาชิก, ปัญหา (จองซ้อน/ไม่รู้ห้องว่าง), กลุ่มเป้าหมาย | C | สไลด์ + หน้า Landing |
| 2–6 | ฟีเจอร์หลัก, Use case, System flow, Architecture | C | Diagram จาก SRS + Figma |
| 6–9 | Stack: React + Vite, Tailwind, Node.js + Express, Prisma, PostgreSQL, JWT, Zod, Vercel/Render/Neon + เหตุผล | A | ตาราง Tech Stack + ER Diagram |
| 9–15 | Demo บนเว็บจริง: สมัคร → Schedule board คลิกช่องว่าง → จอง → ลองจองทับ (error 409) → แก้ไข → ยกเลิก → Profile เปลี่ยนรหัสผ่าน → login admin → สถิติ → Export CSV เปิดใน Excel → เพิ่มห้อง | B | เปิด DevTools > Network ให้เห็น request/response JSON |
| 15–17 | ปัญหาที่เจอ (ดูหัวข้อด้านล่าง) | A | โค้ดส่วนที่แก้ |
| 17–19 | สิ่งที่ได้เรียนรู้ + ต่อยอด | ทุกคน | |

### ความท้าทาย & วิธีแก้ (ใช้พูดในคลิปได้)
- **ป้องกันการจองซ้อน** — ใช้เงื่อนไข `start < newEnd AND end > newStart` ตรวจที่ server ทุกครั้ง (ไม่เชื่อ client) และไม่นับการจองของตัวเองตอนแก้ไข
- **Timezone** — เบราว์เซอร์ส่งเวลาเป็น ISO (UTC) เก็บใน DB เป็น UTC แล้วแสดงผลตามเวลาเครื่องผู้ใช้ ไม่งั้นเวลาจะเพี้ยน 7 ชั่วโมงบน server ของ Render (ซึ่งใช้เวลา UTC)
- **Cookie ข้ามโดเมน** — frontend (Vercel) กับ backend (Render) อยู่คนละโดเมน cookie login จะถูกบล็อก แก้โดยให้ Vercel rewrite `/api/*` ไปที่ Render ทำให้เป็นโดเมนเดียวกัน (ตอน dev ใช้ proxy ของ Vite แบบเดียวกัน)
- **ความปลอดภัยของ login** — เก็บ JWT ใน httpOnly cookie แทน localStorage, ใช้ข้อความ error เดียวกันเมื่ออีเมลหรือรหัสผ่านผิด
- **Bug เมนูมือถือไม่ปิดหลังเปลี่ยนหน้า** — แก้ด้วย `useEffect` ที่ปิดเมนูเมื่อ `pathname` เปลี่ยน

### แนวทางพัฒนาต่อ
- แจ้งเตือนทางอีเมล / LINE ก่อนประชุม
- จองแบบซ้ำทุกสัปดาห์ (recurring)
- ซิงก์กับ Google Calendar / Outlook
- ระบบอนุมัติการจองห้องใหญ่โดย Admin
- QR code หน้าห้องสำหรับ check-in
