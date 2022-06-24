import test from 'node:test';
import assert from 'assert/strict';
import { baseUrl } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';

const options = {
    method: 'POST',
    body: JSON.stringify({
        password: randomString(5200000), // max length for body parser
        nickname: randomString(10),
    }),
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
};

test('FAIL newAcc', async function () {
    const response = await fetch(`${baseUrl()}/newAcc`, options);
    const data = await response.json();
    
    assert.strictEqual(data.valid, false);
    return assert.strictEqual(data.warning, 'PASSWORDFAILURE');
});