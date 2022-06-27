import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();

test('FAIL groupCreate', async function (context) {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const failBodies = [{
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname parameter is missing'
    }, {
        nickname: '',
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is too short (min 1 character)'
    }, {
        nickname: 'skdriwejdvkfjds idjfiwedkjf dskfj wisdkjf isdf',
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is too long (max 20 characters)'
    }, {
        nickname: null,
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is not a string'
    }, {
        nickname: {},
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is not a string'
    }, {
        nickname: [],
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is not a string'
    }, {
        nickname: 123,
        groupType: 'public',
        expected: 'INVALIDNICKNAME',
        msg: 'nickname is not a string'
    }, {
        nickname: 'new string',
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is missing'
    }, {
        nickname: 'new string',
        groupType: 'helicopter',
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a valid name (private, public)'
    }, {
        nickname: 'new string',
        groupType: false,
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a string'
    }, {
        nickname: 'new string',
        groupType: {},
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a string'
    }, {
        nickname: 'new string',
        groupType: [],
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a string'
    }, {
        nickname: 'new string',
        groupType: 123,
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a string'
    }, {
        nickname: 'new string',
        groupType: '',
        expected: 'INVALIDGROUPTYPE',
        msg: 'group type is not a valid name (private, public)'
    }];
    const tests = await failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/groupcreate`, options);
            const data = await response.json();
            
            assert(!data.valid);
            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
