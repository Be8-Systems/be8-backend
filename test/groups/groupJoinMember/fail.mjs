import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('FAIL groupJoinMember', async function () {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    const secondAccCookie = secondAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // join group
    const joinBody = {
        groupID: group.groupID,
    };
    const joinOptions = getPostOptions(joinBody, secondAccCookie);
    const joinResponse = await nodeFetch(`${baseUrl}/groupjoinmember`, joinOptions);
    // fail tests
    const failBodies = [
        {
            groupID: group.groupID,
            memberID: secondAccData.accID + '', // already joined
            reason: 'ISALREADYMEMBER',
        },
        {
            groupID: 'g1234563545', // not existing group
            memberID: secondAccData.accID + '',
            reason: 'GROUPNOTEXISTING',
        },
    ];
    const proms = failBodies.map(function (convBody) {
        const jooinMemberOptions = getPostOptions(convBody, secondAccCookie);
        return nodeFetch(`${baseUrl}/groupjoinmember`, jooinMemberOptions);
    });
    const responses = await Promise.all(proms);

    responses.forEach(async function (response, i) {
        const data = await response.json();

        assert.strictEqual(data.reason, failBodies[i].reason);
        assert.notStrictEqual(data.valid, true);
    });
});
