import os

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, inspect, select, text
from sqlalchemy.orm import Session, joinedload

load_dotenv()

from app.auth import (  # noqa: E402
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)
from app.database import Base, engine, get_db  # noqa: E402
from app.db_models import AnalysisHistory, ErrorReport, User  # noqa: E402
from app.model import load_model, predict_s_expression  # noqa: E402
from app.parser import s_expression_to_tree  # noqa: E402
from app.schemas import (  # noqa: E402
    AnalyzeRequest,
    AuthResponse,
    ErrorReportRequest,
    ErrorReportStatusRequest,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

production_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_URL", "").split(",")
    if origin.strip()
]
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    *production_origins,
]

app = FastAPI(title="Syntactic Analysis API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def create_database_tables():
    Base.metadata.create_all(bind=engine)
    ensure_database_columns()


def ensure_database_columns():
    inspector = inspect(engine)
    table_columns = {
        table_name: {column["name"] for column in inspector.get_columns(table_name)}
        for table_name in inspector.get_table_names()
    }

    statements = []
    if "analysis_history" in table_columns and "sentence_type" not in table_columns["analysis_history"]:
        statements.append(
            "ALTER TABLE analysis_history ADD COLUMN sentence_type VARCHAR(40) NOT NULL DEFAULT 'Unknown'"
        )
    if "error_reports" in table_columns and "status" not in table_columns["error_reports"]:
        statements.append(
            "ALTER TABLE error_reports ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'open'"
        )

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_email(email: str) -> str:
    normalized = normalize_email(email)
    if "@" not in normalized or normalized.startswith("@") or normalized.endswith("@"):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    return normalized


def detect_sentence_type(sentence: str, tree: dict | None = None) -> str:
    normalized = f" {sentence.lower()} "
    if tree and isinstance(tree, dict):
        child_names = [child.get("name") for child in tree.get("children", []) if isinstance(child, dict)]
        if {"S1", "S2"}.issubset(set(child_names)):
            return "Compound"

    complex_markers = [
        " who ",
        " whom ",
        " whose ",
        " which ",
        " that ",
        " because ",
        " although ",
        " when ",
        " while ",
        " if ",
        " since ",
        " before ",
        " after ",
        " unless ",
    ]
    if any(marker in normalized for marker in complex_markers):
        return "Complex"

    compound_markers = [" and ", " but ", " or ", " nor ", " for ", " yet ", " so ", ";"]
    if any(marker in normalized for marker in compound_markers):
        return "Compound"

    return "Simple"


def serialize_analysis(item: AnalysisHistory, include_user: bool = False) -> dict:
    result = {
        "id": item.id,
        "user_id": item.user_id,
        "sentence": item.sentence,
        "s_expression": item.s_expression,
        "tree": item.tree_json,
        "result": {
            "s_expression": item.s_expression,
            "tree": item.tree_json,
        },
        "sentence_type": item.sentence_type,
        "created_at": item.created_at,
    }
    if include_user:
        result["user"] = UserResponse.model_validate(item.user)
    return result


def serialize_report(item: ErrorReport) -> dict:
    return {
        "id": item.id,
        "user_id": item.user_id,
        "sentence": item.sentence,
        "description": item.description,
        "analysis_result": item.analysis_result_json,
        "result": item.analysis_result_json,
        "status": item.status,
        "created_at": item.created_at,
        "user": UserResponse.model_validate(item.user),
    }


@app.get("/")
def root():
    return {"message": "Syntactic Analysis API is running"}


@app.get("/load-model")
def load_hf_model(current_user: User = Depends(require_admin)):
    load_model()
    return {"status": "model loaded"}


@app.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email = validate_email(data.email)
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required.")
    if len(data.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=422, detail="Password is too long.")

    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return AuthResponse(access_token=create_access_token(user), user=user)


@app.post("/auth/login", response_model=AuthResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email = normalize_email(data.email)
    user = db.scalar(select(User).where(User.email == email))

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    return AuthResponse(access_token=create_access_token(user), user=user)


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@app.post("/analyze")
def analyze(
    data: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sentence = data.sentence.strip()
    if not sentence:
        raise HTTPException(status_code=422, detail="Sentence is required.")

    s_expression = predict_s_expression(sentence)
    tree = s_expression_to_tree(s_expression)

    history_item = AnalysisHistory(
        user_id=current_user.id,
        sentence=sentence,
        s_expression=s_expression,
        tree_json=tree,
        sentence_type=detect_sentence_type(sentence, tree),
    )
    db.add(history_item)
    db.commit()
    db.refresh(history_item)

    return serialize_analysis(history_item)


@app.get("/history/my")
def get_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = db.scalars(
        select(AnalysisHistory)
        .where(AnalysisHistory.user_id == current_user.id)
        .order_by(AnalysisHistory.created_at.desc())
    ).all()
    return [serialize_analysis(item) for item in items]


@app.delete("/history/my/{history_id}", status_code=204)
def delete_my_history(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = db.scalar(
        select(AnalysisHistory).where(
            AnalysisHistory.id == history_id,
            AnalysisHistory.user_id == current_user.id,
        )
    )
    if not item:
        raise HTTPException(status_code=404, detail="History item was not found.")
    db.delete(item)
    db.commit()
    return Response(status_code=204)


@app.delete("/history/my", status_code=204)
def clear_my_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db.execute(delete(AnalysisHistory).where(AnalysisHistory.user_id == current_user.id))
    db.commit()
    return Response(status_code=204)


@app.post("/reports", status_code=201)
def create_error_report(
    data: ErrorReportRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sentence = data.sentence.strip()
    description = data.description.strip()
    if not sentence or not description:
        raise HTTPException(status_code=422, detail="Sentence and description are required.")

    report = ErrorReport(
        user_id=current_user.id,
        sentence=sentence,
        description=description,
        analysis_result_json=data.analysis_result,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"id": report.id, "created_at": report.created_at}


@app.get("/admin/history")
def get_all_history(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    items = db.scalars(
        select(AnalysisHistory)
        .options(joinedload(AnalysisHistory.user))
        .order_by(AnalysisHistory.created_at.desc())
    ).all()
    return [serialize_analysis(item, include_user=True) for item in items]


@app.get("/admin/users")
def get_all_users(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return [UserResponse.model_validate(user) for user in users]


@app.get("/admin/reports")
def get_all_reports(
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    items = db.scalars(
        select(ErrorReport)
        .options(joinedload(ErrorReport.user))
        .order_by(ErrorReport.created_at.desc())
    ).all()
    return [serialize_report(item) for item in items]


@app.patch("/admin/reports/{report_id}")
def update_error_report_status(
    report_id: int,
    data: ErrorReportStatusRequest,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    report = db.get(ErrorReport, report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Error report was not found.")

    report.status = data.status
    db.commit()
    db.refresh(report)
    return serialize_report(report)
