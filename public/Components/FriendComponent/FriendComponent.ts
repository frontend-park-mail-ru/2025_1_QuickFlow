import createElement from '@utils/createElement';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent, { OptionConfig } from '@components/ContextMenuComponent/ContextMenuComponent';
import insertIcon from '@utils/insertIcon';
import { FriendsRequests } from '@modules/api';
import router from '@router';
import networkErrorPopUp from '@utils/networkErrorPopUp';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';


interface FriendConfig {
    isMine: boolean;
    data: Record<string, any>;
    section: 'all' | 'incoming' | 'outcoming';
}


export default class FriendComponent {
    private parent: HTMLElement;
    private config: FriendConfig;

    private element: HTMLElement;
    private actionType: 'message' | 'accept' | 'decline';

    constructor(parent: HTMLElement, config: FriendConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {        
        this.element = createElement({
            parent: this.parent,
            classes: ['search-item'],
        });

        new AvatarComponent(this.element, {
            size: 'l',
            src: this.config.data.avatar_url,
            href: `/profiles/${this.config.data.username}`,
        });

        const friendRight = createElement({
            parent: this.element,
            classes: ['search-item__right'],
        });

        const friendInfo = createElement({
            parent: friendRight,
            classes: ['search-item__info'],
        });

        createElement({
            tag: 'a',
            parent: friendInfo,
            classes: ['search-item__name'],
            text: `${this.config.data.firstname} ${this.config.data.lastname}`,
            attrs: { href: `/profiles/${this.config.data.username}` },
        });

        this.defineActionType();

        const action = createElement({
            parent: friendInfo,
            classes: ['search-item__action'],
        });

        this.renderAction(action, this.config.data.username);

        if (this.config.isMine) {
            this.renderDropdown(this.element, this.config.data);
        }
    }

    private defineActionType(): 'message' | 'accept' | 'decline' {
        if (!this.config.isMine) {
            return this.actionType = 'message';    
        }
        
        switch (this.config.section) {
            case 'all':
                return this.actionType = 'message';
            case 'incoming':
                return this.actionType = 'accept';
            case 'outcoming':
                return this.actionType = 'decline';
        }
    }

    private renderDeletedFriend(friend: HTMLElement, friendData: Record<string, any>) {
        const action: HTMLElement = friend.querySelector('.search-item__action');
        const dropdown = friend.querySelector('.js-dropdown');

        this.renderUndoAction(action, friendData);
        dropdown.remove();
    }

    private renderAction(parent: HTMLElement, username: string) {
        parent.innerHTML = '';

        let actionElement: HTMLElement;

        switch (this.actionType) {
            case 'message':
                actionElement = createElement({
                    tag: 'a',
                    parent,
                    attrs: { href: `/messenger/${username}` },
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(actionElement, {
                    name: 'messenger-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: actionElement,
                    text: 'Написать сообщение',
                    classes: ['search-item__action-text'],
                });
                break;

            case 'accept':
                actionElement = createElement({
                    parent,
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(actionElement, {
                    name: 'user-add-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: actionElement,
                    text: 'Принять заявку',
                    classes: ['search-item__action-text'],
                });

                actionElement.addEventListener('click', async () => {
                    const status = await FriendsRequests.acceptFriendRequest(this.config.data.id);
                    switch (status) {
                        case 200:
                            this.element.remove();
                            new PopUpComponent({
                                icon: 'profile-icon',
                                text: 'Пользователь добавлен в друзья',
                            });
                            break;
                        default:
                            networkErrorPopUp({ text: "Не удалось добавить пользователя в друзья" });
                    }
                });
                break;

            case 'decline':
                actionElement = createElement({
                    parent,
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(actionElement, {
                    name: 'user-remove-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: actionElement,
                    text: 'Отменить заявку',
                    classes: ['search-item__action-text'],
                });

                actionElement.addEventListener('click', async () => {
                    const status = await FriendsRequests.cancelFriendRequest(this.config.data.id);
                    switch (status) {
                        case 200:
                            this.element.remove();
                            new PopUpComponent({
                                icon: 'profile-icon',
                                text: 'Ваша заявка в друзья отменена',
                            });
                            break;
                        default:
                            networkErrorPopUp({ text: "Не удалось отменить заявку в друзья" });
                    }
                });
                break;
        }
    }

    private renderDropdown(friend: HTMLElement, friendData: Record<string, any>) {
        const friendRight = friend.querySelector('.search-item__right');

        const dropdown = createElement({
            classes: ['js-dropdown', 'search-item__dropdown'],
            parent: friendRight as HTMLElement,
        });

        const optionsWrapper = createElement({
            classes: ['post__options'],
            parent: dropdown,
        });

        createElement({
            classes: ['post__options-icon'],
            parent: optionsWrapper,
        });

        const contextMenuData: Record<string, OptionConfig> = {};

        switch (this.config.section) {
            case 'all':
                contextMenuData.deleteFriend = {
                    href: '/delete-friend',
                    text: 'Удалить из друзей',
                    icon: 'user-delete-icon',
                    isCritical: true,
                    onClick: async () => {
                        const status = await FriendsRequests.deleteFriend(friendData.id);
                        switch (status) {
                            case 200:
                                this.renderDeletedFriend(friend, friendData);
                                break;
                            default:
                                networkErrorPopUp({ text: "Не удалось удалить пользователя из друзей" });
                        }
                    },
                };
                break;
            default:
                contextMenuData.message = {
                    href: '/message',
                    text: 'Написать сообщение',
                    icon: 'messenger-icon',
                    onClick: async () => router.go({ path: `/messenger/${friendData.username}` }),
                };
                break;
        }

        new ContextMenuComponent(dropdown, { data: contextMenuData });
    }

    private renderUndoAction(parent: HTMLElement, friendData: Record<string, any>) {
        parent.innerHTML = '';

        createElement({
            parent,
            classes: ['search-item__text'],
            text: 'Вы удалили пользователя из друзей',
        });

        createElement({
            parent,
            classes: ['search-item__text'],
            text: '•',
        });

        const undoBtn = createElement({
            parent,
            classes: ['search-item__action-text'],
            text: 'Отменить',
        });

        undoBtn.addEventListener('click', async () => {
            const status = await FriendsRequests.acceptFriendRequest(friendData.id);

            switch (status) {
                case 200:
                    this.renderAction(parent, friendData.username);
                    this.renderDropdown(parent.parentNode.parentNode.parentNode as HTMLElement, friendData);
                    break;
                default:
                    networkErrorPopUp({ text: "Не удалось отменить действие" });
            }
        });
    }
};
