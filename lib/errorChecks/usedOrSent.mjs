export default async function usedOrSent(req) {
    const usedOrSent = req.body.sentInviteLink || req.body.usedInviteLink;

    if (usedOrSent !== true) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'NOTUSEDORSENTLINK',
            },
        };
    }

    return true;
}
