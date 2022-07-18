import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const groupKey = 'skdjfwiejf4498ut8ikdjfdsc,jg348ugxckjfsdkjf3498fjdskjf';

test('FAIL groupStoreKey', async function (context) {
    // create accs
    const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
    const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
    const firstAccData = await firstAcc.json();
    const secondAccData = await secondAcc.json();
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
    // fail storing key
    const failBodies = [
        {
            accID: secondAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            nonGroupCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'acc (session) is not a valid group member',
        },
        {
            accID: secondAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'NOGROUPMEMBER',
            msg: 'accID is not member of the group',
        },
        {
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID param is missing',
        },
        {
            accID: '384538473843847',
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not existing',
        },
        {
            accID: '',
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not existing',
        },
        {
            accID: null,
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: [],
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: {},
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: 123,
            groupID: group.groupID,
            groupKey,
            keyholder: secondAccData.accID + '',
            expected: 'MEMBERNOTEXISTING',
            msg: 'accID is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID parameter is missing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: 'g37463643848374',
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: '',
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: null,
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: {},
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: [],
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: 123,
            groupKey,
            keyholder: firstAccData.accID + '',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey parameter is missing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: 'kdjf',
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not valid (too short)',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: '',
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not valid (too short)',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: false,
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: [],
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: {},
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey: 12343457384738,
            keyholder: firstAccData.accID + '',
            expected: 'INVALIDGROUPKEY',
            msg: 'groupKey is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder paremter is missing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: '387438473847734',
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not existing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: '',
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not existing',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: null,
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: [],
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: {},
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not a string',
        },
        {
            accID: firstAccData.accID + '',
            groupID: group.groupID,
            groupKey,
            keyholder: 1234,
            expected: 'KEYHOLDERNOTEXISTING',
            msg: 'keyHolder is not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.nonGroupCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupstorekey`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
