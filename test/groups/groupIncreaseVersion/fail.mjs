import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();

test('FAIL groupIncreaseVersion', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const cookie = firstAcc.headers.get('set-cookie');
    // create group
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, cookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // add to group
    const addBody = {
        groupID: group.groupID,
        memberID: secondAccData.accID + '',
    };
    const addOptions = getPostOptions(addBody, cookie);
    const addResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    const added = await addResponse.json();
    // increase version
    const failBodies = [
        {
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID parameter is missing',
        },
        {
            groupID: 'g111111',
            expected: 'GROUPNOTEXISTING',
            msg: 'group is not existing',
        },
        {
            groupID: '',
            expected: 'GROUPNOTEXISTING',
            msg: 'group is not existing',
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
            groupID: 1234,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
    ];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupincreaseversion`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
