import createElement from '@utils/createElement';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import insertIcon from '@utils/insertIcon';
import API from '@utils/api';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';


export default class CommunityComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {        
        const community = createElement({
            parent: this.parent,
            classes: ['search-item'],
        });

        new AvatarComponent(community, {
            size: 'l',
            src: this.config.data.avatar_url,
            href: `/communities/${this.config.data.username}`,
        });

        const communityRight = createElement({
            parent: community,
            classes: ['search-item__right'],
        });

        const communityInfo = createElement({
            parent: communityRight,
            classes: ['search-item__info'],
        });

        createElement({
            tag: 'a',
            parent: communityInfo,
            classes: ['search-item__name'],
            text: `${this.config.data.firstname} ${this.config.data.lastname}`,
            attrs: { href: `/communities/${this.config.data.username}` },
        });

        const action = createElement({
            parent: communityInfo,
            classes: ['search-item__action'],
        });

        this.renderMsgAction(action, this.config.data.username);
        this.renderDropdown(community, this.config.data);
    }

    private renderDeletedCommunity(community: HTMLElement, friendData: Record<string, any>) {
        const action: HTMLElement = community.querySelector('.search-item__action');
        const dropdown = community.querySelector('.js-dropdown');

        this.renderUndoAction(action, friendData);
        dropdown.remove();
    }

    private renderMsgAction(parent: HTMLElement, username: string) {
        parent.innerHTML = '';

        createElement({
            parent,
            classes: ['search-item__text'],
            text: '2M подписчиков'
        });
    }

    private renderDropdown(community: HTMLElement, friendData: Record<string, any>) {
        const communityRight = community.querySelector('.search-item__right');

        const dropdown = createElement({
            classes: ['js-dropdown', 'search-item__dropdown'],
            parent: communityRight,
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
            copyLink: {
                text: 'Скопировать ссылку',
                icon: 'copy-icon',
                onClick: async () => {
                    navigator.clipboard.writeText(`${window.origin}/communities/${this.config.data.username}`)
                    .then(() => {
                        new PopUpComponent(this.parent, {
                            text: 'Текст скопирован в буфер обмена',
                            icon: "copy-green-icon",
                        });
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                },
            },
            deleteCommunity: {
                text: 'Отписаться',
                icon: 'minus-icon',
                isCritical: true,
                onClick: async () => {
                    const status = await API.deleteFriend(friendData.id);
                    // const status: number = 200;
                    switch (status) {
                        case 200:
                            this.renderDeletedCommunity(community, friendData);
                            break;
                        default:
                            new PopUpComponent(this.config.container, {
                                text: "Не удалось отписаться от сообщества",
                                isError: true,
                                icon: "close-icon",
                                size: 'large',
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
            classes: ['search-item__text'],
            text: 'Вы отписались от сообщества',
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
            const status = await API.acceptFriendRequest(friendData.id);
            // const status: number = 200;
            switch (status) {
                case 200:
                    this.renderMsgAction(parent, friendData.username);
                    this.renderDropdown(parent.parentNode.parentNode.parentNode as HTMLElement, friendData);
                    break;
                default:
                    new PopUpComponent(this.config.container, {
                        text: "Не удалось отменить действие",
                        isError: true,
                        icon: "close-icon",
                        size: 'large',
                    });
                    break;
            }
        });
    }
};
