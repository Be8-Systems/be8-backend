import redis from '../../util/redis.mjs';
import CryptoJS from 'crypto-js';
import globals from '../../data/globals.mjs';

async function generateMasterThread (accID) {
    const messageID = await redis.incr(`messageAmount:${accID}:s1`);
    const key = `message:${accID}:s1:${messageID}`;
    const message = {
        messageID,
        text: 'WELCOME',
        ts: new Date(),
        type: 'system',
        sender: 's1',
        receiver: accID
    };
    
    return await redis.hSet(key, message);
}

async function newAcc (req, res) {
    const bytes  = CryptoJS.AES.decrypt(req.body.password, 'asdoij32423904ISASsdasd');
    const password = bytes.toString(CryptoJS.enc.Utf8);
    const accID = await redis.incr('accAmount');
    const expire = new Date(Date.now() + globals.expireTime); 
    const accObj = { 
        nickname: req.body.nickname, 
        password,
        type: 'user',
        expire,
        id: accID
    };
    
    req.session.authenticated = true;
    req.session.cookie.maxAge = globals.expireTime;
    req.session.cookie.expires = expire;
    req.session.accID = accID + '';
    req.session.save();
    
    await redis.hSet(`acc:${accID}`, accObj);
    redis.expire(`acc:${accID}`, globals.expireTime / 1000);
    await generateMasterThread(accID);
    return res.status(200).send({ valid: true, accID });
}

export default function newAccRoute (app) {
    return app.post('/newacc', newAcc);
}
