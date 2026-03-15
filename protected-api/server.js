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

// Endpoint 2: Orders
app.get('/api/orders', async (req, res) => {
    // Role matching
    const role = req.user.role;
    let query = supabase.from('orders').select('*, order_items(*, products(*))');

    if (role === 'shipper') {
        // Shipper only sees id, status, shipping_address
        query = supabase.from('orders').select('id, status, shipping_address');
    }

    const { data: orders, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(orders);
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

// Endpoint 5: Update Order Status
app.patch('/api/orders/:id', async (req, res) => {
    const role = req.user.role;
    
    if (role === 'shipper') {
        // Shipper can only update to 'delivered'
        if (req.body.status !== 'delivered') {
            return res.status(403).json({ error: 'Shippers can only mark orders as delivered' });
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Protected E-commerce API running on port ${PORT}`);
});
