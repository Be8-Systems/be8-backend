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

test('SUCCESS getKeys', async function () {
    // new acc
    const accResponse = await nodeFetch(`${baseUrl()}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    // setKey
    const setKeyBody = {
        publicKey: publicKeyToStore,
    };
    const setKeyOptions = getPostOptions(setKeyBody, cookie);
    const response = await nodeFetch(`${baseUrl()}/setkey`, setKeyOptions);
    // getKey
    const accIDs = [accData.accID + ''];
    const getKeysBody = {
        accIDs,
    };
    const getKeysOptions = getPostOptions(getKeysBody, cookie);
    const getResponse = await nodeFetch(`${baseUrl()}/getkeys`, getKeysOptions);
    const data = await getResponse.json();

    data.publicKeys.forEach(function ({ accID, publicKey }, i) {
        assert.strictEqual(accIDs[i], accID);
        assert.strictEqual(typeof publicKey, 'object');
        assert.strictEqual(publicKey.crv, publicKeyToStore.crv);
        assert.strictEqual(publicKey.ext, publicKeyToStore.ext + '');
        assert.strictEqual(publicKey.kty, publicKeyToStore.kty);
        assert.strictEqual(publicKey.x, publicKeyToStore.x);
        assert.strictEqual(publicKey.y, publicKeyToStore.y);
        assert(publicKey.key_ops.includes('deriveKey'));
        assert(publicKey.key_ops.includes('deriveBits'));
    });

    return assert(data.valid);
});
