function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isNonNegativeNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function validateOrderPayload(payload) {
    const { items, total_amount: totalAmount, address } = payload;

    if (!Array.isArray(items) || items.length === 0) {
        return { ok: false, status: 400, error: 'Order must include at least one item' };
    }

    if (!isNonNegativeNumber(totalAmount)) {
        return { ok: false, status: 400, error: 'total_amount must be a non-negative number' };
    }

    if (!isNonEmptyString(address)) {
        return { ok: false, status: 400, error: 'Shipping address is required' };
    }

    const hasInvalidItems = items.some((item) =>
        !item ||
        !isNonEmptyString(item.product_id) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        !isNonNegativeNumber(item.price)
    );

    if (hasInvalidItems) {
        return {
            ok: false,
            status: 400,
            error: 'Each order item must include product_id, positive quantity, and non-negative price',
        };
    }

    return { ok: true };
}

module.exports = {
    isNonEmptyString,
    isNonNegativeNumber,
    validateOrderPayload,
};
