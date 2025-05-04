import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import createElement from '@utils/createElement';
import API from '@utils/api';
import FriendComponent from '@components/FriendComponent/FriendComponent';
import { getLsItem } from '@utils/localStorage';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import SearchComponent from '@components/SearchComponent/SearchComponent';


const enum Section {
    Friends,
    Incoming,
    Outcoming,
}


class FriendsView {
    private containerObj: MainLayoutComponent;
    private friends: HTMLElement;

    constructor() {}

    render() {
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
            searchResults: API.searchFriends,
            renderEmptyState: this.renderEmptyState,
            title: 'Результаты поиска',
            renderResult: this.renderFriend,
            elementToHide: this.friends,
        });

        new RadioMenuComponent(this.containerObj.right, {
            items: {
                friends: {
                    title: 'Мои друзья',
                    onClick: () => this.renderSection(Section.Friends),
                },
                incoming: {
                    title: 'Заявки в друзья',
                    onClick: () => this.renderSection(Section.Incoming),
                },
                outcoming: {
                    title: 'Исходящие заявки',
                    onClick: () => this.renderSection(Section.Outcoming),
                },
            }
        });

        this.renderSection(Section.Friends);

        return this.containerObj.container;
    }

    async renderSection(section = Section.Friends) {
        this.friends.innerHTML = '';

        switch (section) {
            case Section.Friends:
                this.renderFriends();
                break;
            // case Section.Incoming:
            //     this.renderIncoming();
            //     break;
            // case Section.Outcoming:
            //     this.renderOutcoming();
            //     break;
        }
    }

    async renderFriends() {
        const userId = getLsItem('user_id', null);

        const [friendsStatus, data] = await API.getFriends(userId, 100);
        const friendsData = data.body.friends;
        // const friendsData = [];

        if (!friendsData || !friendsData.length) {
            return new EmptyStateComponent(this.friends, {
                icon: 'friends-icon',
                text: 'У вас пока нет друзей',
            });
        }

        for (const friendData of friendsData) {
            this.renderFriend(this.friends, friendData);
        }
    }

    private renderEmptyState(parent: HTMLElement) {
        new EmptyStateComponent(parent, {
            icon: 'friends-icon',
            text: 'Пользователи не найдены',
        });
    }

    private renderFriend(parent: HTMLElement, friendData: Record<string, any>) {
        new FriendComponent(parent, {
            data: friendData,
        });
    }
}

export default new FriendsView();
