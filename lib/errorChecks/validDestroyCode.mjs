export default async function validDestroyCode(req) {
    const destroyCode = req.body.destroyCode;

    if (typeof destroyCode !== 'string' || destroyCode.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDDESTROYCODE',
            },
        };
    }

    return true;
}
