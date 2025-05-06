import Ajax from '@modules/ajax';
import ChatsPanelComponent from '@components/MessengerComponent/ChatsPanelComponent';
import ChatWindowComponent from '@components/MessengerComponent/ChatWindowComponent';
import createElement from '@utils/createElement';
import router from '@router';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';


export default class MessengerComponent {
    private parent: MainLayoutComponent;
    private config: Record<string, any>;

    constructor(parent: MainLayoutComponent, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        const messengerWrapper = createElement({
            parent: this.parent.container,
            classes: ['messenger'],
        });
        
        const chatsPanel = new ChatsPanelComponent(messengerWrapper, {
            user: this.config.user,
            messenger: this,
            chat_id: this.config?.chat_id,
        });
        const chatWindow = new ChatWindowComponent(messengerWrapper, {
            user: this.config.user,
            receiver_username: this.config?.receiver_username,
            chat_id: this.config?.chat_id,
            messenger: this
        });

        chatsPanel.chatWindow = chatWindow;
        chatWindow.chatsPanel = chatsPanel;
    }

    ajaxGetMessages(params: Record<string, any>, cb: any) {
        Ajax.get({
            url: `/chats/${params.chatId}/messages`,
            params: {
                messages_count: params.count,
                ...(params?.ts && { ts: params.ts })
            },
            callback: (status: number, chatMsgs: any) => {
                this.ajaxCallbackAuth(status);
                cb(status, chatMsgs);
            }
        });
    }

    ajaxGetChats(cb: any) {
        Ajax.get({
            url: '/chats',
            params: { chats_count: 10 },
            callback: (status: number, chatsData: any) => {
                this.ajaxCallbackAuth(status);
                cb(status, chatsData);
            }
        });
    }

    ajaxPostMessages(params: Record<string, any>, cb: any) {
        Ajax.post({
            url: `/messages/${params.username}`,
            body: params.request,
            callback: (status: number, msgData: any) => {
                this.ajaxCallbackAuth(status);
                cb(status, msgData);
            }
        });
    }

    ajaxCallbackAuth(status: number) {
        status === 401 ? router.go({ path: '/login' }) : null;
    }
}
