require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const {
    toCustomerSummary,
    canViewAllOrders,
    canViewCustomers,
    isAdmin,
    canUpdateOrder,
    validateGatewayHeaders,
} = require('./lib/policy');
const {
    validateOrderPayload,
} = require('./lib/order-validation');

const app = express();
app.use(express.json());

// Supposedly, Gateway handles the auth and passes the username/role in headers.
// But to query the DB, we need a service role key safely stored here.
const supabaseUrl = process.env.SUPABASE_URL;
const internalGatewaySecret = process.env.INTERNAL_GATEWAY_SECRET;
const HOST = process.env.HOST || '127.0.0.1';

if (!internalGatewaySecret) {
  throw new Error('Missing INTERNAL_GATEWAY_SECRET in protected-api/.env');
}

// Use service role key if available, otherwise fall back to anon key for demo
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SERVICE_ROLE_KEY_HERE') 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY 
  : process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ORDER_SELECT_FULL = '*, order_items(*, products(*))';
const ORDER_SELECT_SHIPPER = 'id, status, shipping_address, created_at, updated_at';

function ensureAdmin(req, res) {
    if (!isAdmin(req.user.role)) {
        res.status(403).json({ error: 'Only Admins can access this resource' });
        return false;
    }

    return true;
}

async function syncAiOverride(action, userId) {
    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';
    const response = await fetch(`${AI_ENGINE_URL}/api/admin/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
    });

    let payload = null;
    try {
        payload = await response.json();
    } catch (_) {
        payload = null;
    }

    if (!response.ok) {
        throw new Error(payload?.detail || payload?.error || `AI Engine returned ${response.status}`);
    }

    return payload;
}
async function restoreProductStock(productId, quantity) {
    const { data: product, error } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .maybeSingle();

    if (error || !product) {
        return;
    }

    await supabase
        .from('products')
        .update({ stock: (product.stock || 0) + quantity })
        .eq('id', productId);
}

async function getOrderById(orderId) {
    const { data, error } = await supabase
        .from('orders')
        .select('id, customer_id, status')
        .eq('id', orderId)
        .maybeSingle();

    return { data, error };
}
// Middleware to extract Context passed by Gateway
const GatewayAuthMiddleware = (req, res, next) => {
    const authResult = validateGatewayHeaders(req.headers, internalGatewaySecret);
    if (!authResult.ok) {
        return res.status(authResult.status).json({ error: authResult.error });
    }

    req.user = authResult.user;
    next();
};

app.use(GatewayAuthMiddleware);

// Endpoint 1: Products
app.get('/api/products', async (req, res) => {
    // Anyone authenticated can view products
    const { data: products, error } = await supabase.from('products').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(products);
});

// Add Product
app.post('/api/products', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can add products' });
    }
    const { name, description, price, stock } = req.body;
    const { data, error } = await supabase.from('products').insert([{ name, description, price, stock }]).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Edit Product
app.patch('/api/products/:id', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can edit products' });
    }
    const { name, description, price, stock } = req.body;
    
    // Only update fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    
    const { data, error } = await supabase.from('products').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Endpoint 2: Orders
app.get('/api/orders', async (req, res) => {
    const role = req.user.role;
    let query = supabase.from('orders');

    if (canViewAllOrders(role)) {
        query = query.select(ORDER_SELECT_FULL);
    } else if (role === 'shipper') {
        query = query
            .select(ORDER_SELECT_SHIPPER)
            .in('status', ['processing', 'in_transit', 'delivered']);
    } else {
        query = query
            .select(ORDER_SELECT_FULL)
            .eq('customer_id', req.user.id);
    }

    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(orders);
});

// Create Order (Checkout)
app.post('/api/orders', async (req, res) => {
    const { items, total_amount, address } = req.body;
    const userId = req.user.id;

    const validation = validateOrderPayload(req.body);
    if (!validation.ok) {
        return res.status(validation.status).json({ error: validation.error });
    }

    const { data: custInfo, error: customerLookupError } = await supabase
        .from('customers')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

    if (customerLookupError) {
        return res.status(500).json({ error: customerLookupError.message });
    }

    if (!custInfo) {
        const { error: insertCustomerError } = await supabase.from('customers').insert({
            id: userId,
            name: `Unknown User ${userId.substring(0, 6)}`,
            email: `unknown-${userId.substring(0, 8)}@trustguard.local`,
            address: address,
        });

        if (insertCustomerError) {
            return res.status(500).json({ error: insertCustomerError.message });
        }
    }

    const productIds = [...new Set(items.map((item) => item.product_id))];
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .in('id', productIds);

    if (productsError) {
        return res.status(500).json({ error: productsError.message });
    }

    const productsById = new Map(products.map((product) => [product.id, product]));
    const normalizedItems = [];
    let computedTotal = 0;

    for (const item of items) {
        const product = productsById.get(item.product_id);
        if (!product) {
            return res.status(400).json({ error: `Product ${item.product_id} does not exist` });
        }

        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
        }

        if (Number(item.price) !== Number(product.price)) {
            return res.status(400).json({ error: `Client price mismatch for ${product.name}` });
        }

        computedTotal += Number(product.price) * item.quantity;
        normalizedItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            price: Number(product.price),
        });
    }

    if (Math.abs(computedTotal - total_amount) > 0.01) {
        return res.status(400).json({ error: 'total_amount does not match server-side product pricing' });
    }

    const reservedStock = [];
    for (const item of normalizedItems) {
        const product = productsById.get(item.product_id);
        const newStock = product.stock - item.quantity;
        const { data: updatedProduct, error: stockUpdateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.product_id)
            .eq('stock', product.stock)
            .select('id, stock')
            .maybeSingle();

        if (stockUpdateError) {
            for (const reserved of reservedStock) {
                await restoreProductStock(reserved.product_id, reserved.quantity);
            }
            return res.status(500).json({ error: stockUpdateError.message });
        }

        if (!updatedProduct) {
            for (const reserved of reservedStock) {
                await restoreProductStock(reserved.product_id, reserved.quantity);
            }
            return res.status(409).json({ error: `Inventory changed while reserving stock for ${product.name}. Please retry checkout.` });
        }

        product.stock = newStock;
        reservedStock.push({ product_id: item.product_id, quantity: item.quantity });
    }

    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ customer_id: userId, total_amount: computedTotal, status: 'pending', shipping_address: address })
        .select('id')
        .single();
        
    if (orderErr) {
        for (const reserved of reservedStock) {
            await restoreProductStock(reserved.product_id, reserved.quantity);
        }
        return res.status(500).json({ error: orderErr.message });
    }
    
    const orderItems = normalizedItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
    }));
    
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
        await supabase.from('orders').delete().eq('id', order.id);
        for (const reserved of reservedStock) {
            await restoreProductStock(reserved.product_id, reserved.quantity);
        }
        return res.status(500).json({ error: itemsErr.message });
    }
    
    res.json({ message: 'Order created successfully', order_id: order.id, total_amount: computedTotal });
});

// Endpoint 3: Customers (Staff & Admin only)
app.get('/api/customers', async (req, res) => {
    const role = req.user.role;

    if (!canViewCustomers(role)) {
        return res.status(403).json({ error: 'Only Admins and Sales can view customer details' });
    }

    const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, address, orders(id, total_amount)');

    if (error) return res.status(500).json({ error: error.message });

    const includeSensitiveFields = role === 'admin';
    const customerSummaries = customers.map((customer) => {
        const orders = customer.orders || [];
        const totalOrders = orders.length;
        const ltv = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

        return toCustomerSummary(
            {
                ...customer,
                total_orders: totalOrders,
                ltv,
            },
            includeSensitiveFields
        );
    });

    res.json(customerSummaries);
});

// Endpoint 4: Export (Admin only)
app.get('/api/admin/export-customers', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    const { data: customers, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, address, created_at')
        .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Export successful', data: customers, count: customers.length });
});

// Endpoint: System Users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }
    
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, role, clearance_level, updated_at');

    if (error) return res.status(500).json({ error: error.message });
    
    // Attempt to enrich with auth.users if service role is used (optional, requires superuser privileges)
    let authUsers = [];
    try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData && authData.users) {
            authUsers = authData.users;
        }
    } catch(e) { /* ignore if not service role */ }

    const { data: accessLogs } = await supabase
        .from('access_logs')
        .select('user_id, risk_score')
        .order('action_time', { ascending: false })
        .limit(500);

    const latestRiskByUser = new Map();
    (accessLogs || []).forEach((log) => {
        if (!latestRiskByUser.has(log.user_id)) {
            latestRiskByUser.set(log.user_id, Math.round(log.risk_score || 0));
        }
    });
    
    let aiOverrides = { blacklisted_users: [], trusted_users: [] };
    try {
        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        const response = await fetch(`${AI_ENGINE_URL}/api/admin/overrides`);
        if (response.ok) {
            aiOverrides = await response.json();
        }
    } catch (_) { /* ignore AI status enrichment errors */ }

    const blacklistedUsers = new Set(aiOverrides.blacklisted_users || []);
    const trustedUsers = new Set(aiOverrides.trusted_users || []);

    const users = profiles.map(p => {
        const authUser = authUsers.find(u => u.id === p.id);
        const email = authUser?.email || (p.username || `user-${p.id.substring(0,4)}@trustguard.ai`);
        return {
            id: p.id,
            name: p.full_name || 'Unknown User',
            email: email,
            role: p.role || 'customer',
            status: authUser?.banned_until ? 'suspended' : 'active',
            policyStatus: blacklistedUsers.has(p.id) ? 'blocked' : trustedUsers.has(p.id) ? 'trusted' : 'normal',
            lastLogin: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleDateString() : 'Recently',
            clearance: p.clearance_level || (p.role === 'admin' ? 3 : p.role === 'sales' || p.role === 'shipper' ? 2 : 1),
            riskScore: latestRiskByUser.get(p.id) || 0
        };
    });
    
    res.json(users);
});

// Endpoint 5: Update Order Status
app.patch('/api/orders/:id', async (req, res) => {
    const role = req.user.role;

    if (!req.body.status) {
        return res.status(400).json({ error: 'Missing order status' });
    }

    const { data: existingOrder, error: fetchError } = await getOrderById(req.params.id);
    if (fetchError) {
        return res.status(500).json({ error: fetchError.message });
    }
    if (!existingOrder) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (role === 'customer' && existingOrder.customer_id !== req.user.id) {
        return res.status(403).json({ error: 'Customers can only access their own orders' });
    }

    if (!canUpdateOrder(role, existingOrder.status, req.body.status)) {
        return res.status(403).json({
            error: `Role ${role} cannot change order status from ${existingOrder.status} to ${req.body.status}`,
        });
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ status: req.body.status, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Endpoint 6: Access Logs (Admin only)
app.get('/api/access-logs', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    const { data: logs, error } = await supabase
        .from('access_logs')
        .select('id, user_id, ip_address, device_fingerprint, endpoint, method, action_time, risk_score, decision, admin_feedback')
        .order('action_time', { ascending: false })
        .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    res.json(logs);
});

// Endpoint 7: AI Feedback Loop (Admin only)
app.post('/api/access-logs/:id/feedback', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    const logId = req.params.id;
    const { isAnomalyConfirmed } = req.body;

    if (typeof isAnomalyConfirmed !== 'boolean') {
        return res.status(400).json({ error: 'isAnomalyConfirmed must be a boolean' });
    }
    
    // Convert to DB enum string
    const adminFeedback = isAnomalyConfirmed ? 'confirmed_threat' : 'marked_safe';

    if (isAnomalyConfirmed) {
        const { data: targetLog, error: targetLogError } = await supabase
            .from('access_logs')
            .select('id, user_id')
            .eq('id', logId)
            .single();

        if (targetLogError) return res.status(500).json({ error: targetLogError.message });
        if (targetLog.user_id === req.user.id) {
            return res.status(400).json({ error: 'Admins cannot confirm threat on their own account.' });
        }
    }

    // 1. Update Supabase Database
    const { data: updatedLog, error: dbError } = await supabase
        .from('access_logs')
        .update({ admin_feedback: adminFeedback })
        .eq('id', logId)
        .select()
        .single();

    if (dbError) return res.status(500).json({ error: dbError.message });

    // 2. Notify AI Engine (PDP) to update its Blacklist/Whitelist
    try {
        const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:5000';
        const aiResponse = await fetch(`${AI_ENGINE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                log_id: logId,
                user_id: updatedLog.user_id,
                ip_address: updatedLog.ip_address,
                is_anomaly_confirmed: isAnomalyConfirmed
            })
        });

        if (!aiResponse.ok) {
            let payload = null;
            try {
                payload = await aiResponse.json();
            } catch (_) {
                payload = null;
            }
            throw new Error(payload?.detail || payload?.error || `AI Engine returned ${aiResponse.status}`);
        }
    } catch (err) {
        console.warn("Failed to notify AI Engine about feedback:", err.message);
        return res.status(502).json({ error: `Feedback saved to DB, but AI Engine synchronization failed: ${err.message}`, data: updatedLog });
    }

    res.json({ message: 'Feedback successfully synchronized with AI Engine', data: updatedLog });
});

app.post('/api/admin/users/:id/block', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    if (req.params.id === req.user.id) {
        return res.status(400).json({ error: 'Admins cannot block their own account.' });
    }

    try {
        const result = await syncAiOverride('block-user', req.params.id);
        res.json({ message: 'User blocked successfully', data: result });
    } catch (error) {
        res.status(502).json({ error: error.message });
    }
});

app.post('/api/admin/users/:id/unblock', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    try {
        const result = await syncAiOverride('unblock-user', req.params.id);
        res.json({ message: 'User unblocked successfully', data: result });
    } catch (error) {
        res.status(502).json({ error: error.message });
    }
});

app.post('/api/admin/users/:id/mark-safe', async (req, res) => {
    if (!ensureAdmin(req, res)) {
        return;
    }

    try {
        const result = await syncAiOverride('mark-user-safe', req.params.id);
        res.json({ message: 'User marked safe successfully', data: result });
    } catch (error) {
        res.status(502).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, HOST, () => {
    console.log(`Protected E-commerce API running on ${HOST}:${PORT}`);
});
