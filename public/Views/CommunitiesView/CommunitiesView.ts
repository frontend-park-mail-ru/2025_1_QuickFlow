import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import createElement from '@utils/createElement';
import API from '@utils/api';
import { getLsItem } from '@utils/localStorage';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
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

        new SearchComponent(this.containerObj.left, {});

        // new InputComponent(this.containerObj.left, {
        //     type: 'search',
        //     placeholder: 'Введите запрос',
        //     classes: ['input_wide', 'input_search-small'],
        // });

        this.communities = createElement({
            parent: this.containerObj.left,
            classes: ['communities'],
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

    async renderSection(section = Section.Communities) {
        this.communities.innerHTML = '';

        switch (section) {
            case Section.Communities:
                this.renderCommunities();
                break;
            // case Section.Incoming:
            //     this.renderIncoming();
            //     break;
            // case Section.Outcoming:
            //     this.renderOutcoming();
            //     break;
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
                text: 'Пока нет ни одного сообщества',
            });
        }

        for (const communityData of communitiesData) {
            new CommunityComponent(this.communities, {
                container: this.containerObj.container,
                data: communityData,
            });
        }
    }
}

export default new CommunitiesView();
