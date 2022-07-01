const errorObject = {
    status: 400,
    response: {
        error: 'INVALIDPUBLICKEY',
    },
};
const validCrvs = ['P-256', 'P-384'];

function checkPublicKey (key) {
    const { crv, ext, key_ops, kty, x, y } = key;
    const validCrv = validCrvs.includes(crv);
    const validExt = ext === true;
    const validKeyOps = Array.isArray(key_ops);
    const validKty = kty === 'EC';
    const validX = typeof x === 'string' && x.length > 0;
    const validY = typeof y === 'string' && y.length > 0;

    if (validCrv && validExt && validKeyOps && validKty && validX && validY) {
        return true;
    }

    return errorObject;
}

export default async function validPublicKey(req) {
    if (!req.body.publicKey) {
        return errorObject; 
    }
    
    return checkPublicKey(req.body.publicKey);
}
