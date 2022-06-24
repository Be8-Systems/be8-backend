import test from 'node:test';
import assert from 'assert/strict';
import nodeFetch from 'node-fetch';
import { baseUrl, newAccOptions, getPostOptions } from '../../utils/utils.mjs';
import randomString from '../../utils/randomString.mjs';
import redis from '../../../lib/util/redis.mjs';

const nickname = randomString(10);
const accOptions = newAccOptions(nickname);

test('SUCCESS pushnotifications', async function () {
    const accResponse = await nodeFetch(`${baseUrl}/newAcc`, accOptions);
    const accData = await accResponse.json();
    const cookie = accResponse.headers.get('set-cookie');
    const notificationBody = {
        endpoint:
            'https://fcm.googleapis.com/fcm/send/cOq4sGoWZQI:APA91bEWnQ-5W0yB2E58bdf_pVVKvxn3cB4k3GkG2H0R2BQ2RgKYOY7AmO53OmAICU7wacRjWQZ02EeGZVNeO31hWcRD-QYFXHBVaVKvVGWdOj13XtQd3zx_erl5rOo4pmt7hkq3LQP7',
        expirationTime: null,
        keys: {
            p256dh: 'BJ5iO_p2tZ7b-t60jz_ax6msZ_rlhySfz_y7lXGvOgb8gGXeLuYJ5lwssbc5iZhlnd9NBEO_4-E9M9BRxiJskek',
            auth: 'eKOsJ8KlLI6OAWzNmn6Dow',
        },
    };
    const notificationOptions = getPostOptions(notificationBody, cookie);
    const response = await nodeFetch(`${baseUrl}/subscribe`, notificationOptions);
    const data = await response.json();
    const notifications = await redis.SMEMBERS(`devices:${accData.accID}`);

    await redis.disconnect();
    assert.strictEqual(notifications.length, 1);
    assert(data.subscribe);
    return assert(data.valid);
});
