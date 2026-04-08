function maskEmail(email) {
    if (!email || !email.includes('@')) return 'N/A';
    const [localPart, domain] = email.split('@');
    return `${localPart.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone) {
    if (!phone) return '***-***-****';
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length < 4) return '***-***-****';
    return `***-***-${digits.slice(-4)}`;
}

function toCustomerSummary(customer, includeSensitiveFields = false) {
    return {
        id: customer.id,
        name: customer.name,
        email: includeSensitiveFields ? customer.email : maskEmail(customer.email),
        phone: includeSensitiveFields ? (customer.phone || 'N/A') : maskPhone(customer.phone),
        address: customer.address || 'N/A',
        total_orders: customer.total_orders || 0,
        ltv: customer.ltv || 0,
    };
}

function canViewAllOrders(role) {
    return role === 'admin' || role === 'sales';
}

function canViewCustomers(role) {
    return role === 'admin' || role === 'sales';
}

function isAdmin(role) {
    return role === 'admin';
}

function canUpdateOrder(role, currentStatus, nextStatus) {
    if (role === 'admin') {
        return true;
    }

    if (role === 'sales') {
        return (
            (currentStatus === 'pending' && nextStatus === 'processing') ||
            (currentStatus === 'processing' && nextStatus === 'shipped')
        );
    }

    if (role === 'shipper') {
        return (
            (currentStatus === 'processing' && nextStatus === 'in_transit') ||
            (currentStatus === 'in_transit' && nextStatus === 'delivered')
        );
    }

    return false;
}

function validateGatewayHeaders(headers, expectedSecret) {
    const gatewaySecret = headers['x-gateway-secret'];
    if (gatewaySecret !== expectedSecret) {
        return { ok: false, status: 401, error: 'Unauthorized gateway request' };
    }

    const userId = headers['x-user-id'];
    const userRole = headers['x-user-role'];
    if (!userId || !userRole) {
        return { ok: false, status: 401, error: 'Missing Zero Trust Gateway Context' };
    }

    return {
        ok: true,
        user: {
            id: userId,
            role: userRole,
        },
    };
}

module.exports = {
    maskEmail,
    maskPhone,
    toCustomerSummary,
    canViewAllOrders,
    canViewCustomers,
    isAdmin,
    canUpdateOrder,
    validateGatewayHeaders,
};
