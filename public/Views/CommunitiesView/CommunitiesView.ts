import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import CommunityComponent from '@components/CommunityComponent/CommunityComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import CreateCommunityMwComponent from '@components/UI/ModalWindowComponent/CreateCommunityMwComponent';
import SearchComponent from '@components/SearchComponent/SearchComponent';
import router from '@router';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { CommunitiesRequests } from '@modules/api';


const enum Section {
    Communities,
    Managed,
}

const COMMUNITIES_COUNT = 100;


class CommunitiesView {
    private containerObj: MainLayoutComponent;
    private communities: HTMLElement;

    constructor() {}

    render(params: Record<string, any>) {
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
            searchResults: CommunitiesRequests.searchCommunities,
            renderTitle: this.renderTitle,
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
            },
            active: params?.section || 'communities',
        });

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

    private renderEmptyState(parent: HTMLElement) {
        new EmptyStateComponent(parent, {
            icon: 'communities-icon',
            text: 'Сообщества не найдены',
        });
    }

    async renderSection(section = Section.Communities) {
        switch (section) {
            case Section.Communities:
                this.fetchCommunities(CommunitiesRequests.getUserCommunities);
                break;
            case Section.Managed:
                this.fetchCommunities(CommunitiesRequests.getManagedCommunities);
                break;
        }
    }

    async fetchCommunities(getMethod: Function) {
        const username = getLsItem('username', null);

        const [status, data] = await getMethod(username, COMMUNITIES_COUNT);
        switch (status) {
            case 200:
                this.renderCommunities(data);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
            default:
                new PopUpComponent({
                    isError: true,
                    text: 'Не удалось получить список сообществ',
                });
                break;
        }
    }

    private renderCommunities(data: Record<string, any>) {
        this.communities.innerHTML = '';

        const communitiesData = data?.payload;

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
