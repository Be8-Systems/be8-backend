import Express from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import cors from 'cors';
import ngrok from 'ngrok';
import newAccRoute from './lib/routes/accs/newAcc.mjs';
import getThreadsRoute from './lib/routes/conversations/getThreads.mjs';
import getMessagesRoute from './lib/routes/conversations/getMessages.mjs';
import writeMessageRoute from './lib/routes/conversations/writeMessage.mjs';
import destroyAccRoute from './lib/routes/accs/destroyAcc.mjs';
import changeNicknameRoute from './lib/routes/accs/changeNickname.mjs';
import statusSet from './lib/routes/accs/statusSet.mjs';
import startConversationRoute from './lib/routes/conversations/startConversation.mjs';
import meRoute from './lib/routes/accs/me.mjs';
import setKeyRoute from './lib/routes/keys/setKey.mjs';
import getKeyRoute from './lib/routes/keys/getKey.mjs';
import getKeysRoute from './lib/routes/keys/getKeys.mjs';
import insightsRoute from './lib/routes/utilities/insights.mjs';
import inviteLinkRoute from './lib/routes/inviteLink/inviteLink.mjs';
import groupJoinMember from './lib/routes/groups/groupJoinMember.mjs';
import groupLeaveMember from './lib/routes/groups/groupLeaveMember.mjs';
import groupCreateRoute from './lib/routes/groups/groupCreate.mjs';
import groupAddMemberRoute from './lib/routes/groups/groupAddMember.mjs';
import groupGetMembersRoute from './lib/routes/groups/groupGetMembers.mjs';
import groupStoreKeyRoute from './lib/routes/groups/groupStoreKey.mjs';
import groupGetKeysRoute from './lib/routes/groups/groupGetKeys.mjs';
import groupIncreaseVersion from './lib/routes/groups/groupIncreaseVersion.mjs';
import groupGetCurrentVersionRoute from './lib/routes/groups/groupGetCurrentVersion.mjs';
import groupDestroyGroupRoute from './lib/routes/groups/groupDestroyGroup.mjs';
import groupKickMemberRoute from './lib/routes/groups/groupKickMember.mjs';
import groupTriggerSSEUpdateRoute from './lib/routes/groups/groupTriggerSSEUpdate.mjs';
import imageUploadRoute from './lib/routes/media/imageUpload.mjs';
import imageGetRoute from './lib/routes/media/imageGet.mjs';
import codeHas from './lib/routes/code/codeHas.mjs';
import codeSet from './lib/routes/code/codeSet.mjs';
import codeUnlock from './lib/routes/code/codeUnlock.mjs';
import codeUpdate from './lib/routes/code/codeUpdate.mjs';
import endlessValidate from './lib/routes/token/endlessValidate.mjs';
import { eventSocket } from './lib/sockets/event.mjs';
import startListenEncrypted from './lib/util/startListenEncrypted.mjs';
import innerRedisStore from 'connect-redis6';
import globals from './lib/data/globals.mjs';
import redis from './lib/util/redis.mjs';
import subscribe from './lib/routes/utilities/subscribe.mjs';
import insightsScheduler from './lib/util/insightsScheduler.mjs';

const isTunnel = process.env.NODE_ENV === 'tunnel';
const args = process.argv.slice(2);
const isFrontend = args.shift() === '--frontend';
const PORT = 3000;
const app = Express();
const redisStore = innerRedisStore(session);
const isProduction = process.env.NODE_ENV === 'production';

function startNgrok() {
    return ngrok
        .connect({
            authtoken: '1XvR9cNRX6yWAgzZl9fUOrB9fBd_5NYMs7AcDfcEyhZ5FmX6n',
            proto: 'http',
            addr: PORT,
            subdomain: 'be8',
            region: 'eu',
            binPath: path => path.replace('app.asar', 'app.asar.unpacked'),
            onStatusChange: console.log,
            onLogEvent: console.log,
        })
        .then(console.log);
}

export default function start({ fakeTokens = [], staticFiles = './node_modules/be8-frontend/dist/' }) {
    app.disable('x-powered-by');
    app.use(cors());
    app.use(
        bodyParser.json({
            limit: '5mb',
            type: 'application/json',
        })
    );
    app.use(
        bodyParser.urlencoded({
            limit: '5mb',
            extended: true,
            parameterLimit: 5,
        })
    );
    app.use(
        session({
            store: new redisStore({ client: redis, disableTTL: true }),
            secret: globals.secret,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: globals.hundredYears,
                expires: new Date(Date.now() + globals.hundredYears),
                secure: isProduction,
                sameSite: 'strict'
            },
        })
    );
    app.use(compression());
    app.use('/', Express.static(staticFiles));
    app.use('/', Express.static(`${staticFiles}prod`));

    newAccRoute(app);
    getThreadsRoute(app);
    meRoute(app);
    startConversationRoute(app);
    insightsRoute(app);
    inviteLinkRoute(app);
    getMessagesRoute(app);
    writeMessageRoute(app);
    eventSocket(app);
    destroyAccRoute(app);
    setKeyRoute(app);
    getKeyRoute(app);
    getKeysRoute(app);
    changeNicknameRoute(app);
    statusSet(app);
    subscribe(app);
    groupJoinMember(app);
    groupLeaveMember(app);
    groupCreateRoute(app);
    groupAddMemberRoute(app);
    groupGetMembersRoute(app);
    groupStoreKeyRoute(app);
    groupGetKeysRoute(app);
    groupIncreaseVersion(app);
    groupGetCurrentVersionRoute(app);
    groupDestroyGroupRoute(app);
    groupKickMemberRoute(app);
    groupTriggerSSEUpdateRoute(app);
    imageUploadRoute(app, staticFiles);
    imageGetRoute(app, staticFiles);
    codeHas(app);
    codeSet(app);
    codeUnlock(app);
    codeUpdate(app);
    endlessValidate(app);
    insightsScheduler();

    if (fakeTokens.length > 0) {
        const proms = fakeTokens.map(function ({ token, type, validTime }) {
            const basic = { active: false, type };
            const options = validTime ? { ...basic, validTime } : basic;

            redis.hSet(`token:${token}`, options);
        });

        Promise.all(proms).then(() => {});
    }
    if (isProduction) {
        startListenEncrypted(app);
    } else {
        app.listen(PORT, () => {});

        if (isTunnel) {
            startNgrok();
        }
    }
}
