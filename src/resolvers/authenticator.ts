const authHeaderKey: string = 'X-TaaS-Key';

export function authenticateQuery(request: any){
    if (process.env.ENABLE_API_KEY === 'true' && process.env.API_KEY) {
        if (request.header(authHeaderKey) !== process.env.API_KEY) {
            throw new Error('Provided X-TaaS-Key header value is wrong or empty!');
        }
    }
}

export function authenticateSubscription(context: any){
    if (process.env.ENABLE_API_KEY === 'true' && process.env.API_KEY) {
        if (context[authHeaderKey] !== process.env.API_KEY) {
            throw new Error('Provided X-TaaS-Key header value is wrong or empty!');
        }
    }
}