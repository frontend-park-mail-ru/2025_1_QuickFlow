import ChatsPanelComponent from '@components/Messenger/ChatsPanelComponent';
import ChatWindowComponent from '@components/Messenger/ChatWindowComponent';
import createElement from '@utils/createElement';
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
            // user: this.config.user,
            // messenger: this,
            chat_id: this.config?.chat_id,
        });
        
        const chatWindow = new ChatWindowComponent(messengerWrapper, {
            // user: this.config.user,
            receiver_username: this.config?.receiver_username,
            chat_id: this.config?.chat_id,
            // messenger: this
        });

        chatsPanel.chatWindow = chatWindow;
        chatWindow.chatsPanel = chatsPanel;
    }
}
