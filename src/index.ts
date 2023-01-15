import express from 'express';
const app = express();
import http from 'http';
const server = http.createServer(app);
import { Server } from 'socket.io';

const PORT = 8080;

/**
 * Start Socket Server
 */
const io = new Server(server);

/**
 * Array to hold subscriptions
 */
var subscriptions: Array<{ id: string, timestamp: number }> = [];

/**
 * Socket Listener: when a client connects
 */
io.on('connection', (socket) => {

    console.log('connected');

    /**
     * Handle client message
     */
    socket.on('message', (payload) => {
        
        if( isValidJSON(payload) ) {

            const data = JSON.parse(payload);

            switch (data.type) {

                /**
                 * Handle the "Subscribe" method
                 */
                case "Subscribe":
                    // Add client to the subscriptions array
                    subscriptions.push({
                        id: socket.id,
                        timestamp: new Date().getTime()
                    });

                    // Emit the response back to the client after 4 seconds
                    setTimeout(() => {
                        socket.emit('message', {
                            "type": 'Subscribe',
                            "status": 'Subscribed',
                            "updatedAt": new Date().getTime()
                        });
                    }, 4000);

                    break;

                /**
                 * Handle the "Unsubscribe" method
                 */
                case "Unsubscribe":
                    // Remove client from the subscriptions array
                    subscriptions = subscriptions.filter((sub: any) => sub.id != socket.id);

                    // Emit the response back to the client after 8 seconds
                    setTimeout(() => {
                        socket.emit('message', {
                            "type": 'Unsubscribe',
                            "status": 'Unsubscribed',
                            "updatedAt": new Date().getTime()
                        });
                    }, 8000);

                    break;

                /**
                 * Handle the "CountSubscribers" method
                 */
                case "CountSubscribers":
                    socket.emit('message', {
                        "type": 'CountSubscribers',
                        "count": subscriptions.length,
                        "updatedAt": new Date().getTime()
                    });

                    break;

                default:
                    socket.emit('error', {
                        "type": 'Error',
                        "error": 'Requested method not implemented',
                        "updatedAt": new Date().getTime()
                    });

            }

        } else {

            // Not a valid JSON
            socket.emit('error', {
                "type": 'Error',
                "error": 'Bad formatted payload, non JSON',
                "updatedAt": new Date().getTime()
            });

        }

    });

    
    /**
     * Emit Heartbeat after every "1" second
     */
    setInterval(() => {
        socket.emit('heartbeat', {
            "type": 'Heartbeat',
            "updatedAt": new Date().getTime()
        });
    }, 1000);

});

/**
 * HTTP Routes
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

/**
 * Start HTTP Server
 */
server.listen(PORT, () => {
    console.log('HTTP Server listening on port ' + PORT);
});

/**
 * Helper function
 */
function isValidJSON(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}