import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';
import createElement from '../../utils/createElement.js';
import { profileFriends } from '../../mocks.js';
import { getLsItem } from '../../utils/localStorage.js';
import CoverComponent from '../../Components/CoverComponent/CoverComponent.js';
import router from '../../Router.js';


const POSTS_COUNT = 10;

export const profileDataLayout = {
    username: {icon: 'at'},
    birth_date: {icon: 'gift'},

    city: {icon: 'location'},
    email: {icon: 'envelope'},
    phone: {icon: 'phone'},

    school_city: {icon: "location"},
    school_name: {icon: "diploma"},

    univ_city: {icon: "location"},
    univ_name: {icon: "diploma"},
    faculty: {icon: "diploma"},
    grad_year: {icon: "diploma"},

    friends: {text: 'друзей'},
    subscribers: {text: 'подписчиков'},
    subscribes: {text: 'подписок'},

    more: {
        icon: 'info',
        text: 'Подробнее',
    }
};

const ACTIONS_PROPERTIES = {
    stranger: [{
            text: "Добавить в друзья",
            variant: "primary",
            onClick: function(data) {
                Ajax.post({
                    url: '/follow',
                    body: { receiver_id: data.id },
                    callback: () => {}
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: function(data) {
                router.go({ path: `/messenger/${data.profile.username}` });
            },
        }],
    following: [{
            text: "Вы подписаны",
            variant: "secondary",
            onClick: function(data) {
                Ajax.delete({
                    url: '/follow',
                    body: { friend_id: data.id },
                    callback: () => {}
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: () => {},
        }],
    followed_by: [{
            text: "Подписан на вас",
            variant: "primary",
            onClick: function(data) {
                Ajax.post({
                    url: '/followers/accept',
                    body: { receiver_id: data.id },
                    callback: () => {}
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: () => {},
        }],
    friend: [{
            text: "Сообщение",
            variant: "primary",
            onClick: () => {},
        },
        {
            icon: "/static/img/user-added-icon.svg",
            onClick: function(data) {
                Ajax.delete({
                    url: '/friends',
                    body: { friend_id: data.id },
                    callback: () => {}
                });
            },
        }],
};


class ProfileView {
    #containerObj
    #profileActions = null;
    constructor() {
        this.#containerObj = null;
    }

    render(params) {
        this.#containerObj = new MainLayoutComponent().render({
            type: 'profile',
        });

        // let username;
        // console.log(params);
        // const path = router.path.split('/').filter(Boolean);
        // username = path.length === 2 ?
        //     path[1] :
        //     getLsItem('username', '');

        const username = params?.username || getLsItem('username', '');

        Ajax.get({
            url: `/profiles/${username}`,
            callback: (status, userData) => {
                switch (status) {
                    case 200:
                        this.cbOk(userData);
                        break;
                    case 401:
                        router.go({ path: '/login' });
                        break;
                    case 404:
                        router.go({ path: '/not-found' });
                        break;
                }
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
            text: '165',
            classes: ['profile__friends-count'],
        });

        const profileFriends = createElement({
            parent: friendsWrapper,
            classes: ['profile__friends-inner'],
        });

        friends.forEach(({ name, avatar }) => {
            const friend = createElement({
                parent: profileFriends,
                classes: ['profile__friend'],
            });

            new AvatarComponent(friend, {
                size: 'xl',
                src: avatar,
            });

            createElement({
                parent: friend,
                text: name,
            });
        });
    }

    renderFeed() {
        const createPostBtn = createElement({
            parent: this.#containerObj.left,
            tag: 'button',
            classes: ['button_feed']
        });
        createElement({
            parent: createPostBtn,
            tag: 'div',
            classes: ['button_feed__icon']
        });
        createElement({
            parent: createPostBtn,
            text: 'Создать пост',
        });

        createPostBtn.addEventListener('click', () => {
            new ModalWindowComponent(this.#containerObj.container, {
                type: 'create-post',
            });
        });

        Ajax.get({
            url: '/feed',
            params: { posts_count: POSTS_COUNT },
            callback: (status, feedData) => {
                this.feedCallback(status, feedData);
            }
        });
    }

    feedCallback(status, feedData) {
        let isAuthorized = status === 200;

        if (!isAuthorized) {
            router.go({ path: '/login' });
            return;
        }

        const postsWrapper = createElement({
            parent: this.#containerObj.left,
            classes: ['feed__posts']
        });

        if (feedData && Array.isArray(feedData)) {
            feedData.forEach((config) => {
                config.container = this.#containerObj.container;
                new PostComponent(postsWrapper, config);
            });
        }
    }

    cbOk(data) {
        const profileHeader = createElement({
            parent: this.#containerObj.top,
            classes: ['profile']
        });

        new CoverComponent(profileHeader, {
            src: data.profile.cover_url,
            type: 'profile',
        });

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile__avatar',
            type: 'status',
            status: {
                online: data.online,
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
            classes: ['profile__name']
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile__details']
        });

        this.createInfoItem(fullInfo, profileDataLayout['username'].icon, data.profile.username);

        const moreInfo = this.createInfoItem(fullInfo, profileDataLayout['more'].icon, profileDataLayout['more'].text);
        moreInfo.classList.add('profile__detail_more');

        moreInfo.addEventListener('click', () => {
            new ModalWindowComponent(this.#containerObj.container, {
                type: 'profile-full-info',
                data,
                createInfoItem: this.createInfoItem,
                createCountedItem: this.createCountedItem
            })
        });

        this.renderActions(profileBottom, data);
    }

    renderActions(profileBottom, data) {
        if (this.#profileActions) {
            this.#profileActions.innerHTML = '';
            profileBottom.appendChild(this.#profileActions);
        } else {
            this.#profileActions = createElement({
                parent: profileBottom,
                classes: ['profile__actions']
            });
        }

        // if (data.profile.username === getLsItem('username', '')) {
        //     new ButtonComponent(this.#profileActions, {
        //         text: 'Редактировать профиль',
        //         variant: 'secondary',
        //         size: 'small',
        //         onClick: () => router.go({ path: '/profile/edit' }),
        //     });
        // } else

        data.relation = "stranger";

        if (Object.keys(ACTIONS_PROPERTIES).includes(data.relation)) {
            const properties = ACTIONS_PROPERTIES[data.relation];
            new ButtonComponent(this.#profileActions, {
                text: properties[0].text,
                variant: properties[0].variant,
                size: 'small',
                onClick: properties[0].onClick.bind(this, data),
            });
            new ButtonComponent(this.#profileActions, {
                icon: properties[1].icon,
                variant: "secondary",
                size: 'small',
                onClick: properties[1].onClick.bind(this, data),
            });
        }
    }

    createCountedItem(parent, title, value) {
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

    createInfoItem(parent, icon, value) {
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
            classes: ['profile__detail-text'],
            text: value
        });

        return item;
    }
}

export default new ProfileView();
