import test from 'node:test';
import assert from 'assert/strict';
import { baseUrl, newAccOptions } from '../../utils/utils.mjs';

const options = newAccOptions();

test('SUCCESS newAcc', async function () {
    const response = await fetch(`${baseUrl}/newAcc`, options);
    const data = await response.json();
    
    assert(data.valid);
    return assert.strictEqual(typeof data.accID, 'number');
});
