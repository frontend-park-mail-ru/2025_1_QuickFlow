import Ajax from '@modules/ajax';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import FeedComponent from '@components/FeedComponent/FeedComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ProfileInfoMwComponent from '@components/UI/ModalWindowComponent/ProfileInfoMwComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import CoverComponent from '@components/CoverComponent/CoverComponent';
import router from '@router';


export const profileDataLayout = {
    username: {icon: 'at'},
    birth_date: {icon: 'gift'},
    bio: {icon: 'profile-primary'},

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
            onClick: function(data: any) {
                Ajax.post({
                    url: '/follow',
                    body: { receiver_id: data.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                data.relation = "following";
                                this.renderOtherActions(data)
                                break;
                        }
                    },
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: function(data: any) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    following: [{
            text: "Вы подписаны",
            variant: "secondary",
            onClick: function(data: any) {
                Ajax.delete({
                    url: '/follow',
                    body: { friend_id: data.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                data.relation = "stranger";
                                this.renderOtherActions(data)
                                break;
                        }
                    },
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: function(data: any) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    followed_by: [{
            text: "Подписан на вас",
            variant: "primary",
            onClick: function(data: any) {
                Ajax.post({
                    url: '/followers/accept',
                    body: { receiver_id: data.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                data.relation = "friend";
                                this.renderOtherActions(data)
                                break;
                        }
                    },
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: function(data: any) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    friend: [{
            text: "Сообщение",
            variant: "primary",
            onClick: function(data: any) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        },
        {
            icon: "/static/img/user-added-icon.svg",
            onClick: function(data: any) {
                Ajax.delete({
                    url: '/friends',
                    body: { friend_id: data.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                data.relation = "followed_by";
                                this.renderOtherActions(data)
                                break;
                        }
                    },
                });
            },
        }],
};


class ProfileView {
    #containerObj: MainLayoutComponent | null = null;
    #profileActions: HTMLElement | null = null;
    constructor() {}

    render(params: any) {
        this.#containerObj = new MainLayoutComponent().render({
            type: 'profile',
        });

        const username = params?.username || getLsItem('username', '');

        Ajax.get({
            url: `/profiles/${username}`,
            callback: (status: number, userData: any) => {
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

        return this.#containerObj.container;
    }

    renderFriends(user_id: any) {
        Ajax.get({
            url: '/friends',
            params: { count: 8, offset: 0, user_id },
            callback: (status: number, friendsData: any) => {
                switch (status) {
                    case 200:
                        this.friendsCbOk(friendsData.body);
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
    }

    friendsCbOk(data: any) {
        if (!data.friends || data.friends.length === 0) return;

        const friendsWrapper = createElement({
            parent: this.#containerObj?.right,
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

        data.friends.forEach((
            { username, firstname, avatar_url }: {username: string, firstname: string, avatar_url: string}
        ) => {
            const friend = createElement({
                tag: 'a',
                parent: profileFriends,
                classes: ['profile__friend'],
                attrs: { href: `/profiles/${username}` },
            });

            new AvatarComponent(friend, {
                size: 'xl',
                src: avatar_url,
            });

            createElement({
                parent: friend,
                text: firstname,
                classes: ['profile__friend-name']
            });
        });
    }

    cbOk(data: any) {
        const profileHeader = createElement({
            parent: this.#containerObj?.top,
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
            classes: ['profile__name']
        });

        const fullInfo = createElement({
            parent: profileInfo,
            classes: ['profile__details']
        });

        this.createInfoItem(
            fullInfo,
            profileDataLayout['username'].icon,
            data.profile.username,
            true
        );

        const moreInfo = this.createInfoItem(
            fullInfo,
            profileDataLayout['more'].icon,
            profileDataLayout['more'].text,
            true
        );
        
        moreInfo.classList.add('profile__detail_more');

        moreInfo.addEventListener('click', () => {
            new ProfileInfoMwComponent(this.#containerObj?.container, {
                data,
                createInfoItem: this.createInfoItem,
                createCountedItem: this.createCountedItem
            })
        });

        this.renderActions(profileBottom, data);

        new FeedComponent(this.#containerObj?.left, {
            getUrl: `/profiles/${data.profile.username}/posts`,
            hasCreateButton: data.relation === "self" ? true : false,
            emptyStateText: data.relation === "self" ? "Напишите свой первый пост" : "Пользователь пока не опубликовал ни одного поста",
        });

        this.renderFriends(data.id);
    }

    renderActions(profileBottom: any, data: any) {
        if (this.#profileActions) {
            this.#profileActions.innerHTML = '';
            profileBottom.appendChild(this.#profileActions);
        } else {
            this.#profileActions = createElement({
                parent: profileBottom,
                classes: ['profile__actions']
            });
        }

        if (data.relation === "self") {
            new ButtonComponent(this.#profileActions, {
                text: 'Редактировать профиль',
                variant: 'secondary',
                size: 'small',
                onClick: () => router.go({ path: '/profile/edit' }),
            });
        } else if (Object.keys(ACTIONS_PROPERTIES).includes(data.relation)) {
            this.renderOtherActions(data);
        }
    }

    renderOtherActions(data: any) {
        if (this.#profileActions) this.#profileActions.innerHTML = '';

        const relation = data.relation as keyof typeof ACTIONS_PROPERTIES;
        const properties = ACTIONS_PROPERTIES[relation];

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

export default new ProfileView();
