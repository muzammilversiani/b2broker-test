const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

const PORT = 8080;

jest.setTimeout(25*1000);

describe('socket module', () => {

    let clientSocket: any;
    const MOCK_HEARTBEAT = {
        type: "Heartbeat"
    };
    type HeartbeatResponse = {
        type: string,
        updatedAt?: number
    }

    const MOCK_SUBSCRIBE = {
        type: "Subscribe",
        status: "Subscribed"
    }
    type SubscribeResponse = {
        type: string,
        status: string,
        updatedAt?: number
    }

    const MOCK_UNSUBSCRIBE = {
        type: "Unsubscribe",
        status: "Unsubscribed"
    }
    type UnsubscribeResponse = {
        type: string,
        status: string,
        updatedAt?: number
    }

    const MOCK_COUNT_SUBSCRIBER = {
        type: "CountSubscribers"
    }
    type CountSubscriberResponse = {
        type: string,
        count?: number,
        updatedAt?: number
    }

    const MOCK_ERROR_METHOD = {
        type: "Error",
        error: "Requested method not implemented"
    }
    const MOCK_ERROR_JSON = {
        type: "Error",
        error: "Bad formatted payload, non JSON"
    }
    type ErrorResponse = {
        type: string,
        error?: string,
        updatedAt?: number
    }
    
    beforeEach((done) => {
        clientSocket = new Client(`http://localhost:${PORT}`);
        clientSocket.on("connect", done);
    });
    
    afterEach(() => {
        clientSocket.close();
    });
    
    test("should work (heartbeat)", (done) => {

        /**
         * Test heartbeat Event
         */
        clientSocket.on("heartbeat", (payload: any) => {
            expect(payload).toMatchObject<HeartbeatResponse>(MOCK_HEARTBEAT);
            expect(payload.type).toBe(MOCK_HEARTBEAT.type);
            done();
        });
    });
    
    test("should work (message <> Subscribe)", (done) => {

        clientSocket.emit('message', JSON.stringify({ type: 'Subscribe' }));
        clientSocket.on("message", (payload: any) => {
            console.log(payload)
            expect(payload).toMatchObject<SubscribeResponse>(MOCK_SUBSCRIBE);
            expect(payload.type).toBe(MOCK_SUBSCRIBE.type);
            expect(payload.status).toBe(MOCK_SUBSCRIBE.status);
            done();
        });
    });
    
    test("should work (message <> Unsubscribe)", (done) => {

        clientSocket.emit('message', JSON.stringify({ type: 'Unsubscribe' }));
        clientSocket.on("message", (payload: any) => {
            expect(payload).toMatchObject<UnsubscribeResponse>(MOCK_UNSUBSCRIBE);
            expect(payload.type).toBe(MOCK_UNSUBSCRIBE.type);
            expect(payload.status).toBe(MOCK_UNSUBSCRIBE.status);
            done();
        });
    });
    
    test("should work (message <> CountSubscribers)", (done) => {

        clientSocket.emit('message', JSON.stringify({ type: 'CountSubscribers' }));
        clientSocket.on("message", (payload: any) => {
            expect(payload).toMatchObject<CountSubscriberResponse>(MOCK_COUNT_SUBSCRIBER);
            expect(payload.type).toBe(MOCK_COUNT_SUBSCRIBER.type);
            done();
        });
    });
    
    test("should work (error <> Method not implemented)", (done) => {

        clientSocket.emit('message', JSON.stringify({ type: 'CountSubscriber' }));
        clientSocket.on("error", (payload: any) => {
            expect(payload).toMatchObject<ErrorResponse>(MOCK_ERROR_METHOD);
            expect(payload.type).toBe(MOCK_ERROR_METHOD.type);
            expect(payload.error).toBe(MOCK_ERROR_METHOD.error);
            done();
        });
    });
});