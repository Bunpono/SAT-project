import logging
import os
import time

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.auth import (  # noqa: E402
    create_access_token,
    find_user_by_email,
    get_current_user,
    get_optional_current_user,
    hash_password,
    require_admin,
    SupabaseUser,
    to_user,
    verify_password,
)
from app.model import (  # noqa: E402
    ModelLoadError,
    get_model_status,
    load_model,
    predict_s_expression,
)
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
from app.supabase import supabase  # noqa: E402

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
logger = logging.getLogger(__name__)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Vite selects the next available 517x port when another development
    # server is already running (for example, localhost:5176). Keep this
    # flexible only for local development; deployed origins remain explicit.
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):517[3-9]",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def load_analysis_model_on_startup():
    """Fail fast instead of returning a misleading error on the first request."""
    try:
        load_model()
    except ModelLoadError as exc:
        logger.exception("The analysis model could not be loaded during startup")
        raise RuntimeError("The analysis model could not be loaded during startup.") from exc


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


def serialize_supabase_analysis(item: dict, include_user: bool = False) -> dict:
    """Keep the frontend response stable while history comes from Supabase."""
    result = {
        "id": item["id"],
        "user_id": item.get("user_id"),
        "sentence": item["sentence"],
        "s_expression": item["s_expression"],
        "tree": item["tree_json"],
        "result": {
            "s_expression": item["s_expression"],
            "tree": item["tree_json"],
        },
        "sentence_type": item.get("sentence_type", "Unknown"),
        "created_at": item["created_at"],
    }
    if include_user:
        user_id = item.get("user_id")
        result["user"] = None
        result["user_label"] = "Guest" if user_id is None else f"User #{user_id}"
    return result


def serialize_supabase_report(item: dict) -> dict:
    return {
        "id": item["id"],
        "user_id": item["user_id"],
        "sentence": item["sentence"],
        "description": item["description"],
        "analysis_result": item.get("analysis_result_json"),
        "result": item.get("analysis_result_json"),
        "status": item["status"],
        "created_at": item["created_at"],
        "user": None,
    }


@app.get("/")
def root():
    return {"message": "Syntactic Analysis API is running"}


@app.get("/health")
def health():
    return {"status": "ok", "model": get_model_status()}


@app.get("/load-model")
def load_hf_model(current_user: SupabaseUser = Depends(require_admin)):
    try:
        load_model()
    except ModelLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"status": "model loaded", "model": get_model_status()}


@app.post("/auth/register", response_model=AuthResponse, status_code=201)
def register(data: RegisterRequest):
    email = validate_email(data.email)
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name is required.")
    if len(data.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=422, detail="Password is too long.")

    existing_user = find_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    saved_users = supabase.request(
        "POST",
        "users",
        json={"name": name, "email": email, "password_hash": hash_password(data.password), "role": "user"},
        prefer="return=representation",
    )
    user = to_user(saved_users[0])

    return AuthResponse(access_token=create_access_token(user), user=user)


@app.post("/auth/login", response_model=AuthResponse)
def login(data: LoginRequest):
    email = normalize_email(data.email)
    user = find_user_by_email(email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    return AuthResponse(access_token=create_access_token(user), user=user)


@app.get("/auth/me", response_model=UserResponse)
def get_me(current_user: SupabaseUser = Depends(get_current_user)):
    return current_user


@app.post("/analyze")
def analyze(
    data: AnalyzeRequest,
    current_user: SupabaseUser | None = Depends(get_optional_current_user),
):
    sentence = data.sentence.strip()
    if not sentence:
        raise HTTPException(status_code=400, detail="Sentence is required.")

    logger.info("Starting model inference")
    inference_started_at = time.perf_counter()
    try:
        s_expression = predict_s_expression(sentence)
    except ModelLoadError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    logger.info("Model inference completed in %.2fs", time.perf_counter() - inference_started_at)
    tree = s_expression_to_tree(s_expression)

    logger.info("Saving analysis to Supabase")
    saved_items = supabase.request(
        "POST",
        "analysis_history",
        json={
            "user_id": current_user.id if current_user is not None else None,
            "sentence": sentence,
            "s_expression": s_expression,
            "tree_json": tree,
            "sentence_type": detect_sentence_type(sentence, tree),
        },
        prefer="return=representation",
    )
    if not saved_items:
        raise HTTPException(status_code=502, detail="Supabase did not return the saved analysis.")
    logger.info("Analysis saved to Supabase")
    return serialize_supabase_analysis(saved_items[0])


@app.get("/history/my")
def get_my_history(
    current_user: SupabaseUser = Depends(get_current_user),
):
    items = supabase.request(
        "GET", "analysis_history", params={"user_id": f"eq.{current_user.id}", "order": "created_at.desc"}
    )
    return [serialize_supabase_analysis(item) for item in items]


@app.delete("/history/my/{history_id}", status_code=204)
def delete_my_history(
    history_id: int,
    current_user: SupabaseUser = Depends(get_current_user),
):
    supabase.request("DELETE", "analysis_history", params={"id": f"eq.{history_id}", "user_id": f"eq.{current_user.id}"})
    return Response(status_code=204)


@app.delete("/history/my", status_code=204)
def clear_my_history(
    current_user: SupabaseUser = Depends(get_current_user),
):
    supabase.request("DELETE", "analysis_history", params={"user_id": f"eq.{current_user.id}"})
    return Response(status_code=204)


@app.post("/reports", status_code=201)
def create_error_report(
    data: ErrorReportRequest,
    current_user: SupabaseUser = Depends(get_current_user),
):
    sentence = data.sentence.strip()
    description = data.description.strip()
    if not sentence or not description:
        raise HTTPException(status_code=422, detail="Sentence and description are required.")

    reports = supabase.request(
        "POST",
        "error_reports",
        json={
            "user_id": current_user.id,
            "sentence": sentence,
            "description": description,
            "analysis_result_json": data.analysis_result,
        },
        prefer="return=representation",
    )
    return {"id": reports[0]["id"], "created_at": reports[0]["created_at"]}


@app.get("/admin/history")
def get_all_history(
    _admin: SupabaseUser = Depends(require_admin),
):
    items = supabase.request("GET", "analysis_history", params={"order": "created_at.desc"})
    return [serialize_supabase_analysis(item, include_user=True) for item in items]


@app.get("/admin/users")
def get_all_users(
    _admin: SupabaseUser = Depends(require_admin),
):
    users = supabase.request("GET", "users", params={"order": "created_at.desc"})
    return [UserResponse.model_validate(to_user(user)) for user in users]


@app.get("/admin/reports")
def get_all_reports(
    _admin: SupabaseUser = Depends(require_admin),
):
    items = supabase.request("GET", "error_reports", params={"order": "created_at.desc"})
    return [serialize_supabase_report(item) for item in items]


@app.patch("/admin/reports/{report_id}")
def update_error_report_status(
    report_id: int,
    data: ErrorReportStatusRequest,
    _admin: SupabaseUser = Depends(require_admin),
):
    reports = supabase.request(
        "PATCH",
        "error_reports",
        params={"id": f"eq.{report_id}"},
        json={"status": data.status},
        prefer="return=representation",
    )
    if not reports:
        raise HTTPException(status_code=404, detail="Error report was not found.")
    return serialize_supabase_report(reports[0])
