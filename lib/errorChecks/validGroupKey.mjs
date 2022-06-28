export default async function validGroupKey(req) {
    const key = req.body.groupKey;

    if (typeof key !== 'string' || key.length < 10) {
        return {
            status: 200,
            response: {
                reason: 'INVALIDGROUPKEY',
            },
        };
    }

    return true;
}
