require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

// Supposedly, Gateway handles the auth and passes the username/role in headers.
// But to query the DB, we need a service role key safely stored here.
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if available, otherwise fall back to anon key for demo
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SERVICE_ROLE_KEY_HERE') 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY 
  : process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to extract Context passed by Gateway
const GatewayAuthMiddleware = (req, res, next) => {
    // Expected headers injected by Gateway
    const userId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    if (!userId || !userRole) {
        return res.status(401).json({ error: 'Missing Zero Trust Gateway Context' });
    }

    req.user = {
        id: userId,
        role: userRole
    };
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
    // Role matching
    const role = req.user.role;
    let query = supabase.from('orders').select('*, order_items(*, products(*))').order('created_at', { ascending: false });

    if (role === 'shipper') {
        // Shipper only sees id, status, shipping_address
        query = supabase.from('orders').select('id, status, shipping_address', { count: 'exact' }).order('created_at', { ascending: false });
    }

    const { data: orders, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(orders);
});

// Create Order (Checkout)
app.post('/api/orders', async (req, res) => {
    const { items, total_amount, address } = req.body;
    const userId = req.user.id;
    
    // Auto creating customer profile if they don't exist yet out of convenience
    const { data: custInfo } = await supabase.from('customers').select('*').eq('id', userId).single();
    if (!custInfo) {
        await supabase.from('customers').insert({
             id: userId,
             name: 'Unknown User ' + userId.substring(0,6),
             email: 'unknown@trustguard.local',
             address: address || 'N/A'
        });
    }

    const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ customer_id: userId, total_amount, status: 'pending', shipping_address: address || 'N/A' })
        .select('id')
        .single();
        
    if (orderErr) return res.status(500).json({ error: orderErr.message });
    
    const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
    }));
    
    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
    if (itemsErr) {
        return res.status(500).json({ error: itemsErr.message });
    }
    
    res.json({ message: 'Order created successfully', order_id: order.id });
});

// Endpoint 3: Customers (Staff & Admin only)
app.get('/api/customers', async (req, res) => {
    const role = req.user.role;

    if (role === 'shipper') {
        return res.status(403).json({ error: 'Shippers cannot view customer details' });
    }

    // Limit based on role length for Demo. 
    // Sales can see but probably shouldn't be allowed to fetch > 100 at a time safely.
    // The Gateway / AI will detect if they try to fetch 10s of times, but let's say the API itself returns what's asked.
    const { data: customers, error } = await supabase.from('customers').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(customers);
});

// Endpoint 4: Export (Admin only)
app.get('/api/admin/export-customers', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can export customers' });
    }

    const { data: customers, error } = await supabase.from('customers').select('*');
    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Export successful', data: customers, count: customers.length });
});

// Endpoint: System Users (Admin only)
app.get('/api/admin/users', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can view system users' });
    }
    
    // We fetch all profiles from the public schema
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) return res.status(500).json({ error: error.message });
    
    // Attempt to enrich with auth.users if service role is used (optional, requires superuser privileges)
    let authUsers = [];
    try {
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData && authData.users) {
            authUsers = authData.users;
        }
    } catch(e) { /* ignore if not service role */ }
    
    const users = profiles.map(p => {
        const authUser = authUsers.find(u => u.id === p.id);
        const email = authUser ? authUser.email : (p.username || 'user-' + p.id.substring(0,4) + '@trustguard.ai');
        return {
            id: p.id,
            name: p.full_name || 'Unknown User',
            email: email,
            role: p.role || 'customer',
            status: 'active', // assuming active
            lastLogin: authUser?.last_sign_in_at ? new Date(authUser.last_sign_in_at).toLocaleDateString() : 'Recently',
            clearance: p.clearance_level || (p.role === 'admin' ? 3 : p.role === 'staff' || p.role === 'sales' ? 2 : 1),
            riskScore: Math.floor(Math.random() * 15) // mock risk component
        };
    });
    
    res.json(users);
});

// Endpoint 5: Update Order Status
app.patch('/api/orders/:id', async (req, res) => {
    const role = req.user.role;
    
    if (role === 'shipper') {
        // Shipper can only update to 'in_transit' or 'delivered'
        if (req.body.status !== 'delivered' && req.body.status !== 'in_transit') {
            return res.status(403).json({ error: 'Shippers can only mark orders as in_transit or delivered' });
        }
    }

    const { data, error } = await supabase
        .from('orders')
        .update({ status: req.body.status })
        .eq('id', req.params.id)
        .select();

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Endpoint 6: Access Logs (Admin only)
app.get('/api/access-logs', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can view access logs' });
    }

    const { data: logs, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('action_time', { ascending: false })
        .limit(100);

    if (error) return res.status(500).json({ error: error.message });
    res.json(logs);
});

// Endpoint 7: AI Feedback Loop (Admin only)
app.post('/api/access-logs/:id/feedback', async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only Admins can provide AI feedback' });
    }

    const logId = req.params.id;
    const { isAnomalyConfirmed } = req.body;
    
    // Convert to DB enum string
    const adminFeedback = isAnomalyConfirmed ? 'confirmed_threat' : 'marked_safe';

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
        await fetch(`${AI_ENGINE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                log_id: logId,
                user_id: updatedLog.user_id,
                ip_address: updatedLog.ip_address,
                is_anomaly_confirmed: isAnomalyConfirmed
            })
        });
    } catch (err) {
        console.warn("Failed to notify AI Engine about feedback:", err.message);
        return res.json({ message: 'Feedback saved to DB, but AI Engine synchronization failed', data: updatedLog });
    }

    res.json({ message: 'Feedback successfully synchronized with AI Engine', data: updatedLog });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Protected E-commerce API running on port ${PORT}`);
});
