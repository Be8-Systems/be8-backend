import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const firstAccOptions = newAccOptions();
const secondAccOptions = newAccOptions();
const firstAcc = await nodeFetch(`${baseUrl}/newAcc`, firstAccOptions);
const secondAcc = await nodeFetch(`${baseUrl}/newAcc`, secondAccOptions);
const validCookie = firstAcc.headers.get('set-cookie');
const nonGroupCookie = secondAcc.headers.get('set-cookie');

test('FAIL groupTriggerSSEUpdate', async function (context) {
    // group create
    const groupBody = {
        nickname: randomString(7),
        groupType: 'public',
    };
    const groupOptions = getPostOptions(groupBody, validCookie);
    const groupResponse = await nodeFetch(`${baseUrl}/groupcreate`, groupOptions);
    const group = await groupResponse.json();
    // group trigger sse update
    const failBodies = [
        {
            groupID: group.groupID,
            update: 'joinmember',
            nonGroupCookie,
            expected: 'NOGROUPMEMBER',
            msg: 'acc is not member of the group',
        },
        {
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID paremeter is missing',
        },
        {
            groupID: 'g2842387238723',
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            groupID: '',
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not existing',
        },
        {
            groupID: false,
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: [],
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: {},
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: 1234,
            update: 'joinmember',
            expected: 'GROUPNOTEXISTING',
            msg: 'groupID is not a string',
        },
        {
            groupID: group.groupID,
            expected: 'INVALIDUPDATETYPE',
            msg: 'update parameter is missing',
        },
        {
            groupID: group.groupID,
            update: 'notvalid',
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not valid',
        },
        {
            groupID: group.groupID,
            update: '',
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not valid',
        },
        {
            groupID: group.groupID,
            update: true,
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not a string',
        },
        {
            groupID: group.groupID,
            update: [],
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not a string',
        },
        {
            groupID: group.groupID,
            update: {},
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not a string',
        },
        {
            groupID: group.groupID,
            update: 1234,
            expected: 'INVALIDUPDATETYPE',
            msg: 'update is not a string',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const cookie = body.nonGroupCookie || validCookie;
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/grouptriggersseupdate`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
