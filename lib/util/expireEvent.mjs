import deleteAcc from './deleteAcc.mjs';

export default function (client) {
    const pubSubClient = client.duplicate();

    pubSubClient.connect().then(function () {
        pubSubClient.configSet('notify-keyspace-events', 'KEA');
        pubSubClient.pSubscribe('__keyevent@0__:expired', function (key) {
            if (key.includes('acc')) {
                const accID = key.split(':').pop();
                return deleteAcc(accID);
            }
        });
    });

    return pubSubClient;
}
