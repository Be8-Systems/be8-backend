const codeTypes = ['unlock', 'destroy'];

export default async function validCodeType(req) {
    const type = req.body.codeType;

    if (!codeTypes.includes(type)) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDCODETYPE',
            },
        };
    }

    return true;
}
