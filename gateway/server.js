require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const parser = require('ua-parser-js');
const geoip = require('geoip-lite');

const app = express();
app.use(express.json());
app.use(cors());

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Target servers
const PROTECTED_API_URL = process.env.PROTECTED_API_URL || 'http://localhost:4000';
const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';

// Real-world, this would hit the actual Supabase endpoints to verify JWT
// For simplicity and 2FA flow, let's assume valid session token is passed in header
app.use(async (req, res, next) => {
    // 1. Authenticate Request
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Decode JWT payload to check MFA status (aal2)
        const tokenPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
        
        // Zero Trust rule: Block access if the user hasn't successfully passed MFA (AAL2).
        // DEMO OVERRIDE: Allowed bypass via ENV variable for easier local development/demo.
        if (tokenPayload.aal !== 'aal2' && process.env.ENFORCE_STRICT_MFA === 'true') {
            return res.status(403).json({ error: 'MFA (2FA) Verification Required. Access Denied. Your session is at Assurance Level 1.' });
        }
    } catch (e) {
        return res.status(400).json({ error: 'Invalid token format.' });
    }

    // Verify JWT with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Retrieve Role from JWT metadata (set during signup) or via authenticated DB query
    let role = user.user_metadata?.role;
    
    if (!role) {
        // Fallback: Query DB with the user's explicit token to respect RLS
        const userClient = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });
        const { data: profile } = await userClient.from('profiles').select('role').eq('id', user.id).single();
        role = profile?.role;
    }

    // Strict Zero Trust: If no explicit role is found, default to least-privilege role
    if (!role) {
        console.warn(`User ${user.id} has no explicit role. Defaulting to 'customer' (Zero Trust Principle).`);
        role = 'customer';
    }

    // 2. Collect Context
    const ua = parser(req.headers['user-agent']);
    const ip = req.ip || req.connection.remoteAddress;
    
    // Look up location using geoip-lite
    const geo = geoip.lookup(ip);
    const geolocation = geo ? `${geo.country}/${geo.city}` : 'Unknown';

    const context = {
        user_id: user.id,
        role: role,
        ip_address: ip,
        geolocation: geolocation,
        device_fingerprint: `${ua.os.name} ${ua.os.version} - ${ua.browser.name}`,
        time: new Date().toISOString(),
        endpoint: req.originalUrl,
        method: req.method,
    };

    // 3. Ask AI Engine (PDP)
    try {
        const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/evaluate_risk`, context);

        let decision = aiResponse.data.decision; // 'allow' or 'block'
        let riskScore = aiResponse.data.risk_score;
        let reasons = aiResponse.data.reasons || [];

        // Log the access attempt (could be async to not block)
        supabase.from('access_logs').insert([{
            user_id: user.id,
            ip_address: context.ip_address,
            device_fingerprint: context.device_fingerprint,
            endpoint: context.endpoint,
            method: context.method,
            risk_score: riskScore,
            decision: decision
        }]).then();

        if (decision !== 'allow') {
            const isAlert = decision === 'alert';
            return res.status(403).json({
                error: isAlert ? 'Access Warning: Unauthorized (Alerted Manager)' : 'Access Denied due to Suspicious Activity',
                details: reasons.join(', ')
            });
        }

        // 4. Forward if 'allow'
        req.gatewayContext = {
            userId: user.id,
            role: role
        };
        next();
    } catch (err) {
        console.error("AI Engine Error:", err.message);
        // Fail-closed standard for Zero Trust
        return res.status(503).json({ error: 'Policy Decision Point (AI) Unavailable' });
    }
});

// Proxy routes to Protected API
app.use(async (req, res) => {
    try {
        const url = `${PROTECTED_API_URL}${req.originalUrl}`;
        const targetReq = {
            method: req.method,
            url: url,
            headers: {
                ...req.headers,
                // Inject Context!
                'x-user-id': req.gatewayContext.userId,
                'x-user-role': req.gatewayContext.role
            },
            data: req.body
        };

        const response = await axios(targetReq);
        res.status(response.status).json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Internal Server Error forwarding request' });
        }
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Zero Trust Gateway PEP running on port ${PORT}`);
});
