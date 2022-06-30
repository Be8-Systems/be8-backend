export default async function usedOrSent(req) {
    const usedOrSent = req.body.sentInviteLink || req.body.usedInviteLink;

    if (typeof usedOrSent !== 'string' || usedOrSent.length < 1) {
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