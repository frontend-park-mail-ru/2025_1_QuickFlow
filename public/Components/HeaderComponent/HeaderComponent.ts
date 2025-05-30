import ProfileMenuComponent from '@components/ProfileMenuComponent/ProfileMenuComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import SearchComponent from '@components/SearchComponent/SearchComponent';
import { CommunitiesRequests, FriendsRequests, UsersRequests } from '@modules/api';
import LsProfile from '@modules/LsProfile';


export default class HeaderComponent {
    private parent: HTMLElement;
    private left: HTMLElement | null = null;
    private search: HTMLElement | null = null;
    private searchResults: HTMLElement | null = null;

    wrapper: HTMLElement | null = null;
    rightWrapper: HTMLElement | null = null;


    constructor(parent: HTMLElement) {
        this.parent = parent;
        this.render();
    }

    render() {
        const header = createElement({
            tag: 'header',
            parent: this.parent,
            classes: ['header']
        });

        this.wrapper = createElement({
            parent: header,
            classes: ['header__inner']
        });
        
        this.renderActions();
        this.renderAvatarMenu();
    }

    renderActions() {
        this.left = createElement({
            parent: this.wrapper,
            classes: ['header__left']
        });

        const results = createElement({
            parent: this.left,
            classes: [
                'header__results',
                'hidden'
            ],
        });

        new SearchComponent(this.left, {
            placeholder: 'Поиск',
            classes: ['header__search-wrapper'],
            inputClasses: ['header__search'],
            results,
            isResultsChild: true,
            resultsCount: 3,
            searchResults: [
                UsersRequests.searchUsers,
                CommunitiesRequests.searchCommunities,
            ],
            renderEmptyState: [
                this.renderEmptyState,
                this.renderCommunityEmptyState,
            ],
            renderTitle: [
                this.renderTitle,
                this.renderCommunityTitle,
            ],
            renderResult: [
                this.renderResult,
                this.renderCommunityResult,
            ]
        });
    }

    private renderTitle(parent: HTMLElement) {
        createElement({
            parent,
            classes: ['header__results-title'],
            text: 'Люди'
        });
    }

    private renderCommunityTitle(parent: HTMLElement) {
        createElement({
            parent,
            classes: ['header__results-title'],
            text: 'Cообщества'
        });
    }

    private renderResult(parent: HTMLElement, userData: Record<string, any>) {
        const result = createElement({
            tag: 'a',
            classes: ['header__result'],
            attrs: { href: `/profiles/${userData.username}` },
        });

        new AvatarComponent(result, {
            src: userData?.avatar_url,
            size: 'xs',
        });

        createElement({
            parent: result,
            classes: ['header__result-name'],
            text: `${userData.firstname} ${userData.lastname}`,
        });

        let resultsList = parent.querySelector('.header__results-items');
        if (!resultsList) {
            resultsList = createElement({
                parent,
                classes: ['header__results-items'],
            });
        }

        resultsList.appendChild(result);
    }

    private renderCommunityResult(parent: HTMLElement, communityData: Record<string, any>) {
        const result = createElement({
            tag: 'a',
            classes: ['header__result'],
            attrs: { href: `/communities/${communityData?.community?.nickname}` },
        });

        new AvatarComponent(result, {
            src: communityData?.community?.avatar_url,
            size: 'xs',
        });

        createElement({
            parent: result,
            classes: ['header__result-name'],
            text: communityData?.community?.name,
        });

        let resultsList = parent.querySelector('.header__results-items');
        if (!resultsList) {
            resultsList = createElement({
                parent,
                classes: ['header__results-items'],
            });
        }

        resultsList.appendChild(result);
    }

    private renderEmptyState(parent: HTMLElement) {
        createElement({
            parent,
            text: 'Пользователи не найдены',
            classes: ['header__result_empty'],
        });
    }

    private renderCommunityEmptyState(parent: HTMLElement) {
        createElement({
            parent,
            text: 'Cообщества не найдены',
            classes: ['header__result_empty'],
        });
    }

    showNotFound() {
        if (!this.searchResults) return;

        this.searchResults.innerHTML = '';
        createElement({
            parent: this.searchResults,
            text: 'Ничего не найдено',
            classes: ['header__result_empty'],
        });
    }

    cdOk(users: Record<string, any>) {
        if (!this.searchResults) {
            this.searchResults = createElement({
                parent: this.search,
                classes: ['header__results'],
            });
        }

        if (
            !users ||
            !users.payload ||
            users.payload.length === 0
        ) return this.showNotFound();

        if (this.searchResults) this.searchResults.innerHTML = '';
        
        for (const user of users.payload) {
            createElement({
                tag: 'a',
                parent: this.searchResults,
                text: `${user.firstname} ${user.lastname}`,
                classes: ['header__result'],
                attrs: { href: `/profiles/${user.username}` },
            });
        }
    }

    async renderAvatarMenu() {
        if (this.rightWrapper) {
            this.rightWrapper.remove();
            this.rightWrapper.innerHTML = '';
        }

        this.rightWrapper = createElement({
            parent: this.wrapper,
            classes: ['header__right']
        });

        // const [status, profileData] = await UsersRequests.getMyProfile();
        // switch (status) {
        //     case 200:
        //         this.renderAvatarCallback(profileData);
        //         break;
        // }

        this.renderAvatarCallback(LsProfile.data);
    }

    renderAvatarCallback(profileData: Record<string, any>) {
        this.rightWrapper.innerHTML = '';

        if (profileData && this.rightWrapper) {
            new AvatarComponent(this.rightWrapper, {
                size: 'xs',
                src: profileData.profile.avatar_url,
            });

            createElement({
                tag: 'a',
                parent: this.rightWrapper,
                classes: ['header__dropdown-icon']
            });

            new ProfileMenuComponent(this.rightWrapper, {
                userData: profileData,
            });
        }
    }
}
