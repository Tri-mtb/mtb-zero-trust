from datetime import datetime
import ipaddress
import os
from pathlib import Path

import numpy as np
import pandas as pd
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest


def load_env_file() -> None:
    env_path = Path(__file__).with_name(".env")
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file()


def env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError:
        return default


def env_float(name: str, default: float) -> float:
    value = os.getenv(name)
    if value is None:
        return default
    try:
        return float(value)
    except ValueError:
        return default


ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8080").split(",")
ALLOWED_COUNTRIES = {
    country.strip().upper()
    for country in os.getenv("ALLOWED_COUNTRIES", "VN").split(",")
    if country.strip()
}
ENFORCE_GEO_BLOCK = env_bool("ENFORCE_GEO_BLOCK", False)
BUSINESS_HOUR_START = env_int("BUSINESS_HOUR_START", 6)
BUSINESS_HOUR_END = env_int("BUSINESS_HOUR_END", 20)
ALERT_THRESHOLD = env_int("ALERT_THRESHOLD", 40)
BLOCK_THRESHOLD = env_int("BLOCK_THRESHOLD", 80)
HIGH_RATE_THRESHOLD = env_int("HIGH_RATE_THRESHOLD", 20)
ELEVATED_RATE_THRESHOLD = env_int("ELEVATED_RATE_THRESHOLD", 10)
MODEL_BLOCK_THRESHOLD = env_float("MODEL_BLOCK_THRESHOLD", 0.7)
MODEL_ALERT_THRESHOLD = env_float("MODEL_ALERT_THRESHOLD", 0.45)
TRUST_LOCAL_IPS = env_bool("TRUST_LOCAL_IPS", True)


app = FastAPI(title="TrustGuard AI Risk Engine", description="Zero Trust Policy Decision Point (PDP)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Risk Engine (PDP)",
        "model": "IsolationForest",
        "version": "2.5",
        "config": {
            "alert_threshold": ALERT_THRESHOLD,
            "block_threshold": BLOCK_THRESHOLD,
            "geo_block_enabled": ENFORCE_GEO_BLOCK,
            "allowed_countries": sorted(ALLOWED_COUNTRIES),
            "trust_local_ips": TRUST_LOCAL_IPS,
        },
    }


class ContextRequest(BaseModel):
    user_id: str
    role: str
    ip_address: str
    geolocation: str
    device_fingerprint: str
    time: str
    endpoint: str
    method: str


class FeedbackRequest(BaseModel):
    log_id: str
    user_id: str
    ip_address: str
    is_anomaly_confirmed: bool


class UserOverrideRequest(BaseModel):
    user_id: str


def train_mock_model():
    np.random.seed(42)
    hours = np.random.randint(8, 18, 1000)
    rates = np.random.randint(1, 10, 1000)
    is_known_ip = np.ones(1000)

    x_train = pd.DataFrame({
        "hour": hours,
        "rate": rates,
        "is_known_ip": is_known_ip,
    })

    trained_model = IsolationForest(contamination=0.01, random_state=42)
    trained_model.fit(x_train)
    return trained_model


model = train_mock_model()
user_request_history = {}
trusted_users = set()
blacklisted_users = set()


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def normalize_risk_score(anomaly_score: float) -> float:
    normalized = (anomaly_score / max(MODEL_BLOCK_THRESHOLD, 0.01)) * BLOCK_THRESHOLD
    return round(clamp(normalized, 0.0, 100.0), 2)


def parse_request_time(time_value: str) -> datetime:
    time_str = (time_value or "").replace("Z", "+00:00")
    return datetime.fromisoformat(time_str) if time_str else datetime.now()


def extract_country_code(geolocation: str) -> str:
    if not geolocation or geolocation == "Unknown":
        return ""
    return geolocation.split("/", 1)[0].strip().upper()


def is_known_ip_address(ip_address: str) -> bool:
    if not ip_address:
        return False

    normalized_ip = ip_address.strip()
    if normalized_ip == "::1":
        return True

    if normalized_ip.startswith("::ffff:"):
        normalized_ip = normalized_ip.split("::ffff:", 1)[1]

    try:
        parsed_ip = ipaddress.ip_address(normalized_ip)
    except ValueError:
        return False

    return (
        parsed_ip.is_loopback
        or parsed_ip.is_private
        or parsed_ip.is_link_local
    )


def is_loopback_ip_address(ip_address: str) -> bool:
    if not ip_address:
        return False

    normalized_ip = ip_address.strip()
    if normalized_ip == "::1":
        return True

    if normalized_ip.startswith("::ffff:"):
        normalized_ip = normalized_ip.split("::ffff:", 1)[1]

    try:
        return ipaddress.ip_address(normalized_ip).is_loopback
    except ValueError:
        return False


def update_and_get_rate(user_id: str, current_time: datetime) -> int:
    if user_id not in user_request_history:
        user_request_history[user_id] = []

    history = user_request_history[user_id]
    history.append(current_time)

    one_min_ago = current_time.timestamp() - 60
    history = [timestamp for timestamp in history if timestamp.timestamp() > one_min_ago]
    user_request_history[user_id] = history
    return len(history)


def get_role_level(role: str) -> int:
    levels = {"user": 1, "customer": 1, "staff": 2, "sales": 2, "shipper": 2, "admin": 3, "manager": 4}
    return levels.get(role.lower(), 0)


def get_endpoint_level(endpoint: str) -> int:
    endpoint_lower = endpoint.lower()
    if "manager" in endpoint_lower:
        return 4
    if "admin" in endpoint_lower or "dashboard" in endpoint_lower:
        return 3
    if "staff" in endpoint_lower:
        return 2
    return 1


def apply_decision(current_decision: str, current_score: float, candidate_decision: str, candidate_score: float) -> tuple[str, float]:
    severity_order = {"allow": 0, "alert": 1, "block": 2}
    if severity_order[candidate_decision] > severity_order[current_decision]:
        return candidate_decision, max(current_score, candidate_score)
    return current_decision, max(current_score, candidate_score)


@app.post("/api/feedback")
async def receive_feedback(feedback: FeedbackRequest):
    if feedback.is_anomaly_confirmed:
        blacklisted_users.add(feedback.user_id)
        trusted_users.discard(feedback.user_id)
        return {"status": "success", "action": "blacklisted", "user_id": feedback.user_id}

    trusted_users.add(feedback.user_id)
    blacklisted_users.discard(feedback.user_id)
    return {"status": "success", "action": "whitelisted", "user_id": feedback.user_id}


@app.get("/api/admin/overrides")
async def list_overrides():
    return {
        "blacklisted_users": sorted(blacklisted_users),
        "trusted_users": sorted(trusted_users),
    }


@app.post("/api/admin/block-user")
async def block_user(request: UserOverrideRequest):
    blacklisted_users.add(request.user_id)
    trusted_users.discard(request.user_id)
    return {"status": "success", "action": "blocked", "user_id": request.user_id}


@app.post("/api/admin/unblock-user")
async def unblock_user(request: UserOverrideRequest):
    blacklisted_users.discard(request.user_id)
    trusted_users.discard(request.user_id)
    return {"status": "success", "action": "unblocked", "user_id": request.user_id}


@app.post("/api/admin/mark-user-safe")
async def mark_user_safe(request: UserOverrideRequest):
    trusted_users.add(request.user_id)
    blacklisted_users.discard(request.user_id)
    return {"status": "success", "action": "trusted", "user_id": request.user_id}


@app.post("/api/evaluate_risk")
async def evaluate_risk(context: ContextRequest):
    try:
        if context.user_id in blacklisted_users:
            return {
                "decision": "block",
                "risk_score": 100.0,
                "reasons": ["[ADMIN OVERRIDE] User has been explicitly blacklisted due to prior confirmed threat."],
            }

        request_time = parse_request_time(context.time)
        rate = update_and_get_rate(context.user_id, request_time)

        if context.user_id in trusted_users:
            return {
                "decision": "allow",
                "risk_score": 0.0,
                "reasons": ["[ADMIN OVERRIDE] User is explicitly marked as safe (Whitelist)."],
            }

        hour = request_time.hour
        is_known_ip = 1.0 if is_known_ip_address(context.ip_address) else 0.0
        is_loopback_ip = is_loopback_ip_address(context.ip_address)

        x_test = pd.DataFrame([{
            "hour": hour,
            "rate": rate,
            "is_known_ip": is_known_ip,
        }])

        prediction = model.predict(x_test)[0]
        anomaly_score = float(-model.score_samples(x_test)[0])
        risk_score = normalize_risk_score(anomaly_score)
        decision = "allow"
        reasons = []

        if prediction == -1 or anomaly_score >= MODEL_ALERT_THRESHOLD:
            reasons.append(f"AI model detected unusual behavior (model score: {anomaly_score:.2f})")
            if TRUST_LOCAL_IPS and is_loopback_ip:
                reasons.append("Loopback development traffic trusted locally.")
                risk_score = min(risk_score, max(float(ALERT_THRESHOLD - 1), 0.0))
            else:
                decision, risk_score = apply_decision(
                    decision,
                    risk_score,
                    "block" if anomaly_score >= MODEL_BLOCK_THRESHOLD else "alert",
                    risk_score,
                )

        if hour < BUSINESS_HOUR_START or hour > BUSINESS_HOUR_END:
            reasons.append(f"Accessed outside normal hours ({hour}:00 UTC)")
            decision, risk_score = apply_decision(decision, risk_score, "alert", max(risk_score, 55.0))

        if rate > HIGH_RATE_THRESHOLD:
            reasons.append(f"High request frequency: {rate} req/min. Potential data exfiltration.")
            decision, risk_score = apply_decision(decision, risk_score, "block", 95.0)
        elif rate > ELEVATED_RATE_THRESHOLD:
            reasons.append(f"Elevated request frequency detected: {rate} req/min.")
            decision, risk_score = apply_decision(decision, risk_score, "alert", max(risk_score, 65.0))

        country_code = extract_country_code(context.geolocation)
        if is_known_ip == 0.0:
            reasons.append(f"Unknown/public IP address: {context.ip_address} (location: {context.geolocation})")
            decision, risk_score = apply_decision(decision, risk_score, "alert", max(risk_score, 60.0))

            if ENFORCE_GEO_BLOCK and country_code and country_code not in ALLOWED_COUNTRIES:
                reasons.append(f"[GEO-BLOCK] Access from unauthorized region: {context.geolocation}")
                decision, risk_score = apply_decision(decision, risk_score, "block", 90.0)

        user_level = get_role_level(context.role)
        endpoint_level = get_endpoint_level(context.endpoint)
        if user_level < endpoint_level:
            severity = endpoint_level - user_level
            if severity >= 2:
                reasons.append(
                    f"[CRITICAL BLOCK] Severe unauthorized access by Level {user_level} ({context.role}) to Level {endpoint_level} resource."
                )
                decision, risk_score = apply_decision(decision, risk_score, "block", 98.0)
            else:
                reasons.append(
                    f"[WARNING ALERT] Unauthorized access by Level {user_level} ({context.role}) to Level {endpoint_level} resource."
                )
                decision, risk_score = apply_decision(decision, risk_score, "alert", max(risk_score, 75.0))

        if decision == "allow" and risk_score >= BLOCK_THRESHOLD:
            decision = "block"
        elif decision == "allow" and risk_score >= ALERT_THRESHOLD:
            decision = "alert"

        if not reasons:
            reasons.append("Behavior matched current low-risk baseline.")

        return {
            "decision": decision,
            "risk_score": round(clamp(risk_score, 0.0, 100.0), 2),
            "reasons": list(dict.fromkeys(reasons)),
        }
    except Exception as exc:
        print(f"Error evaluating risk: {exc}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=False)


