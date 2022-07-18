export default async function validOldCode(req) {
    const code = req.body.oldCode;

    if (typeof code !== 'string' || code.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDOLDCODE',
            },
        };
    }

    return true;
}
