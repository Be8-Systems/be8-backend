export default async function circularConv(req) {
    const accID = req.session.accID;
    const receiverID = req.body.receiverID;

    if (receiverID === accID) {
        return {
            status: 400,
            response: {
                error: 'CIRCULARCONVERSATION',
            },
        };
    }

    return true;
}
