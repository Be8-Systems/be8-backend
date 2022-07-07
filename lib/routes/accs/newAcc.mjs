import redis from '../../util/redis.mjs';
import CryptoJS from 'crypto-js';
import globals from '../../data/globals.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function generateMasterThread(accID) {
    const messageID = await redis.incr(`messageAmount:${accID}:s1`);
    const key = `message:${accID}:s1:${messageID}`;
    const message = {
        messageID,
        text: 'WELCOME',
        ts: new Date(),
        type: 'system',
        sender: 's1',
        receiver: accID,
    };

    return await redis.hSet(key, message);
}

function decryptPassword ({ password, salt }) {
    try {
        const bytes = CryptoJS.AES.decrypt(password, salt);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function validRequest(req, res) {
    const password = decryptPassword(req.body);
    const accID = await redis.incr('accAmount');
    const expire = new Date(Date.now() + globals.expireTime);
    const accObj = {
        nickname: req.body.nickname,
        password,
        type: 'user',
        expire,
        id: accID,
        codes: false,
        status: '',
        endless: false
    };
    
    if (!password) {
        return res.status(200).send({ valid: false, warning: 'PASSWORDFAILURE' });
    }
    
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

async function newAcc(req, res) {
    const valid = await checkIfRequestValid(req, ['validNickname', 'validPassword']);
    
    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function newAccRoute(app) {
    return app.post('/newacc', newAcc);
}
