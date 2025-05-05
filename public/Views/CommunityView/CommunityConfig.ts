import DeleteMwComponent from '@components/UI/ModalWindowComponent/DeleteMwComponent';
import Ajax from '@modules/ajax';
import router from '@router';
import API from '@utils/api';


export const ACTIONS_PROPERTIES = {
    not_member: [{
        text: "Подписаться",
        variant: "primary",
        onClick: async function(data: any) {
            const status = await API.joinCommunity(data.payload.id);
            switch (status) {
                case 200:
                    data.payload.role = "member";
                    this.renderOtherActions(data)
                    break;
            }
        },
    },
    // {
    //     icon: "/static/img/messenger-primary-icon.svg",
    //     onClick: function(data: any) {
    //         router.go({
    //             path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
    //         });
    //     },
    // }
    ],
    member: [{
        text: "Вы подписаны",
        variant: "secondary",
        onClick: async function(data: any) {
            const status = await API.leaveCommunity(data.payload.id);
            switch (status) {
                case 200:
                    data.payload.role = "not_member";
                    this.renderOtherActions(data)
                    break;
            }
        },
    },
    // {
    //     icon: "/static/img/messenger-primary-icon.svg",
    //     onClick: function(data: any) {
    //         router.go({
    //             path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
    //         });
    //     },
    // }
    ]
    // ,
    // followed_by: [{
    //     text: "Подписан на вас",
    //     variant: "primary",
    //     onClick: function(data: any) {
    //         Ajax.post({
    //             url: '/followers/accept',
    //             body: { receiver_id: data.id },
    //             callback: (status: number) => {
    //                 switch (status) {
    //                     case 200:
    //                         data.relation = "friend";
    //                         this.renderOtherActions(data)
    //                         break;
    //                 }
    //             },
    //         });
    //     },
    // },
    // {
    //     icon: "/static/img/messenger-primary-icon.svg",
    //     onClick: function(data: any) {
    //         router.go({
    //             path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
    //         });
    //     },
    // }],
    // friend: [{
    //     text: "Сообщение",
    //     variant: "primary",
    //     onClick: function(data: any) {
    //         router.go({
    //             path: `/messenger/${data.profile.username}?${data?.chat_id ? 'chat_id=' + data?.chat_id : ''}`
    //         });
    //     },
    // },
    // {
    //     icon: "/static/img/user-added-icon.svg",
    //     onClick: function(data: any) {
    //         const deleteFriend = () => Ajax.delete({
    //             url: '/friends',
    //             body: { friend_id: data.id },
    //             callback: (status: number) => {
    //                 switch (status) {
    //                     case 200:
    //                         data.relation = "followed_by";
    //                         this.renderOtherActions(data)
    //                         break;
    //                 }
    //             },
    //         });

    //         new DeleteMwComponent(this.containerObj?.container, {
    //             data: {
    //                 title: `Удаление из друзей`,
    //                 text: `Вы уверены, что хотите удалить @${data.profile.username} из друзей?`,
    //                 cancel: 'Отмена',
    //                 confirm: 'Удалить',
    //             },
    //             delete: deleteFriend,
    //         });
    //     },
    // }],
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