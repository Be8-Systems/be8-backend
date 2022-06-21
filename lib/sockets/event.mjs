const clients = new Map();

export function updateClient (accID, update) {
    const devices = clients.get(accID) || [];

    devices.forEach(function (device) {
        device.res.write(`data: ${JSON.stringify(update)}\n\n`);
        device.res.flush();
    });
}

export function eventSocket (app) {
    function eventsHandler (req, res) {
        const accID = req.session.accID + '';
        const clientId = Date.now();
        const newClient = Object.freeze({
            clientId,
            res
        });
        const devices = clients.get(accID);

        if (!req.session.accID) {
            return res.status(401).send({ error: 'NOTAUTH' });
        }
        if (!devices) {
            clients.set(accID, [newClient]);
        } else {
            devices.push(newClient);
            clients.set(accID, devices);
        }
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*',
            'X-Accel-Buffering': 'no'
        });
        req.on('close', function () {
            let devices =  clients.get(accID);

            console.log(`${clientId} Connection closed`);
            devices = devices.filter(d => d.clientId !== clientId);

            clients.set(accID, devices);
        });
    }

    app.get('/events', eventsHandler);
}