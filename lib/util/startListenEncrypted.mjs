import greenlockExpress from 'greenlock-express';
import greenlock from '@root/greenlock';
import path from 'path';

const __filename = new URL('.', import.meta.url).pathname;

function notify(ev, args) {
    if (ev === 'error' || ev === 'warning') {
        console.error(args);
    }

    console.log(ev, args);
}

export default function startListenEncrypted(app) {
    greenlockExpress
        .init(function () {
            return {
                greenlock: greenlock.create({
                    packageAgent: 'be8/0.0.1',
                    maintainerEmail: 'be8systems@gmail.com',
                    configDir: path.resolve('./greenlock.d'),
                    packageRoot: path.resolve(`${path.dirname(__filename)}/../`),
                    notify,
                }),
            };
        })
        .serve(function (glx) {
            glx.serveApp(app);
        });
}
