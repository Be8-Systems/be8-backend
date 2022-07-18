import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('FAIL inviteLink', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [
        {
            type: '',
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type parameter is missing',
        },
        {
            type: '',
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not valid',
        },
        {
            type: 'bla',
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not valid',
        },
        {
            type: false,
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not a string',
        },
        {
            type: {},
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not a string',
        },
        {
            type: [],
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not a string',
        },
        {
            type: 1234,
            sentInviteLink: true,
            expected: 'INVALIDLINKTYPE',
            msg: 'type is not a string',
        },
        {
            type: 'join',
            expected: 'NOTUSEDORSENTLINK',
            msg: 'used and sent inviteLink parameter is missing',
        },
        {
            type: 'join',
            usedInviteLink: '',
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: 'not valid',
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: false,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: null,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: [],
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: {},
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'join',
            usedInviteLink: 1234,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'usedInviteLink is not set to true',
        },
        {
            type: 'group',
            sentInviteLink: '',
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: 'not valid',
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: false,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: null,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: [],
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: {},
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
        {
            type: 'group',
            usedInviteLink: 1234,
            expected: 'NOTUSEDORSENTLINK',
            msg: 'sentInviteLink is not set to true',
        },
    ];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/invitelink`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
