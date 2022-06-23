export default async function validNickname(req) {
    const newNickname = req.body.newNickname;

    if (typeof newNickname !== 'string' || newNickname.length < 1 || newNickname.length > 20) {
        return {
            status: 400,
            response: {
                error: 'INVALIDNICKNAME',
            },
        };
    }

    return true;
}
