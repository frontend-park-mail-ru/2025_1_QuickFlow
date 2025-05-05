const RECONNECTION_TIMEOUT = 10 * 1000;


class WebSocketService {
    baseUrl: string;
    socket: any = null;
    subscribers: any = {};
    constructor(path = '/api/ws') {
        this.baseUrl = this.#detectWebSocketUrl(path);

        this.#connect();
    }

    #detectWebSocketUrl(path: string) {
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const protocol = isLocalhost ? 'ws://' : 'wss://';
        const host = isLocalhost ? window.location.host : "quickflowapp.ru";
        return `${protocol}${host}${path}`;
    }

    #connect() {
        this.socket = new WebSocket(this.baseUrl);

        this.socket.addEventListener('open', () => {});

        this.socket.addEventListener('message', (event: any) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                this.#notifySubscribers(type, payload);
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', event.data);
            }
        });

        this.socket.addEventListener('close', () => {
            console.warn('[WebSocket] Connection closed. Reconnecting...');
            setTimeout(() => this.#connect(), RECONNECTION_TIMEOUT);
        });

        this.socket.addEventListener('error', (error: any) => {
            console.error('[WebSocket] Error:', error);
        });
    }

    #notifySubscribers(type: any, payload: any) {
        const callbacks = this.subscribers[type] || [];
        callbacks.forEach((callback: any) => callback(payload));
    }

    send(type: any, payload = {}) {
        const message = JSON.stringify({ type, payload });
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            // При необходимости: очередь сообщений до восстановления соединения
            console.warn('[WebSocket] Message not sent, socket not open:', message);
        }
    }

    subscribe(type: any, callback: any) {
        if (!this.subscribers[type]) {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(callback);
    }

    unsubscribe(type: any, callback: any) {
        if (!this.subscribers[type]) return;
        this.subscribers[type] = this.subscribers[type].filter((cb: any) => cb !== callback);
    }

    close() {
        this.socket?.close();
    }
}

export default new WebSocketService();
