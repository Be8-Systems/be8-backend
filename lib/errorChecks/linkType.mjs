const linkTypes = ['join', 'group'];

export default async function linkType(req) {
    const type = req.body.type;

    if (!linkTypes.includes(type)) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDLINKTYPE',
            },
        };
    }

    return true;
}