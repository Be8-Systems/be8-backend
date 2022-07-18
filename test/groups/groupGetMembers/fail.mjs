import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname1 = randomString(10);
const nickname2 = randomString(10);
const firstAccOptions = newAccOptions(nickname1);
const secondAccOptions = newAccOptions(nickname2);
const thirdAccOptions = newAccOptions();

test('FAIL groupGetMembers', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const validCookie = firstAcc.headers.get('set-cookie');
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const nonGroupCookie = thirdAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, validCookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, validCookie);
    const addResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    const added = await addResponse.json();
    // fail get members
    const failBodies = [
        {
            groupID: group.groupID,
            nonGroupCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'non group member trying to get group members',
        },
        {
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID parameter is missing',
        },
        {
            groupID: '346384738478',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not existing',
        },
        {
            groupID: '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not existing',
        },
        {
            groupID: false,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not a string',
        },
        {
            groupID: [],
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not a string',
        },
        {
            groupID: {},
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not a string',
        },
        {
            groupID: 1234,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.nonGroupCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupgetcurrentversion`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
