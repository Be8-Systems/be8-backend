const messageTypes = ['textMessage', 'imageMessage'];

export default async function messageType(req) {
    const type = req.body.type;

    if (!messageTypes.includes(type)) {
        return {
            status: 400,
            response: {
                error: 'INVALIDMESSAGETYPE',
            },
        };
    }

    return true;
}