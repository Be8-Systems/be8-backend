import webpush from 'web-push';
import redis from '../util/redis.mjs';

webpush.setVapidDetails(
    'mailto:be8systems@gmail.com',
    'BGcpbQEQRF2Ans4lXwnyqd9EnWT2MgNx9j-ns5EoXDtmQZonB1TqGpBuJlw32gqvbHGTZQgh79mYYjp6dX-8zOg',
    'phkdWljf3T9ufJTL30nwg-uSsHKUO9AnQXaf-ayzzgc'
);

export default async function notify(accID, nickname, sender) {
    const devices = await redis.sMembers(`devices:${accID}`);

    devices.forEach(function (deviceKeys) {
        const keys = JSON.parse(deviceKeys);

        return webpush
            .sendNotification(keys, JSON.stringify({ action: 'newMessage', nickname, sender }))
            .then(function () {
                console.log('Notification sents');
            })
            .catch(console.error);
    });
}
