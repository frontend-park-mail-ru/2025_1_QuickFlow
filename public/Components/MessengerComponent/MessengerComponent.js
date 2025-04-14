import Ajax from '../../modules/ajax.js';
import ChatsPanelComponent from './ChatsPanelComponent.js';
import ChatWindowComponent from './ChatWindowComponent.js';
import createElement from '../../utils/createElement.js';
import router from '../../Router.js';


export default class MessengerComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;

        this.render();
    }

    render() {
        const messengerWrapper = createElement({
            parent: this.#parent.container,
            classes: ['messenger'],
        });

        console.log(this.#config.chat_id);
        console.log(this.#config.receiver_username);
        
        const chatsPanel = new ChatsPanelComponent(messengerWrapper, {
            user: this.#config.user,
            messenger: this,
            chat_id: this.#config?.chat_id,
        });
        const chatWindow = new ChatWindowComponent(messengerWrapper, {
            user: this.#config.user,
            receiver_username: this.#config?.receiver_username,
            chat_id: this.#config?.chat_id,
            messenger: this
        });

        chatsPanel.chatWindow = chatWindow;
        chatWindow.chatsPanel = chatsPanel;
    }

    ajaxGetMessages(params, cb) {
        Ajax.get({
            url: `/chats/${params.chatId}/messages`,
            params: {
                messages_count: params.count,
                ...(params?.ts && { ts: params.ts })
            },
            callback: (status, chatMsgs) => {
                this.ajaxCallbackAuth(status);
                cb(status, chatMsgs);
            }
        });
    }

    ajaxGetChats(cb) {
        Ajax.get({
            url: '/chats',
            params: { chats_count: 10 },
            callback: (status, chatsData) => {
                this.ajaxCallbackAuth(status);
                cb(status, chatsData);
            }
        });
    }

    ajaxPostMessages(params, cb) {
        Ajax.post({
            url: `/messages/${params.username}`,
            body: params.request,
            callback: (status, msgData) => {
                this.ajaxCallbackAuth(status);
                cb(status, msgData);
            }
        });
    }

    ajaxCallbackAuth(status) {
        status === 401 ? router.go({ path: '/login' }) : null;
    }
}
