export default async function validNickname(req) {
    const nickname = req.body.newNickname || req.body.nickname;

    if (typeof nickname !== 'string' || nickname.length < 1 || nickname.length > 20) {
        return {
            status: 400,
            response: {
                error: 'INVALIDNICKNAME',
            },
        };
    }

    return true;
}
