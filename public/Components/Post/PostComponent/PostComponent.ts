import ContextMenuComponent, { OptionConfig } from '@components/ContextMenuComponent/ContextMenuComponent'
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import PostMwComponent from '@components/UI/Modals/PostMwComponent';
import DeleteMwComponent from '@components/UI/Modals/DeleteMwComponent';
import getTimeDifference from '@utils/getTimeDifference';
import createElement from '@utils/createElement';
import Ajax from '@modules/ajax';
import router from '@router';
import insertIcon from '@utils/insertIcon';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import PicsViewerComponent from '@components/PicsViewerComponent/PicsViewerComponent';
import { PostsRequests } from '@modules/api';
import copyToClipboard from '@utils/copyToClipboard';
import LsProfile from '@modules/LsProfile';
import CommentsComponent from '../CommentsComponent/CommentsComponent';
import LikeComponent from '../LikeComponent/LikeComponent';
import SwiperComponent from '@components/SwiperComponent/SwiperComponent';
import { Comment, CommunityPost, Post, UserPost } from 'types/PostTypes';
import VideoComponent from '@components/UI/VideoComponent/VideoComponent';


const AUTHOR_AVATAR_SIZE = 's';
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const ADD_TO_FRIENDS_BTN_TEXT = 'Добавить в друзья';
const ACCEPT_BTN_TEXT = "Принять заявку";
const AUTHOR_NAME_DATE_DIVIDER = '•';
const DEAFULT_IMG_ALT = 'post image';
const DISPLAYED_ACTIONS = [
    'like',
    'comment',
    // 'repost'
];
const RELATION_STRANGER = "stranger";
const RELATION_FOLLOWED_BY = "followed_by";
const DISPLAYED_RELATIONS = [RELATION_STRANGER, RELATION_FOLLOWED_BY];
const ADMINS_USERNAMES = [
    "rvasutenko",
    "Nikita"
];


type PostConfig = (UserPost | CommunityPost) & {
    position: 'top' | 'bottom' | 'same';
};



export default class PostComponent {
    private parent: HTMLElement;
    private config: PostConfig;

    private isLiked: boolean;
    public wrapper: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: PostConfig) {
        this.parent = parent;
        this.config = config;
        this.isLiked = this.config.is_liked;
        this.render();
    }

    render() {
        let referenceNode: ChildNode | null = null;

        if (this.wrapper) {
            referenceNode = this.wrapper.nextSibling;
            this.wrapper.remove();
        }

        this.wrapper = createElement({
            classes: ['post'],
            attrs: { 'data-id': this.config?.id },
        });

        switch (this.config?.position) {
            case "top":
                this.parent.prepend(this.wrapper);
                break;
            case "same":
                if (referenceNode) {
                    this.parent.insertBefore(this.wrapper, referenceNode);
                } else {
                    this.parent.appendChild(this.wrapper);
                }
                break;
            default:
                this.parent.appendChild(this.wrapper);
                break;
        }

        this.renderTop();
        this.renderMedia();
        this.renderFiles();
        this.renderText();
        this.renderActions();

        new CommentsComponent(this.wrapper, {
            postId: this.config?.id,
            lastData: this.config?.last_comment,
            commentsCount: this.config?.comment_count,
        });
    }

    private renderFiles() {
        // for (const file of this.config.files) {

        // }
    }

    private renderMedia() {
        if (!this.config.media || !this.config.media.length) {
            return;
        }

        const picsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__pics'],
        });

        const slider = createElement({
            parent: picsWrapper,
            classes: ['post__slider'],
        });

        if (this.config.media && this.config.media.length > 0) {
            this.config.media.forEach((mediaUrl: string) => {
                const slide = createElement({
                    parent: slider,
                    classes: ['post__slide'],
                });

                if (mediaUrl.endsWith('.mp4')) {
                    new VideoComponent(slide, {
                        src: mediaUrl,
                        classes: ['post__pic'],
                        loop: true,
                        autoplay: true,
                        muted: true,
                        playsInline: true,
                    });
                    return;
                }

                createElement({
                    parent: slide,
                    classes: ['post__pic'],
                    attrs: {
                        src: mediaUrl,
                        alt: DEAFULT_IMG_ALT,
                        loading: "lazy",
                    }
                });
            });
        }

        const swiper = new SwiperComponent(null, {
            slider,
            picsWrapper,
            picsCount: this.config.media.length,
            hasPaginator: true,
            isHandlingMouse: true,
            isHandlingTouch: true,
        });

        slider.addEventListener('click', (e) => {
            if (
                (!(e.target instanceof HTMLImageElement) &&
                !(e.target instanceof HTMLVideoElement)) ||
                swiper.wasDragging
            ) return;

            new PicsViewerComponent({
                picsWrapper: slider,
                target: e.target,
            });
        });
    }

    private renderActions() {
        const actionsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__actions'],
        });

        const countedActions = createElement({
            parent: actionsWrapper,
            classes: ['post__actions_counted'],
        });

        for (const key of DISPLAYED_ACTIONS) {
            if (key === 'like') {
                new LikeComponent(countedActions, {
                    isLiked: this.isLiked,
                    targetId: this.config.id,
                    likeCount: this.config.like_count,
                    putMethod: PostsRequests.putLike,
                    removeMethod: PostsRequests.removeLike,
                });
                continue;
            }

            const actionWrapper = createElement({
                parent: countedActions,
                classes: [
                    'post__action',
                    `js-post-action-${key}`,
                ],
            });

            insertIcon(actionWrapper, {
                name: `${key}-icon`,
                classes: [
                    'post__action-icon',
                    'post__action-icon',
                    `js-post-action-icon-${key}`,
                ],
            });

            createElement({
                parent: actionWrapper,
                classes: [
                    'post__counter',
                    `js-post-action-counter-${key}`,
                ],
                text: this.config[`${key}_count`].toString(),
            });
        }

        // insertIcon(actionsWrapper, {
        //     name: 'bookmark-icon',
        //     classes: [
        //         'post__action-icon',
        //         'js-post-action-bookmark',
        //     ],
        // });
    }

    private renderText() {
        if (!this.config.text) {
            return;
        }

        const textWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__content'],
        });

        const text = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['post__text'],
            text: this.config.text,
        });

        const readMore = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['post__more'],
            text: READ_MORE_BTN_TEXT,
            attrs: {style: 'display: none;'}
        });

        // После рендеринга проверяем, обрезается ли текст
        requestAnimationFrame(() => {
            if (text.scrollHeight > text.clientHeight) {
                readMore.style.display = 'inline-block';
            }
        });

        // Добавляем обработчик клика для разворачивания и сворачивания текста
        readMore.addEventListener('click', () => {
            if (text.classList.contains('post__text_expanded')) {
                text.classList.remove('post__text_expanded');
                readMore.textContent = READ_MORE_BTN_TEXT;
            } else {
                text.classList.add('post__text_expanded');
                readMore.textContent = READ_LESS_BTN_TEXT;
            }
        });
    }

    private renderTop() {
        const topWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__header'],
        });

        const authorWrapper = createElement({
            parent: topWrapper,
            classes: ['post__author'],
        });

        new AvatarComponent(authorWrapper, {
            size: AUTHOR_AVATAR_SIZE,
            src: this.config?.author_type === 'community' ?
                this.config?.author?.community?.avatar_url :
                this.config?.author?.avatar_url,
            href: this.config?.author_type === 'community' ?
                `/communities/${this.config?.author?.community?.nickname}` :
                `/profiles/${this.config?.author?.username}`,
        });

        const topRightWrapper = createElement({
            parent: authorWrapper,
            classes: ['post__author-info'],
        });

        const nameDateWrapper = createElement({
            parent: topRightWrapper,
            classes: ['post__info'],
        });

        createElement({
            tag: 'a',
            parent: nameDateWrapper,
            classes: ['post__name'],
            attrs: {
                href: this.config?.author_type === 'community' ?
                    `/communities/${this.config?.author?.community?.nickname}` :
                    `/profiles/${this.config?.author?.username}`,
            },
            text: this.config?.author_type === 'community' ?
                this.config?.author?.community?.name :
                `${this.config?.author?.firstname} ${this.config?.author?.lastname}`,
        });

        createElement({
            classes: ['post__date', 'p1'],
            parent: nameDateWrapper,
            text: AUTHOR_NAME_DATE_DIVIDER,
        });

        createElement({
            classes: ['post__date', 'p1'],
            parent: nameDateWrapper,
            text: `${getTimeDifference(this.config?.created_at)}`,
        });

        if (
            this.config?.author_type === 'user' &&
            DISPLAYED_RELATIONS.includes(this.config?.author?.relation)
        ) {
            const isStranger = this.config?.author?.relation === RELATION_STRANGER;
            const actionBtn = createElement({
                tag: 'a',
                classes: [
                    'h3',
                    'post__add-to-friends',
                    `js-post-action-${this.config?.author?.username}`,
                ],
                parent: topRightWrapper,
                text: isStranger ? ADD_TO_FRIENDS_BTN_TEXT : ACCEPT_BTN_TEXT,
            });
            actionBtn.addEventListener('click', () => {
                Ajax.post({
                    url: isStranger ? '/follow' : '/followers/accept',
                    body: { receiver_id: this.config?.author?.id },
                    callback: (status: number) => {
                        switch (status) {
                            case 200:
                                this.actionCbOk();
                                break;
                        }
                    },
                });
            });
        }

        const data: Record<string, OptionConfig> = {
            copyLink: {
                href: '/copy-link',
                text: 'Скопировать ссылку',
                icon: 'copy-icon',
                onClick: () => {
                    copyToClipboard(
                        `${window.location.origin}/posts/${this.config?.id}`,
                        () => {
                            new PopUpComponent({
                                text: 'Текст скопирован в буфер обмена',
                                icon: "copy-green-icon",
                            });
                        }
                    );
                }
            },
        };

        if (
            (this.config.author_type === 'user' && this.config?.author?.username === LsProfile.username) ||
            (this.config.author_type === 'community' && this.config?.author?.owner?.username === LsProfile.username) ||
            ADMINS_USERNAMES.includes(LsProfile.username)
        ) {
            const dropdown = createElement({
                classes: ['dropdown'],
                parent: topWrapper,
            });
    
            const optionsWrapper = createElement({
                classes: ['post__options'],
                parent: dropdown,
            });
    
            createElement({
                classes: ['post__options-icon'],
                parent: optionsWrapper,
            });

            data.edit = {
                href: '/edit',
                text: 'Редактировать',
                icon: 'pencil-primary-icon',
                onClick: () => {
                    new PostMwComponent(this.parent.parentNode as HTMLElement, {
                        type: 'edit-post',
                        data: this.config,
                        onAjaxEditPost: (config: any) => this.onAjaxEditPost(config),
                    });
                },
            };
            data.delete = {
                href: '/delete',
                text: 'Удалить',
                icon: 'trash-accent-icon',
                isCritical: true,
                onClick: () => {
                    new DeleteMwComponent(this.parent.parentNode as HTMLElement, {
                        data: {
                            title: 'Вы уверены, что хотите удалить этот пост?',
                            text: 'Пост будет удалён навсегда, это действие нельзя будет отменить',
                            cancel: 'Отмена',
                            confirm: 'Удалить',
                        },
                        delete: () => this.ajaxDeletePost(this.config?.id),
                    });
                }
            };

            new ContextMenuComponent(dropdown, { data });
        }
        // else {
        //     data.notify = {
        //         href: '/notify',
        //         text: 'Уведомлять о постах',
        //         icon: 'notice-icon',
        //     };
        //     data.notInterested = {
        //         href: '/not-interested',
        //         text: 'Не интересно',
        //         icon: 'cross-circle-icon',
        //     };
        //     data.ban = {
        //         href: '/ban',
        //         text: 'Пожаловаться',
        //         icon: 'ban-icon',
        //         isCritical: true
        //     };
        // }

        // new ContextMenuComponent(dropdown, { data });
    }

    private actionCbOk() {
        if (this.config?.author_type !== 'user') {
            return;
        }

        const actions = Array.from(
            document.getElementsByClassName(`js-post-action-${this.config?.author?.username}`)
        );
        for (const action of actions) {
            action.remove()
        };
    }

    private ajaxDeletePost(id: string) {
        Ajax.delete({
            url: `/posts/${id}`,
            callback: (status: number) => {
                switch (status) {
                    case 401:
                        router.go({ path: '/login' });
                        break;
                    case 200:
                        if (this.wrapper) {
                            this.wrapper.remove();
                        }
                        break;
                }
            }
        });
    }

    private onAjaxEditPost(config: PostConfig) {
        this.config = config;
        this.config.position = "same";
        this.render();
    }
}
