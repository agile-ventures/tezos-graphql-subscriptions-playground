function operations(parent, args, context) {
    return global.operations
}

function transactions(parent, args, context) {
    return global.operations.filter(o => o.kind === 'transaction')
}

function endorsements(parent, args, context) {
    return global.operations.filter(o => o.kind === 'endorsement')
}

function reveals(parent, args, context) {
    return global.operations.filter(o => o.kind === 'reveal')
}

module.exports = {
    operations,
    transactions,
    endorsements,
    reveals
}