export default async function validNickname (req) {
    const newNickname = req.body.newNickname;

    if (newNickname < 1 || newNickname > 20) {
        return {
            status: 400,
            response: { 
                error: 'INVALIDNICKNAME' 
            }
        };
    }

    return true;
}