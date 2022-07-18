import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();

test('FAIL groupJoinMember', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const cookie = firstAcc.headers.get('set-cookie');
    const alreadyJoinedCookie = secondAcc.headers.get('set-cookie');
    const validCookie = thirdAcc.headers.get('set-cookie');
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
    const joinOptions = getPostOptions(joinBody, alreadyJoinedCookie);
    const joinResponse = await nodeFetch(`${baseUrl}/groupjoinmember`, joinOptions);
    // fail tests
    const failBodies = [
        {
            groupID: group.groupID,
            alreadyJoinedCookie,
            expected: 'ISALREADYMEMBER',
            msg: 'this acc is already a member of the group',
        },
        {
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID parameter is missing',
        },
        {
            groupID: 'g12345635454545',
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
            groupID: [],
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: {},
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
            const cookie = body.alreadyJoinedCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupjoinmember`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
