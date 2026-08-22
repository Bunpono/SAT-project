# เปิดเว็บ SAT ฟรีด้วย Cloudflare Quick Tunnel

วิธีนี้เปิดเว็บจากเครื่อง Windows เครื่องนี้ให้ผู้อื่นใช้งานชั่วคราว โดยไม่ต้องย้ายฐานข้อมูล โมเดล หรือ API และไม่เก็บค่าลับไว้บน GitHub

## เปิดใช้งาน

เปิด PowerShell ที่โฟลเดอร์โปรเจกต์ แล้วรัน:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-cloudflare-demo.ps1
```

รอจนแสดงลิงก์ `https://...trycloudflare.com` แล้วส่งลิงก์นั้นให้นิสิตได้ ระหว่างใช้งานต้องเปิดเครื่อง ต่ออินเทอร์เน็ต และไม่ให้เครื่อง Sleep

## ปิดใช้งาน

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-cloudflare-demo.ps1
```

ลิงก์เป็นลิงก์ชั่วคราวและจะเปลี่ยนเมื่อเปิด Tunnel รอบใหม่ เหมาะกับการสาธิตหรือการใช้งานเพื่อการศึกษาในกลุ่มเล็ก ไม่ใช่บริการถาวรที่มี SLA

ค่าลับของ Hugging Face และ Supabase ยังคงอยู่เฉพาะในไฟล์ `.env` ฝั่ง backend ห้ามส่งไฟล์นี้ให้ผู้อื่นหรือ commit ขึ้น GitHub
