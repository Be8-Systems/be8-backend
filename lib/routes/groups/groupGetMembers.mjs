import redis from '../../util/redis.mjs';
import checkIfRequestValid from '../../errorChecks/checkIfRequestValid.mjs';

async function validRequest(req, res) {
    const groupMembers = await redis.sMembers(`threads:${req.body.groupID}`);
    const group = await redis.hGetAll(`group:${req.body.groupID}`);
    const membersInfoProms = groupMembers.map((member) =>
        redis.hGetAll(`acc:${member}`)
    );
    const rawMembers = await Promise.all(membersInfoProms);
    const unsortedMembers = rawMembers
        .filter((member) => member.nickname)
        .map(function (member) {
            const { password, ...rest } = member; // eslint-disable-line
            return rest;
        });
    const members = unsortedMembers.sort(function (a) {
        if (a.id === group.admin) {
            return -1;
        }

        return 1;
    });

    return res.status(200).send({ valid: true, members });
}

async function groupGetMembers(req, res) {
    const valid = await checkIfRequestValid(req, ['accExists', 'isMember']);

    if (valid === true) {
        return await validRequest(req, res);
    }

    return res.status(valid.status).send(valid.response);
}

export default function groupGetMembersRoute(app) {
    return app.post('/groupgetmembers', groupGetMembers);
}
