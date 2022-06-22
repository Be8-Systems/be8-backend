export default async function circularKick (req) {
    const accID = req.session.accID;
    const kickID = req.body.accID;
    
    if (kickID === accID) {
        return { 
            status: 200,
            response: {
                valid: false,
                reason: 'CIRCULARKICK'
            }
        };
    }

    return true;
}