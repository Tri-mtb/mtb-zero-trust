const test = require('node:test');
const assert = require('node:assert/strict');

const {
    canViewAllOrders,
    canViewCustomers,
    canUpdateOrder,
    toCustomerSummary,
    validateGatewayHeaders,
} = require('../lib/policy');

test('validateGatewayHeaders rejects missing shared secret', () => {
    const result = validateGatewayHeaders(
        {
            'x-user-id': 'user-1',
            'x-user-role': 'admin',
        },
        'shared-secret'
    );

    assert.equal(result.ok, false);
    assert.equal(result.status, 401);
    assert.equal(result.error, 'Unauthorized gateway request');
});

test('validateGatewayHeaders accepts trusted gateway headers', () => {
    const result = validateGatewayHeaders(
        {
            'x-user-id': 'user-1',
            'x-user-role': 'sales',
            'x-gateway-secret': 'shared-secret',
        },
        'shared-secret'
    );

    assert.equal(result.ok, true);
    assert.deepEqual(result.user, { id: 'user-1', role: 'sales' });
});

test('RBAC helpers enforce order and customer visibility correctly', () => {
    assert.equal(canViewAllOrders('admin'), true);
    assert.equal(canViewAllOrders('sales'), true);
    assert.equal(canViewAllOrders('customer'), false);
    assert.equal(canViewCustomers('admin'), true);
    assert.equal(canViewCustomers('sales'), true);
    assert.equal(canViewCustomers('shipper'), false);
});

test('canUpdateOrder enforces allowed status transitions', () => {
    assert.equal(canUpdateOrder('sales', 'pending', 'processing'), true);
    assert.equal(canUpdateOrder('sales', 'processing', 'shipped'), true);
    assert.equal(canUpdateOrder('sales', 'processing', 'delivered'), false);
    assert.equal(canUpdateOrder('shipper', 'processing', 'in_transit'), true);
    assert.equal(canUpdateOrder('shipper', 'in_transit', 'delivered'), true);
    assert.equal(canUpdateOrder('shipper', 'pending', 'delivered'), false);
    assert.equal(canUpdateOrder('customer', 'pending', 'processing'), false);
});

test('toCustomerSummary masks PII for non-admin views', () => {
    const summary = toCustomerSummary({
        id: 'cust-1',
        name: 'Customer One',
        email: 'customer.one@example.com',
        phone: '0987654321',
        address: '123 Main St',
        total_orders: 3,
        ltv: 250,
    });

    assert.equal(summary.email, 'cu***@example.com');
    assert.equal(summary.phone, '***-***-4321');
    assert.equal(summary.total_orders, 3);
    assert.equal(summary.ltv, 250);
});
