# เปิด Syntactic Analysis Tool ด้วย GitHub Codespaces

วิธีนี้รัน React, FastAPI, PyTorch, T5 และ Supabase เหมือนระบบเดิม โดยใช้โควตา GitHub Codespaces ของบัญชีส่วนบุคคล

## 1. เพิ่ม Codespaces secrets

เปิด GitHub แล้วไปที่ **Settings > Codespaces > Secrets > New secret** จากนั้นเพิ่มค่าต่อไปนี้ โดยเลือก repository `Bunpono/SAT-project` ให้เข้าถึง secret แต่ละตัว

```text
HF_TOKEN
SUPABASE_URL
SUPABASE_SECRET_KEY
JWT_SECRET_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

ห้ามใส่ค่า secret ลงใน repository, commit, screenshot หรือข้อความสาธารณะ

ค่าเพิ่มเติมต่อไปนี้ไม่จำเป็นต้องสร้าง เพราะระบบมีค่าเริ่มต้นแล้ว

```text
HF_MODEL_ID=SAT-Project/SAT-Model-T1
HF_MODEL_CACHE_DIR=<Codespace cache>
```

## 2. สร้าง Codespace

1. เปิด repository `Bunpono/SAT-project` บน GitHub
2. กด **Code**
3. เลือกแท็บ **Codespaces**
4. กด **Create codespace** บน branch ที่มีโฟลเดอร์ `.devcontainer`
5. รอการติดตั้ง Python, PyTorch และ frontend dependencies จนเสร็จ

การสร้างครั้งแรกอาจใช้เวลาหลายนาที เพราะต้องติดตั้ง PyTorch และดาวน์โหลด dependencies

## 3. เปิดระบบ

ใน Terminal ของ Codespace รัน:

```bash
bash .devcontainer/start-app.sh
```

สคริปต์จะตรวจ secrets, เปิด FastAPI, โหลดโมเดล และเปิด Vite บน port `5173`

## 4. แชร์ลิงก์ให้นิสิต

1. เปิดแท็บ **PORTS** ใน Codespace
2. หา port `5173` ชื่อ **SAT Web App**
3. ตรวจว่า Port Visibility เป็น **Public**
4. กดไอคอน Copy Local Address
5. เปิดลิงก์ในหน้าต่างไม่ระบุตัวตนก่อนส่งให้นิสิต

URL จะมีรูปแบบใกล้เคียง:

```text
https://CODESPACE-NAME-5173.app.github.dev
```

port `8000` ต้องคงสถานะ **Private** เพราะ frontend ติดต่อ backend ผ่าน Vite proxy ที่อยู่ใน Codespace เดียวกัน

## 5. ปิดเมื่อใช้งานเสร็จ

กด `Ctrl+C` ใน Terminal แล้วเลือก **Stop codespace** จาก GitHub เพื่อหยุดใช้ compute quota

อย่าลบ Codespace หากต้องการเก็บ model cache ไว้ใช้ครั้งต่อไป แต่ควรตรวจ storage quota เป็นระยะ

## การแก้ปัญหาเบื้องต้น

- หากแจ้งว่า secret ขาด ให้เพิ่ม secret แล้วเปิด Terminal ใหม่
- หากโมเดลโหลดไม่ได้ ให้ตรวจ `HF_TOKEN` และสิทธิ์เข้าถึง `SAT-Project/SAT-Model-T1`
- หากหน้าเว็บเปิดแต่ Analyze ไม่ทำงาน ให้ดู `/tmp/sat-backend.log`
- หากลิงก์เปิดจากเครื่องอื่นไม่ได้ ให้ตรวจว่า port `5173` เป็น Public
- หาก GitHub ระงับ Codespace ให้ตรวจโควตาที่ **Settings > Billing and licensing**
