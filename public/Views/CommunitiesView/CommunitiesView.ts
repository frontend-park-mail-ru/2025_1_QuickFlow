import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import createElement from '@utils/createElement';
import API from '@utils/api';
import { getLsItem } from '@utils/localStorage';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import CommunityComponent from '@components/CommunityComponent/CommunityComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import CreateCommunityMwComponent from '@components/UI/ModalWindowComponent/CreateCommunityMwComponent';
import SearchComponent from '@components/SearchComponent/SearchComponent';


const enum Section {
    Communities,
    Managed,
}

const COMMUNITIES_COUNT = 100;


class CommunitiesView {
    private containerObj: MainLayoutComponent;
    private communities: HTMLElement;

    constructor() {}

    render() {
        this.containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        const results = createElement({
            parent: this.containerObj.left,
            classes: [
                'communities',
                'communities__search-results',
                'hidden',
            ],
        });

        this.communities = createElement({
            parent: this.containerObj.left,
            classes: ['communities'],
        });

        new SearchComponent(this.containerObj.left, {
            placeholder: 'Введите запрос',
            classes: ['search_wide'],
            inputClasses: [
                'input_wide',
                'input_search-small',
                'communities__search',
            ],
            results,
            searchResults: API.searchFriends,
            title: 'Результаты поиска',
            renderEmptyState: this.renderEmptyState,
            renderResult: this.renderCommunity,
            elementToHide: this.communities,
        });

        new ButtonComponent(this.containerObj.right, {
            text: 'Создать сообщество',
            variant: 'secondary',
            size: 'small',
            classes: ['button_wide'],
            onClick: () => new CreateCommunityMwComponent(this.containerObj.container, {}),
        });

        new RadioMenuComponent(this.containerObj.right, {
            items: {
                communities: {
                    title: 'Мои сообщества',
                    onClick: () => this.renderSection(Section.Communities),
                },
                managed: {
                    title: 'Управляемые',
                    onClick: () => this.renderSection(Section.Managed),
                },
            }
        });

        this.renderSection(Section.Communities);

        return this.containerObj.container;
    }

    private renderEmptyState(parent: HTMLElement) {
        new EmptyStateComponent(parent, {
            icon: 'communities-icon',
            text: 'Сообщества не найдены',
        });
    }

    async renderSection(section = Section.Communities) {
        this.communities.innerHTML = '';

        switch (section) {
            case Section.Communities:
                this.renderCommunities();
                break;
        }
    }

    async renderCommunities() {
        const username = getLsItem('username', null);

        const [communitiesStatus, data] = await API.getUserCommunities(username, COMMUNITIES_COUNT);
        const communitiesData = data.body.friends;
        // const communitiesData = [];

        if (!communitiesData || !communitiesData.length) {
            return new EmptyStateComponent(this.communities, {
                icon: 'communities-icon',
                text: 'Вы пока не подписаны ни на одно сообщество',
            });
        }

        for (const communityData of communitiesData) {
            this.renderCommunity(this.communities, communityData);
        }
    }

    private renderCommunity(parent: HTMLElement, friendData: Record<string, any>) {
        new CommunityComponent(parent, {
            data: friendData,
        });
    }
}

export default new CommunitiesView();
