export default async function validUnlockCode(req) {
    const unlockCode = req.body.unlockCode

    if (typeof unlockCode !== 'string' || unlockCode.length < 1) {
        return {
            status: 200,
            response: {
                valid: false,
                reason: 'INVALIDUNLOCKCODE',
            },
        };
    }

    return true;
}
