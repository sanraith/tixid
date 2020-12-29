#!/usr/bin/env node

import * as appInsights from 'applicationinsights';
const appInsightsKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY;
if (appInsightsKey) {
    appInsights.setup(appInsightsKey).start();
}

import expressServer from './server';
import http from 'http';
import Debug from 'debug';
import socketManager from './services/socketManager';
if (!Debug.enabled) {
    //   Debug.enable('*:ERROR'); // always print errors
    Debug.enable('tixid:*'); // always print errors
}
const debug = Debug('tixid:start');

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
expressServer.set('port', port);

/**
 * Create HTTP server.
 */
const httpServer = http.createServer(expressServer);

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(port);
httpServer.on('error', onError);
httpServer.on('listening', onListening);
socketManager.init(httpServer);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: any) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    const addr = httpServer.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr?.port;
    console.log('Listening on ' + bind);
}
