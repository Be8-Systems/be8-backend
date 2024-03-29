import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const { type, sentInviteLink, usedInviteLink } = req.body;

    if (type === 'user') {
        if (sentInviteLink) {
            await redis.incr('sentInviteLinkAmount');
            return res.status(200).send({ valid: true });
        }
        if (usedInviteLink) {
            await redis.incr('usedInviteLinkAmount');
            return res.status(200).send({ valid: true });
        }
    }
    if (type === 'group') {
        if (sentInviteLink) {
            await redis.incr('sentGroupInviteLinkAmount');
            return res.status(200).send({ valid: true });
        }
        if (usedInviteLink) {
            await redis.incr('usedGroupInviteLinkAmount');
            return res.status(200).send({ valid: true });
        }
    }

    return res.status(400).send({ error: 'INVALIDINPUT' });
}

async function inviteLink(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'linkType', 'usedOrSent']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function inviteLinkRoute(app) {
    return app.post('/invitelink', inviteLink);
}
