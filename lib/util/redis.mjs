import redis from 'redis';

const creds = { password: '0specialcatsbeards1337' };
const client = redis.createClient(creds);

client.connect().then(function () {
    client.on('warning', console.log);
    client.on('error', console.log);
});

export default client;
