import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import { DESTRUCTION } from 'dns';

const accOptions = newAccOptions();

test('SUCCESS insightsUntil', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const cookie = accResponse.headers.get('set-cookie');
    const body = {
        start: '2022-07-01',
        end: '2022-07-28',
    };
    const insightOptions = getPostOptions(body, cookie);
    const response = await nodeFetch(`${baseUrl}/insightsuntil`, insightOptions);
    const { valid, insights } = await response.json();

    insights.forEach(function ({ insights, date }) {
        const parsedDate = new Date(date);

        assert.strictEqual(typeof parsedDate, 'object');
        assert.notStrictEqual(parsedDate.toString(), 'Invalid Date');
        assert.strictEqual(typeof insights, 'object');

        if (insights.accs) {
            assert.strictEqual(typeof parseInt(insights.accs), 'number');
            assert.notStrictEqual(parseInt(insights.accs).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.groups), 'number');
            assert.notStrictEqual(parseInt(insights.groups).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.threads), 'number');
            assert.notStrictEqual(parseInt(insights.threads).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.messages), 'number');
            assert.notStrictEqual(parseInt(insights.messages).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.sentInviteLinks), 'number');
            assert.notStrictEqual(parseInt(insights.sentInviteLinks).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.usedInviteLinks), 'number');
            assert.notStrictEqual(parseInt(insights.usedInviteLinks).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.sentGrouInviteLinks), 'number');
            assert.notStrictEqual(parseInt(insights.sentGrouInviteLinks).toString(), 'NaN');
            assert.strictEqual(typeof parseInt(insights.usedGroupInviteLinks), 'number');
            assert.notStrictEqual(parseInt(insights.usedGroupInviteLinks).toString(), 'NaN');
        }
    });

    return assert(valid);
});
