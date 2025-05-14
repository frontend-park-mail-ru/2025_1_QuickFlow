import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import FeedComponent from '@components/FeedComponent/FeedComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ProfileInfoMwComponent from '@components/UI/ModalWindowComponent/ProfileInfoMwComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import CoverComponent from '@components/CoverComponent/CoverComponent';
import router from '@router';
import { ACTIONS_PROPERTIES, INFO_ITEMS_LAYOUT } from './CommunityConfig';
import insertIcon from '@utils/insertIcon';
import { MOBILE_MAX_WIDTH } from '@config/config';
import { CommunitiesRequests } from '@modules/api';


const MOBILE_MAX_DISPLAYED_FRIENDS_COUNT = 3;


class CommunityView {
    private containerObj: MainLayoutComponent | null = null;
    private profileActions: HTMLElement | null = null;

    constructor() {}

    render(params: Record<string, any>) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'profile',
        });

        console.log(params);

        const address = params?.address;

        (async () => {
            const [status, communityData] = await CommunitiesRequests.getCommunity(address);
            switch (status) {
                case 200:
                    this.cbOk(communityData);
                    break;
                case 401:
                    router.go({ path: '/login' });
                    break;
                case 404:
                    router.go({ path: '/not-found' });
                    break;
            }
        })();

        return this.containerObj.container;
    }

    private async renderMembers(communityId: string) {
        const [status, membersData] = await CommunitiesRequests.getCommunityMembers(communityId, 100);

        console.log(membersData);
        switch (status) {
            case 200:
                this.friendsCbOk(membersData.payload);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
            case 404:
                router.go({ path: '/not-found' });
                break;
        }
    }

    friendsCbOk(data: Array<Record<string, any>>) {
        if (!data || data.length === 0) return;

        const friendsWrapper = createElement({
            parent: this.containerObj?.right,
            classes: ['profile__friends'],
        });

        const top = createElement({
            parent: friendsWrapper,
            classes: ['profile__friends-header'],
        });

        createElement({
            parent: top,
            text: 'Подписчики',
        });

        createElement({
            parent: top,
            text: data.length,
            classes: ['profile__friends-count'],
        });

        const profileFriends = createElement({
            parent: friendsWrapper,
            classes: ['profile__friends-inner'],
        });

        for (const friendData of data) {
            const { username, firstname, avatar_url } = friendData;

            const friend = createElement({
                tag: 'a',
                parent: profileFriends,
                classes: ['profile__friend'],
                attrs: { href: `/profiles/${username}` },
            });

            new AvatarComponent(friend, {
                size: 'xl',
                class: 'profile__friend-avatar',
                src: avatar_url,
            });

            createElement({
                parent: friend,
                text: firstname,
                classes: ['profile__friend-name']
            });

            if (
                window.innerWidth <= MOBILE_MAX_WIDTH &&
                profileFriends.children.length === MOBILE_MAX_DISPLAYED_FRIENDS_COUNT
            ) break;
        }
    }

    cbOk(data: any) {
        const profileHeader = createElement({
            parent: this.containerObj?.top,
            classes: ['profile']
        });

        new CoverComponent(profileHeader, {
            src: data.payload.community.cover_url,
            type: 'profile',
        });

        const profileMenu = createElement({
            parent: profileHeader,
            classes: ['js-profile-menu'],
        });

        const profileMenuBtn = createElement({
            parent: profileMenu,
            classes: ['profile__menu-btn'],
        });

        insertIcon(profileMenuBtn, {
            name: 'options-icon',
            classes: ['profile__menu-icon'],
        });

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile__avatar',
            src: data.payload.community.avatar_url,
        });

        const profileBottom = createElement({
            parent: profileHeader,
            classes: ['profile__content'],
        });

        const profileInfo = createElement({
            parent: profileBottom,
            classes: ['profile__info']
        });

        createElement({
            parent: profileInfo,
            text: data.payload.community.name,
            classes: ['profile__name'],
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile__details']
        });

        const moreInfo = this.createInfoItem(
            fullInfo,
            INFO_ITEMS_LAYOUT['more'].icon,
            INFO_ITEMS_LAYOUT['more'].text,
            true
        );
        moreInfo.classList.add('profile__detail_more');

        moreInfo.addEventListener('click', () => {
            new ProfileInfoMwComponent(this.containerObj?.container, {
                data,
                createInfoItem: this.createInfoItem,
                createCountedItem: this.createCountedItem,
                type: 'community',
            })
        });

        this.renderActions(profileBottom, data);

        new FeedComponent(this.containerObj?.left, {
            getUrl: `/communities/${data.payload.community.nickname}/posts`,
            params: { author_id: data.payload.id },
            hasCreateButton: data.payload.role === "owner" ?
                true :
                false,
            emptyStateText: data.payload.role === "owner" ? "Напишите первый пост в сообществе" : "В сообществе пока нет ни одного поста",
        });

        this.renderMembers(data.payload.id);
    }

    renderActions(profileBottom: any, data: any) {
        if (this.profileActions) {
            this.profileActions.innerHTML = '';
            profileBottom.appendChild(this.profileActions);
        } else {
            this.profileActions = createElement({
                parent: profileBottom,
                classes: ['profile__actions']
            });
        }

        if (data?.payload?.role === "owner") {
            new ButtonComponent(this.profileActions, {
                text: 'Настроить',
                variant: 'secondary',
                size: 'small',
                onClick: () => router.go({ path: `/communities/${data?.payload?.community?.nickname}/edit` }),
            });
        } else {
            this.renderOtherActions(data);
        }
    }

    renderOtherActions(data: any) {
        if (this.profileActions) this.profileActions.innerHTML = '';

        let role = data?.payload?.role;
        if (!role) role = 'not_member';

        const properties = ACTIONS_PROPERTIES[role];
        console.log(role);

        new ButtonComponent(this.profileActions, {
            text: properties[0].text,
            variant: properties[0].variant,
            size: 'small',
            onClick: properties[0].onClick.bind(this, data),
        });
        // new ButtonComponent(this.profileActions, {
        //     icon: properties[1].icon,
        //     variant: "secondary",
        //     size: 'small',
        //     onClick: properties[1].onClick.bind(this, data),
        // });
    }

    createCountedItem(parent: HTMLElement, title: string, value: any) {
        const item = createElement({
            parent,
            classes: ['modal__item-counted']
        });
        createElement({
            parent: item,
            text: value,
            classes: ['modal__count'],
        });
        createElement({
            parent: item,
            text: title
        });

        return item;
    }

    createInfoItem(parent: HTMLElement, icon: string, value: any, isShort: Boolean = false) {
        const item = createElement({
            parent,
            classes: ['profile__detail']
        });
        createElement({
            parent: item,
            classes: ['profile__icon'],
            attrs: {src: `/static/img/${icon}-icon.svg`}
        });
        createElement({
            parent: item,
            classes: [
                'profile__detail-text',
                isShort ? 'profile__detail-text_short' : 'profile__detail-text',
            ],
            text: value
        });

        return item;
    }
}

export default new CommunityView();
