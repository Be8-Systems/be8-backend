import isAdmin from './isAdmin.mjs';
import isMember from './isMember.mjs';
import accExists from './accExists.mjs';
import groupType from './groupType.mjs';
import isInGroup from './isInGroup.mjs';
import groupExists from './groupExists.mjs';
import messageType from './messageType.mjs';
import alreadyAdded from './alreadyAdded.mjs';
import senderExists from './senderExists.mjs';
import threadExists from './threadExists.mjs';
import circularKick from './circularKick.mjs';
import memberExists from './memberExists.mjs';
import circularConv from './circularConv.mjs';
import validNickname from './validNickname.mjs';
import validPassword from './validPassword.mjs';
import alreadyJoined from './alreadyJoined.mjs';
import receiverExists from './receiverExists.mjs';
import groupMaxReached from './groupMaxReached.mjs';
import publicKeyExists from './publicKeyExists.mjs';
import adminAndPrivate from './adminAndPrivate.mjs';

const all = Object.freeze({
    isAdmin,
    isMember,
    accExists,
    groupType,
    isInGroup,
    groupExists,
    messageType,
    alreadyAdded,
    senderExists,
    threadExists,
    circularKick,
    memberExists,
    circularConv,
    validNickname,
    validPassword,
    alreadyJoined,
    receiverExists,
    groupMaxReached,
    publicKeyExists,
    adminAndPrivate,
});

export default async function checkIfRequestValid(req, fns) {
    const errorProms = fns.map(fn => all[fn](req));
    const errors = await Promise.all(errorProms);

    return errors.find(e => e !== true) || true;
}
