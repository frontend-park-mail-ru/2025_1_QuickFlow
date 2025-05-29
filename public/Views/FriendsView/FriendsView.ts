import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import createElement from '@utils/createElement';
import FriendComponent from '@components/FriendComponent/FriendComponent';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import SearchComponent from '@components/SearchComponent/SearchComponent';
import router from '@router';
import { FriendsRequests, UsersRequests } from '@modules/api';
import LsProfile from '@modules/LsProfile';
import networkErrorPopUp from '@utils/networkErrorPopUp';


const enum Section {
    All,
    Incoming,
    Outcoming,
}


class FriendsView {
    private containerObj: MainLayoutComponent;
    private friends: HTMLElement;

    private targetUserId: string = null;

    constructor() {}

    render(params: Record<string, any>) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        const results = createElement({
            parent: this.containerObj.left,
            classes: [
                'friends',
                'friends__search-results',
                'hidden',
            ],
        });

        this.friends = createElement({
            parent: this.containerObj.left,
            classes: ['friends'],
        });

        new SearchComponent(this.containerObj.left, {
            placeholder: 'Введите запрос',
            classes: ['search_wide'],
            inputClasses: [
                'input_wide',
                'input_search-small',
                'friends__search',
            ],
            results,
            searchResults: UsersRequests.searchUsers,
            renderEmptyState: this.renderEmptyState,
            renderTitle: this.renderTitle,
            renderResult: this.renderFriend,
            elementToHide: this.friends,
        });

        this.targetUserId = params.user_id || LsProfile.id;
        if (this.targetUserId !== LsProfile.id) {
            new RadioMenuComponent(this.containerObj.right, {
                items: {
                    friends: {
                        title: 'Все друзья',
                        onClick: () => this.renderSection(Section.All),
                    },
                    incoming: {
                        title: 'Подписчики',
                        onClick: () => this.renderSection(Section.Incoming),
                    },
                },
                active: params?.section || 'friends',
            });
        } else {
            new RadioMenuComponent(this.containerObj.right, {
                items: {
                    friends: {
                        title: 'Мои друзья',
                        onClick: () => this.renderSection(Section.All),
                    },
                    incoming: {
                        title: 'Заявки в друзья',
                        onClick: () => this.renderSection(Section.Incoming),
                    },
                    outcoming: {
                        title: 'Исходящие заявки',
                        onClick: () => this.renderSection(Section.Outcoming),
                    },
                },
                active: params?.section || 'friends',
            });
        }

        return this.containerObj.container;
    }

    private renderTitle(parent: HTMLElement) {
        createElement({
            tag: 'h2',
            parent,
            classes: ['search__title'],
            text: 'Результаты поиска',
        });
    }

    async renderSection(section = Section.All) {
        switch (section) {
            case Section.All:
                this.fetchFriends('all');
                break;
            case Section.Incoming:
                this.fetchFriends('incoming');
                break;
            case Section.Outcoming:
                this.fetchFriends('outcoming');
                break;
        }
    }

    async fetchFriends(section: 'all' | 'incoming' | 'outcoming') {
        const [status, data] = await FriendsRequests.getFriends(this.targetUserId, 100, 0, section);
        switch (status) {
            case 200: 
                this.renderFriends(data, section);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
            default:
                networkErrorPopUp();
        }
    }

    private renderFriends(data: Record<string, any>, section: 'all' | 'incoming' | 'outcoming') {
        this.friends.innerHTML = '';
        const friendsData = data?.payload?.friends;

        const isMine = this.targetUserId === LsProfile.id;

        if (!friendsData || !friendsData.length) {
            return new EmptyStateComponent(this.friends, {
                icon: 'friends-icon',
                text: isMine ? 'У вас пока нет друзей' : `У пользователя пока нет друзей`,
            });
        }

        for (const friendData of friendsData) {
            this.renderFriend(this.friends, friendData, section);
        }
    }

    private renderEmptyState(parent: HTMLElement) {
        new EmptyStateComponent(parent, {
            icon: 'friends-icon',
            text: 'Пользователи не найдены',
        });
    }

    private renderFriend(parent: HTMLElement, friendData: Record<string, any>, section?: 'all' | 'incoming' | 'outcoming') {
        new FriendComponent(parent, {
            data: friendData,
            section: section || 'all',
            isMine: this.targetUserId === LsProfile.id,
        });
    }
}

export default new FriendsView();
