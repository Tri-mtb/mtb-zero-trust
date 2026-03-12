from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from datetime import datetime
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import uvicorn

app = FastAPI()

class ContextRequest(BaseModel):
    user_id: str
    role: str
    ip_address: str
    device_fingerprint: str
    time: str
    endpoint: str
    method: str

# We load/train our model. In reality, this is pre-trained or updated online.
# For demo purposes, we will train a mock Isolation Forest on mock normal data.
def train_mock_model():
    np.random.seed(42)
    # Generate 1000 normal samples
    hours = np.random.randint(8, 18, 1000)
    rates = np.random.randint(1, 10, 1000)
    is_known_ip = np.ones(1000)
    
    X_train = pd.DataFrame({
        'hour': hours,
        'rate': rates,
        'is_known_ip': is_known_ip
    })
    
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X_train)
    return model

model = train_mock_model()

# Dictionary to keep track of user request timestamps
user_request_history = {}

def update_and_get_rate(user_id: str, current_time: datetime) -> int:
    if user_id not in user_request_history:
        user_request_history[user_id] = []
        
    history = user_request_history[user_id]
    
    # Add current request
    history.append(current_time)
    
    # Remove older than 1 minute
    one_min_ago = current_time.timestamp() - 60
    history = [t for t in history if t.timestamp() > one_min_ago]
    
    user_request_history[user_id] = history
    
    return len(history)

@app.post("/api/evaluate_risk")
async def evaluate_risk(context: ContextRequest):
    try:
        # Parse ISO string handling potential Z or offset
        time_str = context.time.replace("Z", "+00:00")
        req_time = datetime.fromisoformat(time_str) if time_str else datetime.now()
        hour = req_time.hour
        
        rate = update_and_get_rate(context.user_id, req_time)
        
        # Check IP (Mock internal IP logic)
        is_known_ip = 1.0 if context.ip_address.startswith("127.") or context.ip_address.startswith("192.") or context.ip_address == "::1" else 0.0
        
        X_test = pd.DataFrame([{
            'hour': hour,
            'rate': rate,
            'is_known_ip': is_known_ip
        }])
        
        prediction = model.predict(X_test)[0]
        # Negate because score_samples gives negative values for anomalies
        anomaly_score = -model.score_samples(X_test)[0] 
        
        decision = "allow"
        reasons = []
        
        # Model-based decision
        if prediction == -1:
            decision = "block"
            reasons.append(f"AI Model detected unusual behavior (Score: {anomaly_score:.2f})")
            
        # Explanations for the behavior
        if hour < 6 or hour > 20: 
            reasons.append(f"Accessed at unusual hour ({hour}:00)")
            
        if rate > 20: # High request rate -> Data Exfiltration simulation
            decision = "block"
            reasons.append(f"High request frequency: {rate} req/min. Potential Data Exfiltration.")
            
        if is_known_ip == 0.0:
            reasons.append(f"Unknown/Public IP address: {context.ip_address}")
            
        # AI RBAC / Level-based Access Control
        def get_role_level(r):
            levels = {"user": 1, "customer": 1, "staff": 2, "admin": 3, "manager": 4}
            return levels.get(r.lower(), 0)
            
        def get_endpoint_level(ep):
            ep_lower = ep.lower()
            if "manager" in ep_lower: return 4
            if "admin" in ep_lower or "dashboard" in ep_lower: return 3
            if "staff" in ep_lower: return 2
            return 1 # Default level for public or standard user pages
            
        usr_lvl = get_role_level(context.role)
        ep_lvl = get_endpoint_level(context.endpoint)
        
        # Hard Rule: Compare user permissions with endpoint requirements
        if usr_lvl < ep_lvl:
            severity = ep_lvl - usr_lvl
            # "dựa vào level để AI có quyền cảnh báo hay block"
            if severity >= 2:
                decision = "block"
                reasons.append(f"[CRITICAL BLOCK] Severe unauthorized access by Level {usr_lvl} ({context.role}) to Level {ep_lvl} resource.")
            else:
                decision = "alert" # Gateway will handle 'alert' vs 'block'
                reasons.append(f"[WARNING ALERT] Unauthorized access by Level {usr_lvl} ({context.role}) to Level {ep_lvl} resource. Alerting Manager Dashboard.")
            
        return {
            "decision": decision,
            "risk_score": float(anomaly_score),
            "reasons": list(set(reasons))
        }
        
    except Exception as e:
        print(f"Error evaluating risk: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5000, reload=True)
