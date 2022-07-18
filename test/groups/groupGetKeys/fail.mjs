import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const thirdAccOptions = newAccOptions();
const groupKey =
    'J8KFhFn+obMLmvcJVc0rOocIgDvK3EWApKERyStxltLYViM8QmSc5+8H09cvbi3xGRuVfocSWXtGyamSKbxyfC721PGKM4KXUkGKLq+UJbj2HcPsUjki/kwmajGFbRbj6x8vNQ4CaaUER3s668Kzcvq/9s329crMPnXg/tzrZXfWJmAM9dqt5Rk4LyOcB7xDDniLOTQmSk3sKOJ3Pk0aLfydj3dmr1fBJrfPBdPIDqIdRN/FCySqcsgiLWanT0s5dqk9k1hurWmZdbuHjCiF2wa+NWGKydQF6Vk9Ve5L/iRJgvXFNXk6q24u6PPFaWIJ';

test('FAIL groupGetKeys', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const secondAccData = await secondAcc.json();
    const accID = secondAccData.accID + '';
    const validCookie = firstAcc.headers.get('set-cookie');
    const thirdAcc = await nodeFetch(`${baseUrl}/newAcc`, thirdAccOptions);
    const thirdCookie = thirdAcc.headers.get('set-cookie');
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
        memberID: accID,
    };
    const addOptions = getPostOptions(addBody, validCookie);
    const addResponse = await nodeFetch(`${baseUrl}/groupaddmember`, addOptions);
    // store key
    const storeBody = {
        accID,
        groupID: group.groupID,
        groupKey,
        keyholder: accID,
    };
    const storeOptions = getPostOptions(storeBody, validCookie);
    const storeResponse = await nodeFetch(`${baseUrl}/groupstorekey`, storeOptions);
    const stored = await storeResponse.json();
    // fail trying to get keys
    const failBodies = [
        {
            accID,
            groupID: group.groupID,
            nonGroupCookie: thirdCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'non group member trying to get group keys',
        },
        {
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID param is missing',
        },
        {
            accID: '3495439583495',
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not existing',
        },
        {
            accID: '',
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not existing',
        },
        {
            accID: null,
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not a string',
        },
        {
            accID: [],
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not a string',
        },
        {
            accID: {},
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not a string',
        },
        {
            accID: 123,
            groupID: group.groupID,
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID not a string',
        },
        {
            accID,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID parameter is missing',
        },
        {
            accID,
            groupID: '3953948394839',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            accID,
            groupID: '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            accID,
            groupID: false,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID,
            groupID: [],
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID,
            groupID: {},
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID,
            groupID: 123,
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.nonGroupCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupgetkeys`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
