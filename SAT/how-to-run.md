# 0 run backend ครั้งแรก in terminal ใช้แบบ cmd only
cd SAT\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload

## 1 run backend in terminal แบบ cmd only
cd SAT\backend
venv\Scripts\activate
python -m uvicorn main:app --reload

## 2. run frontend in terminal แบบ cmd only 
cd SAT\frontend
npm install
npm run dev


## SAT/setup-local.cmd 
— เครื่องใหม่ดับเบิลคลิกครั้งเดียว เพื่อติดตั้งสิ่งที่จำเป็นและเปิดระบบ

## SAT/run-local.cmd 
— หลังตั้งค่าเสร็จ ดับเบิลคลิกครั้งเดียวเพื่อเปิด backend + frontend