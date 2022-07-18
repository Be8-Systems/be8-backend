const messageTypes = ['text', 'image', 'system'];

export default async function messageType(req) {
    const type = req.body.messageType;

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
