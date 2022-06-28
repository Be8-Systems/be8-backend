const updateTypes = ['joinmember', 'leavegroup'];

export default async function updateTypeExists(req) {
    const type = req.body.update;
    console.log(type, updateTypes.includes(type))
    if (!updateTypes.includes(type)) {
        return {
            status: 200,
            response: {
                reason: 'INVALIDUPDATETYPE',
            },
        };
    }

    return true;
}