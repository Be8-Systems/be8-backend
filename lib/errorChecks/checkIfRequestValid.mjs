import isAdmin from './isAdmin.mjs';
import isMember from './isMember.mjs';
import isPrivate from './isPrivate.mjs';
import accExists from './accExists.mjs';
import groupExists from './groupExists.mjs';
import memberExists from './memberExists.mjs';
import circularConv from './circularConv.mjs';
import validNickname from './validNickname.mjs';
import alreadyJoined from './alreadyJoined.mjs';
import receiverExists from './receiverExists.mjs';
import groupMaxReached from './groupMaxReached.mjs';
import publicKeyExists from './publicKeyExists.mjs';

const all = Object.freeze({
    isAdmin,
    isMember,
    isPrivate,
    accExists,
    groupExists,
    memberExists,
    circularConv,
    validNickname,
    alreadyJoined,
    receiverExists,
    groupMaxReached,
    publicKeyExists
});

export default async function checkIfRequestValid (req, fns) {
    const errorProms = fns.map(fn => all[fn](req));
    const errors = await Promise.all(errorProms);
    
    return errors.find(e => e !== true) || true;
}
