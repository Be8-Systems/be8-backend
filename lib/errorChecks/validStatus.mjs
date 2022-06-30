export default async function validStatus(req) {
    const status = req.body.status;

    if (typeof status !== 'string' || status.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDSTATUS',
            },
        };
    }

    return true;
}