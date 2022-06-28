export default async function validGroupKey(req) {
    const key = req.body.groupKey;

    if (typeof key !== 'string' || key.length < 10) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDGROUPKEY',
            },
        };
    }

    return true;
}
