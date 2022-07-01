import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();
const publicKeyToStore = {
    crv: 'P-256',
    ext: true,
    key_ops: [],
    kty: 'EC',
    x: 'uNW5zLRC7-XKRu2JEatPdrKAuJPCf0lKTF3NBmdSghw',
    y: '83RxcSiQJelZ9QQeBKjSLXPcCOZAJizUFazgoSPPS-U',
};

test('FAIL getKeys', async function (context) {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {
        publicKey: publicKeyToStore,
    };
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    const response = await nodeFetch(`${baseUrl}/setkey`, setKeyOptions);
    // getKes
    const failBodies = [{
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs param is missing'
    }, {
        accIDs: [accData.accID + '', ''],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not valid'
    }, {
        accIDs: [accData.accID + '', '3874538473847'],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not valid'
    }, {
        accIDs: [accData.accID + '', false],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not a string'
    }, {
        accIDs: [accData.accID + '', {}],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not a string'
    }, {
        accIDs: [accData.accID + '', []],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not a string'
    }, {
        accIDs: [accData.accID + '', 1234],
        expected: 'MEMBERNOTEXISTING',
        msg: 'one accID not a string'
    }, {
        accIDs: accData.accID + '',
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs:  '',
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs: '1234',
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs: null,
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs: {},
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs: 1234,
        expected: 'MEMBERNOTEXISTING',
        msg: 'accIDs is not an array'
    }, {
        accIDs: [],
        expected: 'MEMBERNOTEXISTING',
        msg: 'no valid accID'
    }];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/getkeys`, options);
            const data = await response.json();
            
            assert(!data.valid);
            return assert.strictEqual(data.reason, body.expected);
        });
    });

    await Promise.all(tests);
});
