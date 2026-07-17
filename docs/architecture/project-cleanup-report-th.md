# รายงานตรวจสอบและจัดระเบียบโครงสร้าง Syntactic Analysis Tool

วันที่ตรวจสอบ: 18 กรกฎาคม 2026

## 1. โครงสร้างเดิมที่พบ

```text
SAT/
├── backend/
│   ├── main.py                 # FastAPI entry point และ API routes
│   ├── app/
│   │   ├── auth.py             # JWT, password hashing, dependencies
│   │   ├── database.py         # SQLAlchemy engine และ session
│   │   ├── db_models.py        # User, AnalysisHistory, ErrorReport
│   │   ├── model.py            # Hugging Face model loader (singleton)
│   │   ├── parser.py           # S-expression parser
│   │   └── schemas.py          # Request/response schemas
│   ├── migrations/
│   └── tests/
├── frontend/
│   ├── src/
│   │   ├── components/         # Analysis, tree, auth, admin UI
│   │   ├── hooks/              # Theme state
│   │   ├── pages/              # Home page composition
│   │   ├── services/           # Backend API และ Supabase reset-password client
│   │   └── utils/              # Auth token, validation, tree derivations
│   └── public/
└── supabase/
    └── admin_dashboard_schema.sql
```

โครงสร้าง production มีขนาดเหมาะสมอยู่แล้ว จึงไม่ย้ายไฟล์เพียงเพื่อเปลี่ยนตำแหน่ง เพราะจะเพิ่มความเสี่ยงต่อ import และ runtime โดยไม่เพิ่มประโยชน์ชัดเจน

## 2. Dependency mapping และแหล่งอ้างอิงหลัก

| รายการ | ไฟล์หลัก | การใช้งานจริง | สถานะ |
|---|---|---|---|
| Backend entry point / API routes | `SAT/backend/main.py` | Uvicorn และ backend tests import ไฟล์นี้ | เก็บไว้ |
| Authentication | `SAT/backend/app/auth.py` + `SAT/frontend/src/utils/authStorage.js` | Backend เป็นผู้ยืนยัน JWT; frontend เก็บ access token เท่านั้น | เก็บไว้ |
| Database | `SAT/backend/app/database.py`, `db_models.py` | SQLAlchemy session และ models ใช้โดย routes | เก็บไว้ |
| Model loading | `SAT/backend/app/model.py` | `main.py` เรียกผ่าน `predict_s_expression()` | เก็บไว้; มี source of truth เดียว |
| S-expression parsing | `SAT/backend/app/parser.py` | `main.py` แปลงผลโมเดลเป็น tree ก่อนตอบ API | เก็บไว้; มี source of truth ฝั่ง backend เดียว |
| API client | `SAT/frontend/src/services/api.js` | ทุกคำขอ frontend ไป backend ผ่านโมดูลนี้ | เก็บไว้; API URL และ authorization header มีจุดเดียว |
| Account history | `SAT/frontend/src/pages/Home.jsx` + `/history/my` | โหลด/ลบประวัติผ่าน backend database | เก็บไว้ |
| Tree presentation | `TreePanel.jsx`, `StaticTree.jsx`, `treeAnalysis.js`, `treeRules.js` | แสดงผล tree และสรุปผลคนละหน้าที่ | เก็บไว้ |
| Theme | `hooks/useTheme.js`, `index.css` | theme preference ฝั่ง browser เท่านั้น | เก็บไว้ |

## 3. ปัญหาไฟล์หรือ logic ซ้ำที่ยืนยันได้

พบไฟล์ `SAT/frontend/src/utils/analysisHistory.js` ซึ่งทำหน้าที่บันทึก/อ่าน/ลบประวัติการวิเคราะห์ผ่าน `localStorage` ซ้ำกับ backend history API

- ไม่พบ import หรือ reference นอกตัวไฟล์เอง จากการค้นหาทั้ง `SAT/` (ยกเว้น dependency/runtime output)
- หน้าประวัติจริงใช้ `getMyHistory`, `deleteMyHistory`, และ `clearMyHistory` จาก `services/api.js`
- backend บันทึก history ของ guest และผู้ใช้ที่ล็อกอินในฐานข้อมูล และ `/history/my` คืนเฉพาะของผู้ใช้ที่ล็อกอิน

## 4. แผนที่ใช้แก้และผลการเปลี่ยนแปลง

1. ยืนยัน dependency mapping ก่อนแก้ไข
2. ลบเฉพาะ `analysisHistory.js` ที่พิสูจน์แล้วว่าไม่ถูกใช้
3. ไม่ย้ายหรือ rename ไฟล์ production ใด ๆ
4. รัน frontend build และ lint หลังการเปลี่ยนแปลง

## 5. โครงสร้างใหม่

โครงสร้างยังคงเดิม ยกเว้นไม่มี `frontend/src/utils/analysisHistory.js` แล้ว ซึ่งทำให้ history มี source of truth เดียวคือ backend database/API

## 6. ไฟล์ที่ย้าย / rename / ลบ

| ประเภท | ไฟล์ | เหตุผล | Rollback |
|---|---|---|---|
| ลบ | `SAT/frontend/src/utils/analysisHistory.js` | ไม่ถูก import/reference และซ้ำกับ backend history API | กู้คืนจาก Git commit ก่อนหน้าได้ |

ไม่มีการย้ายหรือ rename ไฟล์

## 7. Source of truth ที่เหลือ

- API URL และ authorization header: `SAT/frontend/src/services/api.js`
- Authentication / JWT validation: `SAT/backend/app/auth.py`
- User history: backend database ผ่าน `SAT/backend/main.py` endpoints `/analyze`, `/history/my`
- Model loader: `SAT/backend/app/model.py`
- S-expression parser: `SAT/backend/app/parser.py`

## 8. Mock/demo และข้อมูลที่เก็บไว้

- ไม่พบ mock analysis fallback หรือ admin mock data ใน production frontend
- `backend/tests/test_auth_flows.py` ใช้ mock เฉพาะใน test เพื่อแทน model inference ซึ่งเหมาะสม
- migration, database file, `.env` และ model files ไม่ถูกแก้ไขหรือลบ

## 9. ผลการตรวจสอบ

- Frontend build: ผ่าน
- Frontend lint: ผ่าน
- Backend unittest: ยังรันไม่ได้ใน workspace นี้ เพราะ executable ใน `SAT/backend/venv/Scripts/python.exe` ถูกระบบปฏิเสธการเข้าถึง และไม่มี Python ที่เรียกใช้ได้จาก environment ปัจจุบัน

## 10. ประเด็นที่ยังเหลือและข้อเสนอแนะ

- `AuthPage.jsx` และ `ResetPasswordPage.jsx` ใช้ Supabase เฉพาะ flow reset password ขณะที่ login/register ปกติใช้ backend JWT จึงไม่ใช่ auth mock ซ้ำกันในเส้นทางใช้งานหลัก แต่ควรตัดสินใจเชิงผลิตภัณฑ์ในภายหลังว่าจะรวม password reset ไว้ที่ backend หรือคง Supabase ไว้
- `SAT/backend/sat.db` เป็นไฟล์ฐานข้อมูลที่ tracked อยู่ จึงเก็บไว้ตามข้อกำหนดและไม่ได้ถือเป็น dead code
- การย้าย backend ไปเป็น layered routes/services ยังไม่คุ้มความเสี่ยงในโค้ดขนาดปัจจุบัน; ควรทำเมื่อมี endpoints หรือ business logic เพิ่มขึ้นจริง
