import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, getOptionsWithoutCookie } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const failBodies = [{
    password: '',
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw is too short (min length 1)'
}, {
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw parameter is missing'
}, {
    password: 100,
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw is not a string'
}, {
    password: false,
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw is not a string'
}, {
    password: [],
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw is not a string'
}, {
    password: {},
    nickname: randomString(10),
    expected: 'INVALIDPASSWORD',
    msg: 'pw is not a string'
}, {
    nickname: '',
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname is too short (min length 1)'
}, {
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname parameter is missing'
}, {
    nickname: 100,
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname is not a string'
}, {
    nickname: false,
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname is not a string'
}, {
    nickname: [],
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname is not a string'
}, {
    nickname: {},
    password: randomString(10),
    expected: 'INVALIDNICKNAME',
    msg: 'nickname is not a string'
}];

test('FAIL newAcc', async function (context) {
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getOptionsWithoutCookie(body)
            const response = await nodeFetch(`${baseUrl}/newAcc`, options);
            const data = await response.json();
            
            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});