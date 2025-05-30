const RECONNECTION_TIMEOUT = 10 * 1000;


class WebSocketService {
    baseUrl: string;
    socket: WebSocket = null;
    subscribers: Record<string, any> = {};

    static __instance: WebSocketService = null;
    
    constructor(path = '/api/ws') {
        if (WebSocketService.__instance) {
            return WebSocketService.__instance;
        }

        this.baseUrl = this.detectWebSocketUrl(path);
        this.connect();

        WebSocketService.__instance = this;
    }

    private detectWebSocketUrl(path: string) {
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        const protocol = isLocalhost ? 'ws://' : 'wss://';
        const host = isLocalhost ? window.location.host : "quickflowapp.ru";
        return `${protocol}${host}${path}`;
    }

    private connect() {
        this.socket = new WebSocket(this.baseUrl);

        this.socket.addEventListener('open', () => {});

        this.socket.addEventListener('message', (event: any) => {
            try {
                const { type, payload } = JSON.parse(event.data);
                this.notifySubscribers(type, payload);
            } catch (error) {
                console.error('[WebSocket] Failed to parse message:', event.data);
            }
        });

        this.socket.addEventListener('close', () => {
            if (WebSocketService.__instance) {
                console.warn('[WebSocket] Connection closed. Reconnecting...');
                setTimeout(() => this.connect(), RECONNECTION_TIMEOUT);
            }
        });

        this.socket.addEventListener('error', (error: any) => {
            console.error('[WebSocket] Error:', error);
        });
    }

    private notifySubscribers(type: string, payload: Record<string, any>) {
        const callbacks = this.subscribers[type] || [];
        callbacks.forEach((callback: any) => callback(payload));
    }

    send(type: string, payload: Record<string, any> = {}) {
        const message = JSON.stringify({ type, payload });
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            // При необходимости: очередь сообщений до восстановления соединения
            console.warn('[WebSocket] Message not sent, socket not open:', message);
        }
    }

    subscribe(type: string, callback: any) {
        if (!this.subscribers[type]) {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(callback);
    }

    unsubscribe(type: string, callback: any) {
        if (!this.subscribers[type]) return;
        this.subscribers[type] = this.subscribers[type].filter((cb: any) => cb !== callback);
    }

    close() {
        this.socket?.close();
        WebSocketService.__instance = null;
    }
}

export default WebSocketService;
