import Ajax from '../../modules/ajax.js';
import EditProfileView from '../EditProfileView/EditProfileView.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';
import {profileFriends} from '../mocks.js';


export const profileDataLayout = {
    username: {icon: 'at'},

    birthDate: {icon: 'gift'},
    location: {icon: 'location'},
    education: {icon: 'diploma'},
    phoneNumber: {icon: 'phone'},
    email: {icon: 'envelope'},

    friends: {text: 'друзей'},
    subscribers: {text: 'подписчиков'},
    subscribes: {text: 'подписок'},

    more: {
        icon: 'info',
        text: 'Подробнее',
    }
};


export default class ProfileView {
    #menu
    #containerObj
    constructor(menu) {
        this.#menu = menu;
        this.#containerObj = null;
    }

    render() {
        this.#containerObj = new MainLayoutComponent({
            type: 'profile',
        });

        Ajax.get({
            url: '/user',
            callback: (status, userData) => {
                let isAuthorized = status === 200;
    
                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }

                this.renderProfileInfo(userData);
            }
        });

        this.renderFeed();

        const friends = profileFriends; // TODO: надо дергать метод
        this.renderFriends(friends);

        return this.#containerObj.container;
    }

    renderFriends(friends) {
        const friendsWrapper = createElement({
            parent: this.#containerObj.right,
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
            parent: this.#containerObj.left,
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
            new ModalWindowComponent(this.#containerObj.container, {
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
            this.#menu.goToPage(this.#menu.menuElements.login);
            this.#menu.updateMenuVisibility(false);
            return;
        }

        const postsWrapper = createElement({
            parent: this.#containerObj.left,
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

    renderProfileInfo(data) { 
        const profileHeader = createElement({
            parent: this.#containerObj.top,
            classes: ['profile-header']
        });

        const coverWrapper = createElement({
            parent: profileHeader,
            classes: ['profile-cover-wrapper']
        });

        createElement({
            parent: coverWrapper,
            classes: ['profile-cover'],
            attrs: {src: data.cover}
        });

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile-avatar',
            type: 'status',
            src: data.avatar,
        });

        const profileBottom = createElement({
            parent: profileHeader,
            classes: ['profile-bottom'],
        });

        const profileInfo = createElement({
            parent: profileBottom,
            classes: ['profile-info']
        });

        createElement({
            parent: profileInfo,
            text: `${data.firstname} ${data.lastname}`,
            classes: ['profile-name']
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile-info-full']
        });

        this.createInfoItem(fullInfo, profileDataLayout['username'].icon, data.username);

        if (data.additionalData) {
            const moreInfo = this.createInfoItem(fullInfo, profileDataLayout['more'].icon, profileDataLayout['more'].text);
            moreInfo.classList.add('profile-more-info');

            moreInfo.addEventListener('click', () => {
                new ModalWindowComponent(this.#containerObj.container, {
                    type: 'profile-full-info',
                    data,
                    createInfoItem: this.createInfoItem,
                    createCountedItem: this.createCountedItem
                })
            });
        }

        const profileActions = createElement({
            parent: profileBottom,
            classes: ['profile-actions'],
        });

        new ButtonComponent(profileActions, {
            text: 'Редактировать профиль',
            variant: 'secondary',
            size: 'small',
            onClick: () => new EditProfileView(this.#containerObj, this.#menu).render(),
        });
    }

    createCountedItem(parent, title, value) {
        const item = createElement({
            parent,
            classes: ['modal-window-item-counted']
        });
        createElement({
            parent: item,
            text: value,
            classes: ['modal-window-count'],
        });
        createElement({
            parent: item,
            classes: ['profile-info-text'],
            text: title
        });

        return item;
    }

    createInfoItem(parent, icon, value) {
        const item = createElement({
            parent,
            classes: ['profile-info-item']
        });
        createElement({
            parent: item,
            classes: ['profile-info-icon'],
            attrs: {src: `/static/img/${icon}-icon.svg`}
        });
        createElement({
            parent: item,
            classes: ['profile-info-text'],
            text: value
        });

        return item;
    }
}
