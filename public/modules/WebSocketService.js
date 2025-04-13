const RECONNECTION_TIMEOUT = 10 * 1000;


class WebSocketService {
    constructor(path = '/api/ws') {
        this.baseUrl = this.#detectWebSocketUrl(path);
        this.socket = null;
        this.subscribers = {};
        this.#connect();
    }

    #detectWebSocketUrl(path) {
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const protocol = isLocalhost ? 'ws://' : 'wss://';
        const host = isLocalhost ? window.location.host : "www.quickflowapp.ru";
        return `${protocol}${host}${path}`;
    }

    #connect() {
        this.socket = new WebSocket(this.baseUrl);

        this.socket.addEventListener('open', () => {
            console.log('[WebSocket] Connected');
        });

        this.socket.addEventListener('message', (event) => {
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

        this.socket.addEventListener('error', (error) => {
            console.error('[WebSocket] Error:', error);
        });
    }

    #notifySubscribers(type, payload) {
        const callbacks = this.subscribers[type] || [];
        callbacks.forEach(callback => callback(payload));
    }

    send(type, payload = {}) {
        const message = JSON.stringify({ type, payload });
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            // При необходимости: очередь сообщений до восстановления соединения
            console.warn('[WebSocket] Message not sent, socket not open:', message);
        }
    }

    subscribe(type, callback) {
        if (!this.subscribers[type]) {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(callback);
    }

    unsubscribe(type, callback) {
        if (!this.subscribers[type]) return;
        this.subscribers[type] = this.subscribers[type].filter(cb => cb !== callback);
    }

    close() {
        this.socket?.close();
    }
}

export default new WebSocketService();
