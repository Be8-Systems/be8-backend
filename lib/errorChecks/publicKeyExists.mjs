export default async function publicKeyExists (req) {
    if (!req.body.publicKey) {
        return { 
            status: 400,
            response: {
                error: 'NOPUBLICKEY'
            }
        };
    }

    return true;
}