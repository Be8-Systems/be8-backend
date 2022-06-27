const groupTypes = ['public', 'private'];

export default async function groupType(req) {
    const type = req.body.groupType;

    if (!groupTypes.includes(type)) {
        return {
            status: 400,
            response: {
                error: 'INVALIDGROUPTYPE',
            },
        };
    }

    return true;
}