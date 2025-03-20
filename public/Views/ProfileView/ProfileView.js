import Ajax from '../../modules/ajax.js';

import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';

import createElement from '../../utils/createElement.js';

import {profileData, profileFriends} from '../mocks.js';


export default class ProfileView {
    constructor(menu) {
        this.menu = menu;
        this.containerObj = null;
    }

    render() {
        this.containerObj = new MainLayoutComponent({
            type: 'profile',
        });

        const profileHeader = createElement({
            parent: this.containerObj.top,
            classes: ['profile-header']
        });

        const coverWrapper = createElement({
            parent: profileHeader,
            classes: ['profile-cover-wrapper']
        });

        createElement({
            parent: coverWrapper,
            classes: ['profile-cover'],
            attrs: {src: '/static/img/profile-header.jpg'}
        });

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile-avatar',
            status: 'online',
            src: 'avatar.jpg',
            // status: '39 мин',
        });

        const profileBottom = createElement({
            parent: profileHeader,
            classes: ['profile-bottom'],
        });

        const data = profileData; // TODO: надо дергать метод
        this.renderProfileInfo(profileBottom, data);

        const profileActions = createElement({
            parent: profileBottom,
            classes: ['profile-actions'],
        });

        new ButtonComponent(profileActions, {
            text: 'Редактировать профиль',
            variant: 'secondary',
            size: 'small',
            onClick: () => {
                // TODO: Open window with profile editing form
            },
        });

        this.renderFeed();

        const friends = profileFriends; // TODO: надо дергать метод
        this.renderFriends(friends);

        return this.containerObj.container;
    }

    renderFriends(friends) {
        const friendsWrapper = createElement({
            parent: this.containerObj.right,
            classes: ['profile-friends-wrapper'],
        });

        const top = createElement({
            parent: friendsWrapper,
            classes: ['profile-friends-top'],
        });

        createElement({
            parent: top,
            text: 'Друзья',
            classes: ['profile-friends-title'],
        });

        createElement({
            parent: top,
            text: '165',
            classes: ['profile-friends-count'],
        });

        const profileFriends = createElement({
            parent: friendsWrapper,
            classes: ['profile-friends'],
        });

        friends.forEach(({ name, avatar }) => {
            const friend = createElement({
                parent: profileFriends,
                classes: ['profile-friend'],
            });

            new AvatarComponent(friend, {
                size: 'xl',
                src: avatar,
            });

            createElement({
                parent: friend,
                text: name,
                classes: ['profile-friend-name'],
            });
        });
    }

    renderFeed() {
        const createPostBtn = createElement({
            parent: this.containerObj.left,
            tag: 'button',
            classes: ['post-create-btn']
        });
        createElement({
            parent: createPostBtn,
            tag: 'div',
            classes: ['post-create-icon']
        });
        createElement({
            parent: createPostBtn,
            text: 'Создать пост',
            classes: ['post-create-text']
        });

        createPostBtn.addEventListener('click', () => {
            new ModalWindowComponent(this.containerObj.container, {
                type: 'create-post',
            });
        });

        Ajax.get({
            url: '/feed',
            params: {
                posts_count: 10
            },
            callback: (status, feedData) => {
                this.feedCallback(status, feedData);
            }
        });
    }

    feedCallback(status, feedData) {
        let isAuthorized = status === 200;

        if (!isAuthorized) {
            this.menu.goToPage(this.menu.menuElements.login);
            this.menu.updateMenuVisibility(false);
            return;
        }

        const postsWrapper = createElement({
            parent: this.containerObj.left,
            classes: ['feed-posts-wrapper']
        });

        if (feedData && Array.isArray(feedData)) {
            feedData.forEach(({ id, creator_id, text, pics, created_at, like_count, repost_count, comment_count }) => {
                new PostComponent(postsWrapper, {
                    id,
                    creator_id,
                    text,
                    pics,
                    created_at,
                    like_count,
                    repost_count,
                    comment_count,
                });
            });
        }
    }

    renderProfileInfo(parent, data) {   
        const profileInfo = createElement({
            parent,
            classes: ['profile-info']
        });

        createElement({
            parent: profileInfo,
            text: data.name,
            classes: ['profile-name']
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile-info-full']
        });

        const dataLen = Object.keys(data.fullInfo).length;

        if (data.fullInfo && dataLen > 0 && dataLen <= 2) {
            Object.values(data.fullInfo).forEach(({value, icon}) => {
                const item = createElement({
                    parent: fullInfo,
                    classes: ['profile-info-item']
                });  
                createElement({
                    parent: item,
                    classes: ['profile-info-icon'],
                    attrs: {src: `/static/img/${icon}-icon.svg`}
                });
                createElement({
                    parent: item,
                    text: value,
                    classes: ['profile-info-text']
                }); 
            });
        } else if (data.fullInfo && dataLen > 2) {
            const item = createElement({
                parent: fullInfo,
                classes: ['profile-info-item']
            });
            createElement({
                parent: item,
                classes: ['profile-info-icon'],
                attrs: {src: `/static/img/${data.fullInfo.username.icon}-icon.svg`}
            });
            createElement({
                parent: item,
                text: data.fullInfo.username.value,
                classes: ['profile-info-text']
            });

            const moreInfo = createElement({
                parent: fullInfo,
                classes: ['profile-info-item', 'profile-more-info']
            });
            createElement({
                parent: moreInfo,
                classes: ['profile-info-icon'],
                attrs: {src: '/static/img/info-icon.svg'}
            });
            createElement({
                parent: moreInfo,
                text: 'Подробнее',
                classes: ['profile-info-text']
            });

            moreInfo.addEventListener('click', () => {
                new ModalWindowComponent(this.containerObj.container, {
                    type: 'profile-full-info',
                    data
                })
            });
        }

        return profileInfo;
    }
}
