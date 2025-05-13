import createElement from '@utils/createElement';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent';
import { CommunitiesRequests } from '@modules/api';
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
            src: this.config.data.community.avatar_url,
            href: `/communities/${this.config.data.community.nickname}`,
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
            text: this.config.data.community.name,
            attrs: { href: `/communities/${this.config.data.community.nickname}` },
        });

        const action = createElement({
            parent: communityInfo,
            classes: ['search-item__action'],
        });

        // this.renderMembersCount(action);
        this.renderDropdown(community, this.config.data);
    }

    private renderDeletedCommunity(community: HTMLElement, communityData: Record<string, any>) {
        const action: HTMLElement = community.querySelector('.search-item__action');
        const dropdown = community.querySelector('.js-dropdown');

        this.renderUndoAction(action, communityData);
        dropdown.remove();
    }

    private renderMembersCount(parent: HTMLElement) {
        parent.innerHTML = '';

        createElement({
            parent,
            classes: ['search-item__text'],
            text: '2M подписчиков',
        });
    }

    private renderDropdown(community: HTMLElement, communityData: Record<string, any>) {
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
                    navigator.clipboard.writeText(`${window.origin}/communities/${communityData.community.nickname}`)
                    .then(() => {
                        new PopUpComponent({
                            text: 'Текст скопирован в буфер обмена',
                            icon: "copy-green-icon",
                        });
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                },
            }
        };

        if (communityData?.role !== 'owner') {
            contextMenuData.deleteCommunity = {
                text: 'Отписаться',
                icon: 'minus-icon',
                isCritical: true,
                onClick: async () => {
                    const status = await CommunitiesRequests.leaveCommunity(communityData.id);
                    switch (status) {
                        case 200:
                            this.renderDeletedCommunity(community, communityData);
                            break;
                        default:
                            new PopUpComponent({
                                text: "Не удалось отписаться от сообщества",
                                isError: true,
                                icon: "close-icon",
                                size: 'large',
                            });
                            break;
                    }
                },
            }
        }

        new ContextMenuComponent(dropdown, { data: contextMenuData });
    }

    private renderUndoAction(parent: HTMLElement, communityData: Record<string, any>) {
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
            const status = await CommunitiesRequests.joinCommunity(communityData.id);
            switch (status) {
                case 200:
                    // this.renderMembersCount(parent);
                    this.renderDropdown(parent.parentNode.parentNode.parentNode as HTMLElement, communityData);
                    break;
                default:
                    new PopUpComponent({
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
