import Ajax from '../../modules/ajax.js';
import PostComponent from '../../Components/PostComponent/PostComponent.js';
import ModalWindowComponent from '../../Components/UI/ModalWindowComponent/ModalWindowComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';

export default class ProfileView {
    constructor(menu) {
        this.menu = menu;
        this.containerObj = null;
    }

    render() {
        this.containerObj = new MainLayoutComponent({
            type: 'profile',
        });

        const profileHeader = document.createElement('div');
        profileHeader.classList.add('profile-header');
        this.containerObj.top.appendChild(profileHeader);

        const coverWrapper = document.createElement('div');
        coverWrapper.classList.add('profile-cover-wrapper');
        profileHeader.appendChild(coverWrapper);

        const cover = document.createElement('img');
        cover.classList.add('profile-cover');
        cover.src = '/static/img/profile-header.jpg';
        coverWrapper.appendChild(cover);

        new AvatarComponent(profileHeader, {
            size: 'xxxl',
            class: 'profile-avatar',
            status: 'online',
            // status: '39 мин',
        });

        const data = {
            name: 'Илья Мациевский',
            fullInfo: {
                username: {
                    title: 'Имя пользователя',
                    value: 'rvasutenko',
                    icon: 'at'
                },
                birthDate: {
                    title: 'День рождения',
                    value: '2 мая 2005 года',
                    icon: 'gift'
                },
                location: {
                    title: 'Город',
                    value: 'Москва',
                    icon: 'location'
                },
                education: {
                    title: 'Образование',
                    value: 'МГТУ им. Н.Э. Баумана',
                    icon: 'diploma'
                },
                phoneNumber: {
                    title: 'Телефон',
                    value: '+7 (964) 882 64-55',
                    icon: 'phone'
                },
                email: {
                    title: 'Почта',
                    value: 'vasyutenko20050205@mail.ru',
                    icon: 'envelope'
                },
            },
            countedInfo: {
                friends: {
                    title: 'друзей',
                    value: 165,
                },
                subscribers: {
                    title: 'подписчиков',
                    value: 187,
                },
                subscribes: {
                    title: 'подписок',
                    value: 68,
                },
            }
        };

        const profileBottom = document.createElement('div');
        profileBottom.classList.add('profile-bottom');
        profileHeader.appendChild(profileBottom);

        this.renderProfileInfo(profileBottom, data);

        const profileActions = document.createElement('div');
        profileActions.classList.add('profile-actions');
        profileBottom.appendChild(profileActions);

        new ButtonComponent(profileActions, {
            text: 'Редактировать профиль',
            variant: 'secondary',
            size: 'small',
            onClick: () => {
                // TODO: Open window with profile editing form
            },
        });

        this.renderFeed();

        const friends = [
            {
                name: 'Андрей',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Максим',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Ольга',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Анатолий',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Анна',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Лилия',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Максим',
                avatar: 'static/img/avatar.jpg'
            },
            {
                name: 'Ольга',
                avatar: 'static/img/avatar.jpg'
            },
        ];
        this.renderFriends(friends);

        return this.containerObj.container;
    }

    renderFriends(friends) {
        const friendsWrapper = document.createElement('div');
        friendsWrapper.classList.add('profile-friends-wrapper');
        this.containerObj.right.appendChild(friendsWrapper);

        const top = document.createElement('div');
        top.classList.add('profile-friends-top');
        friendsWrapper.appendChild(top);

        const title = document.createElement('div');
        title.classList.add('profile-friends-title');
        title.textContent = 'Друзья';
        top.appendChild(title);

        const count = document.createElement('div');
        count.classList.add('profile-friends-count');
        count.textContent = '165';
        top.appendChild(count);

        const profileFriends = document.createElement('div');
        profileFriends.classList.add('profile-friends');
        friendsWrapper.appendChild(profileFriends);

        friends.forEach(({ name, avatar }) => {
            const friend = document.createElement('div');
            friend.classList.add('profile-friend');
            profileFriends.appendChild(friend);

            new AvatarComponent(friend, {
                size: 'xl',
                src: avatar,    // TODO: make it dynamic
            });

            const friendName = document.createElement('div');
            friendName.classList.add('profile-friend-name');
            friendName.textContent = name;
            friend.appendChild(friendName);
        });
    }

    renderFeed() {
        const createPostBtn = document.createElement('button');
        createPostBtn.classList.add('post-create-btn');
        this.containerObj.left.appendChild(createPostBtn);

        const createPostIcon = document.createElement('img');
        createPostIcon.classList.add('post-create-icon');
        createPostIcon.src = '/static/img/add-icon.svg';
        createPostBtn.appendChild(createPostIcon);

        const createPostText = document.createElement('div');
        createPostText.classList.add('post-create-text');
        createPostText.textContent = 'Создать пост';
        createPostBtn.appendChild(createPostText);

        const postsWrapper = document.createElement('div');
        postsWrapper.classList.add('feed-posts-wrapper');
        this.containerObj.left.appendChild(postsWrapper);

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
                let isAuthorized = status === 200;

                if (!isAuthorized) {
                    this.menu.goToPage(this.menu.menuElements.login);
                    this.menu.updateMenuVisibility(false);
                    return;
                }

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
        });
    }

    renderProfileInfo(parent, data) {
        const profileInfo = document.createElement('div');
        profileInfo.classList.add('profile-info');
        parent.appendChild(profileInfo);

        const name = document.createElement('div');
        name.classList.add('profile-name');
        name.textContent = data.name;
        profileInfo.appendChild(name);

        const fullInfo = document.createElement('div');
        fullInfo.classList.add('profile-info-full');
        profileInfo.appendChild(fullInfo);

        const dataLen = Object.keys(data.fullInfo).length;

        if (data.fullInfo && dataLen > 0 && dataLen <= 2) {
            Object.entries(data.fullInfo).forEach(([, value],) => {
                this.renderInfoItem(fullInfo, value);
            });
        } else if (data.fullInfo && dataLen > 2) {
            this.renderInfoItem(fullInfo, Object.values(data.fullInfo)[0]);
            this.renderInfoItem(fullInfo, {data});
        }

        return profileInfo;
    }

    renderInfoItem(parent, {value, icon, data}) {
        const infoItem = document.createElement('div');
        parent.appendChild(infoItem);

        infoItem.classList.add('profile-info-item');
        if (!value && !icon) {
            infoItem.classList.add('profile-more-info');
            infoItem.addEventListener('click', () => {
                new ModalWindowComponent(this.containerObj.container, {
                    type: 'profile-full-info',
                    data
                })
            });
        }

        const infoIcon = document.createElement('img');
        infoIcon.src = `/static/img/${icon || 'info'}-icon.svg`;
        infoIcon.classList.add('profile-info-icon');
        infoItem.appendChild(infoIcon);

        const infoText = document.createElement('div');
        infoText.classList.add('profile-info-text');
        infoText.textContent = value || 'Подробнее';
        infoItem.appendChild(infoText);
    }
}
