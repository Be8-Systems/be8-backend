import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();

test('FAIL update code', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const codeBody = {
        unlockCode: randomString(9),
        destroyCode: randomString(9),
    };
    const codeSetOptions = getPostOptions(codeBody, cookie);
    await nodeFetch(`${baseUrl}/codeset`, codeSetOptions);
    const failBodies = [
        {
            codeType: 'unlock',
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODE',
            msg: 'code parameter is missing',
        },
        {
            code: '',
            codeType: 'destroy',
            oldCode: codeBody.destroyCode,
            expected: 'INVALIDCODE',
            msg: 'code is too short',
        },
        {
            code: null,
            codeType: 'destroy',
            oldCode: codeBody.destroyCode,
            expected: 'INVALIDCODE',
            msg: 'code is not a string',
        },
        {
            code: {},
            codeType: 'unlock',
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODE',
            msg: 'code is not a string',
        },
        {
            code: [],
            codeType: 'unlock',
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODE',
            msg: 'code is not a string',
        },
        {
            code: 1234,
            codeType: 'destroy',
            oldCode: codeBody.destroyCode,
            expected: 'INVALIDCODE',
            msg: 'code is not a string',
        },
        {
            code: randomString(9),
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType parameter is missing',
        },
        {
            code: randomString(9),
            codeType: 'invalid',
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not valid',
        },
        {
            code: randomString(9),
            codeType: '',
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not valid',
        },
        {
            code: randomString(9),
            codeType: null,
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not a string',
        },
        {
            code: randomString(9),
            codeType: {},
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not a string',
        },
        {
            code: randomString(9),
            codeType: [],
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not a string',
        },
        {
            code: randomString(9),
            codeType: 1234,
            oldCode: codeBody.unlockCode,
            expected: 'INVALIDCODETYPE',
            msg: 'codeType is not a string',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is missing',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: '',
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is invalid',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: false,
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is not a string',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: [],
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is not a string',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: {},
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is not a string',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: 1234,
            expected: 'INVALIDOLDCODE',
            msg: 'oldCode parameter is not a string',
        },
        {
            code: randomString(9),
            codeType: 'unlock',
            oldCode: 'wrong code',
            expected: 'OLDCODEWRONG',
            msg: 'oldCode is the wrong code',
        },
        {
            code: randomString(9),
            codeType: 'destroy',
            oldCode: 'wrong code',
            expected: 'OLDCODEWRONG',
            msg: 'oldCode is the wrong code',
        },
    ];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/codeupdate`, options);
            const data = await response.json();

            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
