import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';
import redis from '../../../lib/util/redis.mjs';

const accOptions = newAccOptions();
const token = randomString(32);
const hundredYears = 3153600000; // in seconds

test('SUCCESS endlessValidate', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    await redis.hSet(`token:${token}`, { active: false, type: 'endless' });
    const codeBody = {
        unlockCode: randomString(9),
        destroyCode: randomString(9),
    };
    const codeSetOptions = getPostOptions(codeBody, cookie);
    await nodeFetch(`${baseUrl}/codeset`, codeSetOptions);
    const endlessBody = {
        token,
    };
    const endlessOptions = getPostOptions(endlessBody, cookie);
    const response = await nodeFetch(`${baseUrl}/endlessvalidate`, endlessOptions);
    const data = await response.json();
    const accExpiring = await redis.ttl(`acc:${accData.accID}`);
    const codesExpiring = await redis.ttl(`codes:${accData.accID}`);

    await redis.disconnect();
    assert.strictEqual(accExpiring, hundredYears);
    assert.strictEqual(codesExpiring, hundredYears);
    assert(data.validate);
    return assert(data.valid);
});
