export default async function validToken(req) {
    const code = req.body.token;

    if (typeof code !== 'string' || code.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDTOKEN',
            },
        };
    }

    return true;
}