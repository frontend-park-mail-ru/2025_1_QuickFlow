import DeleteMwComponent from '@components/UI/Modals/DeleteMwComponent';
import Ajax from '@modules/ajax';
import router from '@router';
import { User } from 'types/UserTypes';


export const ACTIONS_PROPERTIES = {
    stranger: [{
            text: "Добавить в друзья",
            variant: "primary",
            onClick: function(data: User) {
                Ajax.post({
                    url: '/follow',
                    body: { receiver_id: data.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                data.relation = 'following';
                                this.renderOtherActions(data)
                                break;
                        }
                    },
                });
            },
        },
        {
            icon: "/static/img/messenger-primary-icon.svg",
            onClick: function(data: User) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    following: [{
            text: "Вы подписаны",
            variant: "secondary",
            onClick: function(data: User) {
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
            onClick: function(data: User) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    followed_by: [{
            text: "Подписан на вас",
            variant: "primary",
            onClick: function(data: User) {
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
            onClick: function(data: User) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        }],
    friend: [{
            text: "Сообщение",
            variant: "primary",
            onClick: function(data: User) {
                router.go({
                    path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
                });
            },
        },
        {
            icon: "/static/img/user-added-icon.svg",
            onClick: function(data: User) {
                const deleteFriend = () => Ajax.delete({
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

                new DeleteMwComponent(this.containerObj?.container, {
                    data: {
                        title: `Удаление из друзей`,
                        text: `Вы уверены, что хотите удалить @${data.profile.username} из друзей?`,
                        cancel: 'Отмена',
                        confirm: 'Удалить',
                    },
                    delete: deleteFriend,
                });
            },
        }],
};


export const INFO_ITEMS_LAYOUT = {
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