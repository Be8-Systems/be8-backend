import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const accOptions = newAccOptions();

test('FAIL codeSet', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [{
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode parameter is missing'
    }, {
        unlockCode: '',
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode is too short'
    }, {
        unlockCode: null,
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode is not a string'
    }, {
        unlockCode: {},
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode is not a string'
    }, {
        unlockCode: [],
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode is not a string'
    }, {
        unlockCode: 123,
        destroyCode: randomString(9),
        expected: 'INVALIDUNLOCKCODE',
        msg: 'unlockCode is not a string'
    }, {
        unlockCode: randomString(9),
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode parameter is missing'
    }, {
        unlockCode: randomString(9),
        destroyCode: '',
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode is too short'
    }, {
        unlockCode: randomString(9),
        destroyCode: false,
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode is not a string'
    }, {
        unlockCode: randomString(9),
        destroyCode: [],
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode is not a string'
    }, {
        unlockCode: randomString(9),
        destroyCode: {},
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode is not a string'
    }, {
        unlockCode: randomString(9),
        destroyCode: 1234,
        expected: 'INVALIDDESTROYCODE',
        msg: 'destroyCode is not a string'
    }];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/codeset`, options);
            const data = await response.json();
            
            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
