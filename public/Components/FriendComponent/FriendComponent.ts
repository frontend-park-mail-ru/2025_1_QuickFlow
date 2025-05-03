import createElement from '@utils/createElement';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import insertIcon from '@utils/insertIcon';
import API from '@utils/api';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';


export default class FriendComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;

        this.render();
    }

    render() {        
        const friend = createElement({
            parent: this.parent,
            classes: ['friend'],
        });

        new AvatarComponent(friend, {
            size: 'l',
            src: this.config.data.avatar_url,
        });

        const friendRight = createElement({
            parent: friend,
            classes: ['friend__right'],
        });

        const friendInfo = createElement({
            parent: friendRight,
            classes: ['friend__info'],
        });

        createElement({
            parent: friendInfo,
            classes: ['friend__name'],
            text: `${this.config.data.firstname} ${this.config.data.lastname}`,
        });

        const action = createElement({
            parent: friendInfo,
            classes: ['friend__action'],
        });

        this.renderMsgAction(action, this.config.data.username);
        this.renderDropdown(friend, this.config.data);
    }

    private renderDeletedFriend(friend: HTMLElement, friendData: Record<string, any>) {
        const action: HTMLElement = friend.querySelector('.friend__action');
        const dropdown = friend.querySelector('.js-dropdown');

        this.renderUndoAction(action, friendData);
        dropdown.remove();
    }

    private renderMsgAction(parent: HTMLElement, username: string) {
        parent.innerHTML = '';

        const msgRedirect = createElement({
            tag: 'a',
            parent,
            attrs: { href: `/messenger/${username}` },
            classes: ['friend__msg-redirect'],
        });

        // router.go({
        //     path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
        // });

        insertIcon(msgRedirect, {
            name: 'messenger-icon',
            classes: ['friend__msg-icon'],
        });

        createElement({
            parent: msgRedirect,
            text: 'Написать сообщение',
            classes: ['friend__action-text'],
        });
    }

    private renderDropdown(friend: HTMLElement, friendData: Record<string, any>) {
        const friendRight = friend.querySelector('.friend__right');

        const dropdown = createElement({
            classes: ['js-dropdown', 'friend__dropdown'],
            parent: friendRight,
        });

        const optionsWrapper = createElement({
            classes: ['post__options'],
            parent: dropdown,
        });

        createElement({
            classes: ['post__options-icon'],
            parent: optionsWrapper,
        });

        const contextMenuData: Record<string, object> = {
            deleteFriend: {
                href: '/delete-friend',
                text: 'Удалить из друзей',
                icon: 'user-delete-icon',
                isCritical: true,
                onClick: async () => {
                    const status = await API.deleteFriend(friendData.id);
                    // const status = 200;
                    switch (status) {
                        case 200:
                            this.renderDeletedFriend(friend, friendData);
                            break;
                        default:
                            new PopUpComponent(this.config.container, {
                                text: "Не удалось удалить пользователя из друзей",
                                isError: true,
                            });
                            break;
                    }
                },
            },
        };

        new ContextMenuComponent(dropdown, { data: contextMenuData });
    }

    private renderUndoAction(parent: HTMLElement, friendData: Record<string, any>) {
        parent.innerHTML = '';

        createElement({
            parent,
            classes: ['friend__text'],
            text: 'Вы удалили пользователя из друзей',
        });

        createElement({
            parent,
            classes: ['friend__text'],
            text: '•',
        });

        const undoBtn = createElement({
            parent,
            classes: ['friend__action-text'],
            text: 'Отменить',
        });

        undoBtn.addEventListener('click', async () => {
            const status = await API.acceptFriendRequest(friendData.id);
            // const status = 200;
            switch (status) {
                case 200:
                    this.renderMsgAction(parent, friendData.username);
                    this.renderDropdown(parent.parentNode.parentNode.parentNode as HTMLElement, friendData);
                    break;
                default:
                    new PopUpComponent(this.config.container, {
                        text: "Не удалось отменить действие",
                        isError: true,
                    });
                    break;
            }
        });
    }
};
