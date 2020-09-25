export const Query = {
    operations(parent: any, args: any, context: any) {
        return global.Operations;
    },

    transactions(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === 'transaction');
    },

    endorsements(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === 'endorsement');
    },

    reveals(parent: any, args: any, context: any) {
        return global.Operations.filter(o => o.kind === 'reveal');
    },
}