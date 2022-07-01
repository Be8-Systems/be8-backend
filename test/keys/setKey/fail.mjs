import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';

const accOptions = newAccOptions();
const validKey = {
    crv: 'P-256',
    ext: true,
    key_ops: [],
    kty: 'EC',
    x: 'uNW5zLRC7-XKRu2JEatPdrKAuJPCf0lKTF3NBmdSghw',
    y: '83RxcSiQJelZ9QQeBKjSLXPcCOZAJizUFazgoSPPS-U',
};

test('SUCCESS setKey', async function (context) {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    // fail setKey
    const failBodies = [{
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey parameter is missing'
    }, {
        publicKey: {},
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey object is empty'
    }, {
        publicKey: 'dfd',
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey is not an object'
    }, {
        publicKey: [],
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey is not an object'
    }, {
        publicKey: null,
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey is not an object'
    }, {
        publicKey: 1234,
        expected: 'INVALIDPUBLICKEY',
        msg: 'publicKey is not an object'
    }, {
        publicKey: {
            ...validKey,
            crv: 'P-1234'
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is invalid'
    }, {
        publicKey: {
            ...validKey,
            crv: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is invalid'
    }, {
        publicKey: {
            ...validKey,
            crv: null
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is not a string'
    }, {
        publicKey: {
            ...validKey,
            crv: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is not a string'
    }, {
        publicKey: {
            ...validKey,
            crv: []
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is not a string'
    }, {
        publicKey: {
            ...validKey,
            crv: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'crv is not a string'
    }, {
        publicKey: {
            ...validKey,
            ext: false
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'ext is invalid'
    }, {
        publicKey: {
            ...validKey,
            ext: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'ext is invalid'
    }, {
        publicKey: {
            ...validKey,
            ext: [] 
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'ext is invalid'
    }, {
        publicKey: {
            ...validKey,
            ext: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'ext is invalid'
    }, {
        publicKey: {
            ...validKey,
            ext: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'ext is invalid'
    }, {
        publicKey: {
            ...validKey,
            key_ops: false
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'key_ops is invalid'
    }, {
        publicKey: {
            ...validKey,
            key_ops: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'key_ops is invalid'
    }, {
        publicKey: {
            ...validKey,
            key_ops: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'key_ops is invalid'
    }, {
        publicKey: {
            ...validKey,
            key_ops: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'key_ops is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: 'ECT'
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: null
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: []
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            kty: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'kty is invalid'
    }, {
        publicKey: {
            ...validKey,
            x: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'x is invalid'
    }, {
        publicKey: {
            ...validKey,
            x: false
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'x is invalid'
    }, {
        publicKey: {
            ...validKey,
            x: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'x is invalid'
    }, {
        publicKey: {
            ...validKey,
            x: []
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'x is invalid'
    }, {
        publicKey: {
            ...validKey,
            x: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'x is invalid'
    }, {
        publicKey: {
            ...validKey,
            y: ''
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'y is invalid'
    }, {
        publicKey: {
            ...validKey,
            y: true
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'y is invalid'
    }, {
        publicKey: {
            ...validKey,
            y: []
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'y is invalid'
    }, {
        publicKey: {
            ...validKey,
            y: {}
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'y is invalid'
    }, {
        publicKey: {
            ...validKey,
            y: 1234
        },
        expected: 'INVALIDPUBLICKEY',
        msg: 'y is invalid'
    }];
    const tests = failBodies.map(async function (body) {
        await context.test(body.msg, async () => {
            const options = getPostOptions(body, cookie);
            const response = await nodeFetch(`${baseUrl}/setkey`, options);
            const data = await response.json();
            
            return assert.strictEqual(data.error, body.expected);
        });
    });

    await Promise.all(tests);
});
