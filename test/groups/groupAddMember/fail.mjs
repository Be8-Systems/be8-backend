import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupAddMember', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
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
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, adminCookie);

    await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    // fail tests
    const failBodies = [
        {
            groupID: 'g1234563545',
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not existing',
        },
        {
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group parameter is missing',
        },
        {
            groupID: null,
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: [],
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: {},
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: '',
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not existing',
        },
        {
            groupID: 123,
            memberID: secondAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id param is missing',
        },
        {
            groupID: group.groupID,
            memberID: '134342534',
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not existing',
        },
        {
            groupID: group.groupID,
            memberID: '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not existing',
        },
        {
            groupID: group.groupID,
            memberID: [],
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not a string',
        },
        {
            groupID: group.groupID,
            memberID: {},
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not a string',
        },
        {
            groupID: group.groupID,
            memberID: 123,
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not a string',
        },
        {
            groupID: group.groupID,
            memberID: null,
            expected: 'MEMBERNOTEXISTING',
            msg: 'member id not a string',
        },
        {
            groupID: group.groupID,
            memberID: secondAccData.accID + '', // already joined
            expected: 'ISALREADYMEMBER',
        },
        {
            groupID: group.groupID,
            memberID: thirdAccData.accID + '', // non admin trying to add
            expected: 'NOTADMIN',
            userCookie,
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.userCookie || adminCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupaddmember`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
