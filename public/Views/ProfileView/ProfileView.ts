import router from '@router';

import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import FeedComponent from '@components/FeedComponent/FeedComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ProfileInfoMwComponent from '@components/UI/ModalWindowComponent/ProfileInfoMwComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import CoverComponent from '@components/CoverComponent/CoverComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import ProfileMenuComponent from '@components/ProfileMenuComponent/ProfileMenuComponent';

import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import insertIcon from '@utils/insertIcon';
import API from '@utils/api';

import { ACTIONS_PROPERTIES, INFO_ITEMS_LAYOUT } from './ProfileActionsConfig';
import { MOBILE_MAX_WIDTH } from '@config';


const MOBILE_MAX_DISPLAYED_FRIENDS_COUNT = 3;


class ProfileView {
    private containerObj: MainLayoutComponent | null = null;
    private profileActions: HTMLElement | null = null;
    private isMobile: boolean;

    constructor() {
        this.isMobile = window.innerWidth <= MOBILE_MAX_WIDTH;
    }

    async render(params: Record<string, any>) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'profile',
        });

        const username = params?.username || getLsItem('username', '');

        const [status, profileData] = await API.getProfile(username);
        switch (status) {
            case 200:
                this.cbOk(profileData);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
            case 404:
                router.go({ path: '/not-found' });
                break;
        }

        return this.containerObj.container;
    }

    renderFriends(user_id: string) {
        API.getFriends(user_id, 8, 0).then(([status, friendsData]) => {
            switch (status) {
                case 200:
                    this.friendsCbOk(friendsData.payload);
                    break;
                case 401:
                    router.go({ path: '/login' });
                    break;
                case 404:
                    router.go({ path: '/not-found' });
                    break;
            }
        });
    }

    friendsCbOk(data: Record<string, any>) {
        if (!data.friends || data.friends.length === 0) return;

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
            text: 'Друзья',
        });

        createElement({
            parent: top,
            text: data.total_count,
            classes: ['profile__friends-count'],
        });

        const profileFriends = createElement({
            parent: friendsWrapper,
            classes: ['profile__friends-inner'],
        });

        for (const friendData of data.friends) {
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

    cbOk(data: Record<string, any>) {
        const profileHeader = createElement({
            parent: this.containerObj?.top,
            classes: ['profile']
        });

        new CoverComponent(profileHeader, {
            src: data.profile.cover_url,
            type: 'profile',
        });

        if (this.isMobile) {
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
    
            new ProfileMenuComponent(profileMenu, {
                userData: data,
            });
        }

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile__avatar',
            type: 'status',
            status: {
                online: data.relation === "self" ? true : data.online,
                lastSeen: data.last_seen,
            },
            src: data.profile.avatar_url,
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
            text: `${data.profile.firstname} ${data.profile.lastname}`,
            classes: ['profile__name'],
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile__details']
        });

        const usernameItem = this.createInfoItem(
            fullInfo,
            INFO_ITEMS_LAYOUT['username'].icon,
            data.profile.username,
            true
        );
        usernameItem.classList.add('profile__detail_more');

        usernameItem.addEventListener("click", () => {
            navigator.clipboard.writeText(data.profile.username)
            .then(() => {
                new PopUpComponent({
                    text: 'Текст скопирован в буфер обмена',
                    icon: "copy-green-icon",
                });
            })
            .catch((error) => {
                console.error('Error:', error);
            });
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
                createCountedItem: this.createCountedItem
            })
        });

        this.renderActions(profileBottom, data);

        new FeedComponent(this.containerObj?.left, {
            getUrl: `/profiles/${data.profile.username}/posts`,
            hasCreateButton: data.relation === "self" ? true : false,
            emptyStateText: data.relation === "self" ? "Напишите свой первый пост" : "Пользователь пока не опубликовал ни одного поста",
        });

        this.renderFriends(data.id);
    }

    renderActions(profileBottom: HTMLElement, data: Record<string, any>) {
        if (this.profileActions) {
            this.profileActions.innerHTML = '';
            profileBottom.appendChild(this.profileActions);
        } else {
            this.profileActions = createElement({
                parent: profileBottom,
                classes: ['profile__actions']
            });
        }

        if (data.relation === "self") {
            new ButtonComponent(this.profileActions, {
                text: 'Редактировать профиль',
                variant: 'secondary',
                size: 'small',
                onClick: () => router.go({ path: '/profile/edit' }),
            });
        } else if (Object.keys(ACTIONS_PROPERTIES).includes(data.relation)) {
            this.renderOtherActions(data);
        }
    }

    renderOtherActions(data: Record<string, any>) {
        if (this.profileActions) this.profileActions.innerHTML = '';

        const relation = data.relation as keyof typeof ACTIONS_PROPERTIES;
        const properties = ACTIONS_PROPERTIES[relation];

        new ButtonComponent(this.profileActions, {
            text: properties[0].text,
            variant: properties[0].variant,
            size: 'small',
            onClick: properties[0].onClick.bind(this, data),
        });
        new ButtonComponent(this.profileActions, {
            icon: properties[1].icon,
            variant: "secondary",
            size: 'small',
            onClick: properties[1].onClick.bind(this, data),
        });
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

    createInfoItem(parent: HTMLElement, icon: string, value: string, isShort: boolean = false) {
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

export default new ProfileView();
