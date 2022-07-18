export default async function validCode(req) {
    const code = req.body.code;

    if (typeof code !== 'string' || code.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDCODE',
            },
        };
    }

    return true;
}
