import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupLeaveMember', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const secondAccData = await secondAcc.json();
    const validCookie = firstAcc.headers.get('set-cookie');
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
    // fail leaveing group
    const failBodies = [
        {
            groupID: group.groupID,
            nonGroupCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'acc is not member of the group',
        },
        {
            groupID: 'g14356358374',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            groupID: '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            groupID: false,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: {},
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: [],
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: 123,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.nonGroupCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupleavemember`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
