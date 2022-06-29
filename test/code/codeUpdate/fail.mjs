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
    const failBodies = [{
        codeType: 'unlock',
        expected: 'INVALIDCODE',
        msg: 'code parameter is missing'
    }, {
        code: '',
        codeType: 'destroy',
        expected: 'INVALIDCODE',
        msg: 'code is too short'
    }, {
        code: null,
        codeType: 'destroy',
        expected: 'INVALIDCODE',
        msg: 'code is not a string'
    }, {
        code: {},
        codeType: 'unlock',
        expected: 'INVALIDCODE',
        msg: 'code is not a string'
    }, {
        code: [],
        codeType: 'unlock',
        expected: 'INVALIDCODE',
        msg: 'code is not a string'
    }, {
        code: 1234,
        codeType: 'destroy',
        expected: 'INVALIDCODE',
        msg: 'code is not a string'
    }, {
        code: randomString(9),
        expected: 'INVALIDCODETYPE',
        msg: 'codeType parameter is missing'
    }, {
        code: randomString(9),
        codeType: 'invalid',
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not valid'
    }, {
        code: randomString(9),
        codeType: '',
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not valid'
    }, {
        code: randomString(9),
        codeType: null,
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not a string'
    }, {
        code: randomString(9),
        codeType: {},
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not a string'
    }, {
        code: randomString(9),
        codeType: [],
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not a string'
    }, {
        code: randomString(9),
        codeType: 1234,
        expected: 'INVALIDCODETYPE',
        msg: 'codeType is not a string'
    }];
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
