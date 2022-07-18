import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('FAIL groupGetCurrentVersion', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const validCookie = firstAcc.headers.get('set-cookie');
    const nonGroupCookie = secondAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, validCookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // fail get current version
    const failBodies = [
        {
            groupID: group.groupID,
            nonGroupCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'non group member cannot get current version',
        },
        {
            expected: 'GROUPNOTEXISTING',
            msg: 'group id parameter is missing',
        },
        {
            groupID: '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not existing',
        },
        {
            groupID: '123423434532424',
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not existing',
        },
        {
            groupID: false,
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: [],
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: {},
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
        {
            groupID: 123,
            expected: 'GROUPNOTEXISTING',
            msg: 'group id not a string',
        },
    ];
    const tests = failBodies.map(async function (body) {
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
