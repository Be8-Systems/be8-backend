export default async function validSubscribe(req) {
    const { endpoint, expirationTime, keys } = req.body;
    const validEP = typeof endpoint === 'string' && endpoint.includes('https');
    const validET = expirationTime === null;
    const validKeys = keys
        && typeof keys === 'object' 
        && keys.p256dh 
        && keys.auth 
        && typeof keys.p256dh === 'string' 
        && typeof keys.auth === 'string'
        && keys.p256dh.length > 0
        && keys.auth.length > 0;

    if (validEP && validET && validKeys) {
        return true;
    }

    return {
        status: 400,
        response: {
            error: 'INVALIDSUBSCRIBE',
        },
    };
}
