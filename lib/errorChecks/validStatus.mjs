export default async function validStatus(req) {
    const status = req.body.userStatus;

    if (typeof status !== 'string') {
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
