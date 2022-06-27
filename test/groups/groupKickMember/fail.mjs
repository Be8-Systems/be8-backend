import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupKickMember', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
    const thirdAccData = await thirdAcc.json();
    const adminCookie = firstAcc.headers.get('set-cookie');
    const userCookie = secondAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, adminCookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, adminCookie);
    const addResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    const added = await addResponse.json();
    // fail tests
    const failBodies = [
        {
            groupID: group.groupID,
            accID: secondAccData.accID + '',
            userCookie,
            expected: 'NOTADMIN',
            msg: 'trying to kick without being the admin'
        },
        {
            groupID: group.groupID,
            accID: firstAccData.accID + '',
            expected: 'CIRCULARKICK',
            msg: 'trying to kick yourself'
        },
        {
            groupID: 'g1234563545',
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing'
        },
        {
            groupID: '',
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing'
        },
        {
            groupID: true,
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string'
        },
        {
            groupID: [],
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string'
        },
        {
            groupID: {},
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string'
        },
        {
            groupID: 123,
            accID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string'
        },
        {
            groupID: group.groupID,
            accID: thirdAccData.accID + '',
            expected: 'NOGROUPMEMBER',
            msg: 'acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: '1234359458495',
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: '',
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: [],
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: null,
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: {},
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
        {
            groupID: group.groupID,
            accID: 123,
            expected: 'NOGROUPMEMBER',
            msg: 'Acc is not in group'
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.userCookie || adminCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupkickmember`, options);
            const data = await response.json();
            
            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
