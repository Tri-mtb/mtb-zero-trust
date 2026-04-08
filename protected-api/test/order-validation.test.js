const test = require('node:test');
const assert = require('node:assert/strict');

const { validateOrderPayload } = require('../lib/order-validation');

test('validateOrderPayload rejects empty carts', () => {
    const result = validateOrderPayload({
        items: [],
        total_amount: 100,
        address: '123 Main St',
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.equal(result.error, 'Order must include at least one item');
});

test('validateOrderPayload rejects missing shipping address', () => {
    const result = validateOrderPayload({
        items: [{ product_id: 'prod-1', quantity: 1, price: 100 }],
        total_amount: 100,
        address: '',
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'Shipping address is required');
});

test('validateOrderPayload rejects malformed item payloads', () => {
    const result = validateOrderPayload({
        items: [{ product_id: 'prod-1', quantity: 0, price: 100 }],
        total_amount: 100,
        address: '123 Main St',
    });

    assert.equal(result.ok, false);
    assert.equal(result.error, 'Each order item must include product_id, positive quantity, and non-negative price');
});

test('validateOrderPayload accepts well-formed checkout payloads', () => {
    const result = validateOrderPayload({
        items: [
            { product_id: 'prod-1', quantity: 1, price: 100 },
            { product_id: 'prod-2', quantity: 2, price: 50 },
        ],
        total_amount: 200,
        address: '123 Main St',
    });

    assert.deepEqual(result, { ok: true });
});
