import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupAddMember', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl()}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl()}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl()}/newAcc`, thirdAccOptions);
    const secondAccData = await secondAcc.json();
    const thirdAccData = await thirdAcc.json();
    const adminCookie = firstAcc.headers.get('set-cookie');
    const userCookie = secondAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'private',
    };
    const groupOptions = getPostOptions(groupBody, adminCookie);
    const groupResponse = await nodeFetch(`${baseUrl()}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, adminCookie);

    await nodeFetch(`${baseUrl()}/groupaddmember`, addOptions);
    // fail tests
    const failBodies = [
        {
            groupID: group.groupID,
            memberID: '134342534', // not existing acc
            reason: 'MEMBERNOTEXISTING',
        },
        {
            groupID: 'g1234563545', // not existing group
            memberID: secondAccData.accID + '',
            reason: 'GROUPNOTEXISTING',
        },
        {
            groupID: group.groupID,
            memberID: secondAccData.accID + '', // already joined
            reason: 'ISALREADYMEMBER',
        },
        {
            groupID: group.groupID,
            memberID: thirdAccData.accID + '', // non admin trying to add
            reason: 'NOTADMIN',
        },
    ];
    const proms = failBodies.map(function (convBody, i) {
        const cookie = i === 3 ? userCookie : adminCookie;
        const addMemberOptions = getPostOptions(convBody, cookie);

        return nodeFetch(`${baseUrl()}/groupaddmember`, addMemberOptions);
    });
    const responses = await Promise.all(proms);

    responses.forEach(async function (response, i) {
        const data = await response.json();

        assert.strictEqual(data.reason, failBodies[i].reason);
        assert.notStrictEqual(data.valid, true);
    });
});
