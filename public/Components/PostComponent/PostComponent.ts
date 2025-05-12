import ContextMenuComponent from '@components/ContextMenuComponent/ContextMenuComponent'
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import PostMwComponent from '@components/UI/ModalWindowComponent/PostMwComponent';
import DeleteMwComponent from '@components/UI/ModalWindowComponent/DeleteMwComponent';
import getTimeDifference from '@utils/getTimeDifference';
import createElement from '@utils/createElement';
import { getLsItem } from '@utils/localStorage';
import Ajax from '@modules/ajax';
import router from '@router';
import insertIcon from '@utils/insertIcon';
import API from '@utils/api';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import PicsViewerComponent from '@components/PicsViewerComponent/PicsViewerComponent';


const AUTHOR_AVATAR_SIZE = 's';
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const ADD_TO_FRIENDS_BTN_TEXT = 'Добавить в друзья';
const ACCEPT_BTN_TEXT = "Принять заявку";
const AUTHOR_NAME_DATE_DIVIDER = '•';
const DEAFULT_IMG_ALT = 'post image';
const DISPLAYED_ACTIONS = [
    'like',
    // 'comment',
    // 'repost'
];
const RELATION_STRANGER = "stranger";
const RELATION_FOLLOWED_BY = "followed_by";
const SLIDER_RESPONSIVITY = 50;
const DISPLAYED_RELATIONS = [RELATION_STRANGER, RELATION_FOLLOWED_BY];
const ADMINS_USERNAMES = [
    "rvasutenko",
    "Nikita"
];


export default class PostComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private picWidth: number;
    private isLiked: boolean;

    wrapper: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: Record<string, any>) {
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
        if (this.renderPics()) {
            this.renderActions();
            this.renderText();
        } else {
            this.renderText();
            this.renderActions();
        }
    }

    renderPics(): boolean {
        if (!this.config.pics || this.config.pics.length === 0) return false;

        const picsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__pics'],
        });

        const slider = createElement({
            parent: picsWrapper,
            classes: ['post__slider'],
        });

        if (this.config.pics && this.config.pics.length > 0) {
            this.config.pics.forEach((pic: any) => {
                const slide = createElement({
                    parent: slider,
                    classes: ['post__slide'],
                });
                createElement({
                    parent: slide,
                    classes: ['post__pic'],
                    attrs: {
                        src: pic,
                        alt: DEAFULT_IMG_ALT,
                        loading: "lazy",
                    }
                });
            });
        }

        slider.addEventListener('click', () => {
            new PicsViewerComponent({
                picsWrapper: slider,
            });
        });

        this.renderPaginator(picsWrapper, slider);

        return true;
    }

    private renderPaginator(picsWrapper: HTMLElement, slider: HTMLElement) {
        let currentIndex = 0;
        const totalPics = this.config.pics.length;
        this.picWidth = picsWrapper.clientWidth;

        if (totalPics > 1) {
            const paginator = createElement({
                parent: picsWrapper,
                classes: ['post__paginator'],
                text: `${currentIndex + 1}/${totalPics}`
            });

            const prevBtn = createElement({
                parent: picsWrapper,
                classes: ['post__nav', 'post__nav_prev', 'hidden'],
            });

            createElement({
                parent: prevBtn,
                attrs: {src: '/static/img/prev-arrow-icon.svg'}
            });

            const nextBtn = createElement({
                parent: picsWrapper,
                classes: ['post__nav', 'post__nav_next'],
            });

            createElement({
                parent: nextBtn,
                attrs: {src: '/static/img/next-arrow-icon.svg'}
            });

            const updateSlider = () => {
                slider.style.transform = `translateX(-${currentIndex * this.picWidth}px)`;
                paginator.innerText = `${currentIndex + 1}/${totalPics}`;
                prevBtn.classList.toggle('hidden', currentIndex === 0);
                nextBtn.classList.toggle('hidden', currentIndex === totalPics - 1);
                
                prevTranslate = -currentIndex * this.picWidth;
            };
            
            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateSlider();
                }
            });
    
            nextBtn.addEventListener('click', () => {
                if (currentIndex < totalPics - 1) {
                    currentIndex++;
                    updateSlider();
                }
            });

            // --- SWIPE / DRAG HANDLING ---
            let startX = 0;
            let startY = 0;
            let currentTranslate = 0;
            let prevTranslate = 0;
            let isDragging = false;
            let isHorizontalSwipe = false;

            const pointerDown = (x: number, y: number) => {
                startX = x;
                startY = y;
                isDragging = true;
                isHorizontalSwipe = false;
                currentTranslate = prevTranslate;
                slider.style.transition = 'none';
            };
            

            const pointerMove = (x: number, y: number) => {
                if (!isDragging) return;
            
                const dx = x - startX;
                const dy = y - startY;
            
                // Определяем направление свайпа
                if (!isHorizontalSwipe && Math.abs(dx) > 5) {
                    isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
                }
            
                // Если свайп вертикальный — ничего не делаем
                if (!isHorizontalSwipe) return;
            
                currentTranslate = prevTranslate + dx;
                slider.style.transform = `translateX(${currentTranslate}px)`;
            };

            const pointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
            
                if (!isHorizontalSwipe) return;
            
                const movedBy = currentTranslate - prevTranslate;
            
                if (movedBy < -SLIDER_RESPONSIVITY && currentIndex < totalPics - 1) currentIndex++;
                if (movedBy > SLIDER_RESPONSIVITY && currentIndex > 0) currentIndex--;
            
                slider.style.transition = 'transform 0.3s ease';
                updateSlider();
                prevTranslate = -currentIndex * this.picWidth;
            };

            // Mouse
            slider.addEventListener('mousedown', (e) => pointerDown(e.clientX, e.clientY));
            slider.addEventListener('mousemove', (e) => pointerMove(e.clientX, e.clientY));
            slider.addEventListener('mouseup', pointerUp);
            slider.addEventListener('mouseleave', pointerUp);

            // Touch
            picsWrapper.addEventListener('touchstart', (e) => 
                pointerDown(e.touches[0].clientX, e.touches[0].clientY),
            {
                passive: false
            });
            
            picsWrapper.addEventListener('touchmove', (e) => 
                pointerMove(e.touches[0].clientX, e.touches[0].clientY)
            );
            
            picsWrapper.addEventListener('touchend', pointerUp);
            picsWrapper.addEventListener('touchcancel', pointerUp);

            // Disable image dragging
            slider.querySelectorAll('img').forEach(img => {
                img.setAttribute('draggable', 'false');
            });
        }
    }

    renderActions() {
        const actionsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__actions'],
        });

        const countedActions = createElement({
            parent: actionsWrapper,
            classes: ['post__actions_counted'],
        });

        for (const key of DISPLAYED_ACTIONS) {
            const isLiked = key === 'like' && this.isLiked;

            const actionWrapper = createElement({
                parent: countedActions,
                classes: [
                    isLiked ? 'post__action_liked' : 'post__action',
                    `js-post-action-${key}`,
                ],
            });

            insertIcon(actionWrapper, {
                name: isLiked ? `${key}-fill-icon` : `${key}-icon`,
                classes: [
                    isLiked ? 'post__action-icon_liked' : 'post__action-icon',
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

        this.addActionsListeners(actionsWrapper);
    }

    private addActionsListeners(actionsWrapper: HTMLElement) {
        const like = actionsWrapper.querySelector('.js-post-action-like') as HTMLElement;
        // const comment = actionsWrapper.querySelector('.js-post-action-comment');
        // const repost = actionsWrapper.querySelector('.js-post-action-repost');
        // const bookmark = actionsWrapper.querySelector('.js-post-action-bookmark');

        like.addEventListener('click', () => this.handleLike(like));
    }

    private async handleLike(like: HTMLElement) {
        let status: number;

        const oldIsLiked = this.isLiked;

        this.isLiked = !this.isLiked;
        this.toggleLike(like);

        if (oldIsLiked) {
            status = await API.removeLike(this.config.id)
            switch (status) {
                case 204:
                    // this.isLiked = false;
                    break;
                default:
                    this.isLiked = true;
                    this.toggleLike(like);
                    this.renderNetworkErrorPopUp();
                    break;
            }
        } else {
            status = await API.putLike(this.config.id);
            switch (status) {
                case 204:
                    // this.isLiked = true;
                    break;
                default:
                    this.isLiked = false;
                    this.toggleLike(like);
                    this.renderNetworkErrorPopUp();
                    break;
            }
        }
    }

    private renderNetworkErrorPopUp() {
        new PopUpComponent({
            icon: 'close-icon',
            size: 'large',
            text: 'Проверьте подключение к интернету',
            isError: true,
        });
    }

    private async toggleLike(like: HTMLElement) {
        const icon: HTMLElement = like.querySelector('.js-post-action-icon-like');
        icon.remove();

        like.classList.toggle('post__action');
        like.classList.toggle('post__action_liked');

        const newIcon: HTMLElement = await insertIcon(like, {
            name: this.isLiked ? 'like-fill-icon' : 'like-icon',
            classes: [
                'post__action-icon',
                'js-post-action-icon-like',
            ],
        });

        if (this.isLiked) {
            newIcon.classList.add('post__action-icon_liked');
            
            newIcon.classList.add('post__action-icon_like-animating');

            newIcon.addEventListener('animationend', () => {
                newIcon.classList.remove('post__action-icon_like-animating');
            }, { once: true });
        }

        const counter: HTMLElement = like.querySelector('.js-post-action-counter-like');

        if (!this.config.is_liked) {
            counter.innerText = this.isLiked ?
                this.config.like_count + 1 :
                this.config.like_count;
        } else {
            counter.innerText = this.isLiked ?
                this.config.like_count :
                this.config.like_count - 1;
        }
    }

    renderText() {
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

    renderTop() {
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

        if (DISPLAYED_RELATIONS.includes(this.config?.author?.relation)) {
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

        // const dropdown = createElement({
        //     classes: ['js-dropdown', 'dropdown'],
        //     parent: topWrapper,
        // });

        // const optionsWrapper = createElement({
        //     classes: ['post__options'],
        //     parent: dropdown,
        // });

        // createElement({
        //     classes: ['post__options-icon'],
        //     parent: optionsWrapper,
        // });

        const data: Record<string, object> = {
            // copyLink: {
            //     href: '/copy-link',
            //     text: 'Скопировать ссылку',
            //     icon: 'copy-icon',
            // },
        };

        if (
            this.config?.author?.username === getLsItem('username', '') ||
            this.config?.author?.owner?.username === getLsItem('username', '') ||
            ADMINS_USERNAMES.includes(getLsItem('username', ''))
        ) {
            const dropdown = createElement({
                classes: ['js-dropdown', 'dropdown'],
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

    actionCbOk() {
        const actions = Array.from(
            document.getElementsByClassName(`js-post-action-${this.config?.author?.username}`)
        );
        for (const action of actions) {
            action.remove()
        };
    }

    ajaxDeletePost(id: any) {
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

    onAjaxEditPost(config: any) {
        this.config = config;
        this.config.position = "same";
        this.render();
    }
}
