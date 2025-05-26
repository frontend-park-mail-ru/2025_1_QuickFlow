import createElement from '@utils/createElement';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent, { OptionConfig } from '@components/ContextMenuComponent/ContextMenuComponent';
import insertIcon from '@utils/insertIcon';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { FriendsRequests } from '@modules/api';
import router from '@router';


export default class FriendComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private element: HTMLElement;

    constructor(parent: HTMLElement, config: Record<string, any>) {
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

        const action = createElement({
            parent: friendInfo,
            classes: ['search-item__action'],
        });

        this.renderAction(action, this.config.data.username);
        this.renderDropdown(this.element, this.config.data);
    }

    private renderDeletedFriend(friend: HTMLElement, friendData: Record<string, any>) {
        const action: HTMLElement = friend.querySelector('.search-item__action');
        const dropdown = friend.querySelector('.js-dropdown');

        this.renderUndoAction(action, friendData);
        dropdown.remove();
    }

    private renderAction(parent: HTMLElement, username: string) {
        parent.innerHTML = '';

        let action: HTMLElement;

        switch (this.config.section) {
            case 'all':
                action = createElement({
                    tag: 'a',
                    parent,
                    attrs: { href: `/messenger/${username}` },
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(action, {
                    name: 'messenger-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: action,
                    text: 'Написать сообщение',
                    classes: ['search-item__action-text'],
                });
                break;

            case 'incoming':
                action = createElement({
                    parent,
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(action, {
                    name: 'user-add-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: action,
                    text: 'Принять заявку',
                    classes: ['search-item__action-text'],
                });

                action.addEventListener('click', async () => {
                    const status = await FriendsRequests.acceptFriendRequest(this.config.data.id);
                    switch (status) {
                        case 200:
                            this.element.remove();
                            break;
                        default:
                            new PopUpComponent({
                                text: "Не удалось добавить пользователя в друзья",
                                isError: true,
                            });
                    }
                });
                break;

            case 'outcoming':
                action = createElement({
                    parent,
                    classes: ['search-item__msg-redirect'],
                });
        
                insertIcon(action, {
                    name: 'user-remove-icon',
                    classes: ['search-item__msg-icon'],
                });
        
                createElement({
                    parent: action,
                    text: 'Отменить заявку',
                    classes: ['search-item__action-text'],
                });

                action.addEventListener('click', async () => {
                    const status = await FriendsRequests.cancelFriendRequest(this.config.data.id);
                    switch (status) {
                        case 200:
                            this.element.remove();
                            break;
                        default:
                            new PopUpComponent({
                                text: "Не удалось отменить заявку в друзья",
                                isError: true,
                            });
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
                                new PopUpComponent({
                                    text: "Не удалось удалить пользователя из друзей",
                                    isError: true,
                                });
                                break;
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
                    new PopUpComponent({
                        text: "Не удалось отменить действие",
                        isError: true,
                    });
                    break;
            }
        });
    }
};
