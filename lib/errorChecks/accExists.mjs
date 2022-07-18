export default async function accExists(req) {
    const accID = req.session.accID;

    if (!accID) {
        return {
            status: 401,
            response: {
                error: 'NOTAUTH',
            },
        };
    }

    return true;
}
