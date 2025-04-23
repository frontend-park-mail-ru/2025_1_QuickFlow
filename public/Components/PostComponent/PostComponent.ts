import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent'
import AvatarComponent from '../AvatarComponent/AvatarComponent';
import PostMwComponent from '../UI/ModalWindowComponent/PostMwComponent';
import DeleteMwComponent from '../UI/ModalWindowComponent/DeleteMwComponent';
import getTimeDifference from '../../utils/getTimeDifference';
import createElement from '../../utils/createElement';
import { getLsItem } from '../../utils/localStorage';
import Ajax from '../../modules/ajax';
import router from '@router';


const AUTHOR_AVATAR_SIZE = 's';
const PICTURE_WIDTH = 553;
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const ADD_TO_FRIENDS_BTN_TEXT = 'Добавить в друзья';
const ACCEPT_BTN_TEXT = "Принять заявку";
const AUTHOR_NAME_DATE_DIVIDER = '•';
const DEAFULT_IMG_ALT = 'post image';
const DISPLAYED_ACTIONS = ['like', 'comment', 'repost'];
const RELATION_STRANGER = "stranger";
const RELATION_FOLLOWED_BY = "followed_by";
const DISPLAYED_RELATIONS = [RELATION_STRANGER, RELATION_FOLLOWED_BY];
const ADMINS_USERNAMES = [
    "rvasutenko",
    "Nikita"
];


export default class PostComponent {
    #parent
    #config
    private picWidth: number;
    wrapper: HTMLElement | null
    constructor(parent: any, config: any) {
        this.#parent = parent;
        this.#config = config;
        
        this.wrapper = null;
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
        });

        switch (this.#config?.position) {
            case "top":
                this.#parent.prepend(this.wrapper);
                break;
            case "same":
                if (referenceNode) {
                    this.#parent.insertBefore(this.wrapper, referenceNode);
                } else {
                    this.#parent.appendChild(this.wrapper);
                }
                break;
            default:
                this.#parent.appendChild(this.wrapper);
                break;
        }

        this.renderTop();
        this.renderPics();
        // this.renderActions();
        this.renderText();
    }

    renderPics() {
        if (!this.#config.pics || this.#config.pics.length === 0) return;

        const picsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post__pics'],
        });

        const slider = createElement({
            parent: picsWrapper,
            classes: ['post__slider'],
        });

        if (this.#config.pics && this.#config.pics.length > 0) {
            this.#config.pics.forEach((pic: any) => {
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

        this.renderPaginator(picsWrapper, slider);
    }

    private renderPaginator(picsWrapper: HTMLElement, slider: HTMLElement) {
        let currentIndex = 0;
        const totalPics = this.#config.pics.length;
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
                
                prevTranslate = -currentIndex * this.picWidth; // <-- добавлено
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
            let currentTranslate = 0;
            let prevTranslate = 0;
            let isDragging = false;

            const pointerDown = (x: number) => {
                startX = x;
                isDragging = true;
                currentTranslate = prevTranslate; // <-- добавлено
                slider.style.transition = 'none';
            };
            

            const pointerMove = (x: number) => {
                if (!isDragging) return;
                const delta = x - startX;
                currentTranslate = prevTranslate + delta;
                slider.style.transform = `translateX(${currentTranslate}px)`;
            };

            const pointerUp = () => {
                if (!isDragging) return;
                isDragging = false;
                const movedBy = currentTranslate - (-currentIndex * this.picWidth);

                if (movedBy < -50 && currentIndex < totalPics - 1) currentIndex++;
                else if (movedBy > 50 && currentIndex > 0) currentIndex--;

                updateSlider();
                prevTranslate = -currentIndex * this.picWidth;
                slider.style.transition = 'transform 0.3s ease';
            };

            // Mouse
            slider.addEventListener('mousedown', (e) => pointerDown(e.clientX));
            slider.addEventListener('mousemove', (e) => pointerMove(e.clientX));
            slider.addEventListener('mouseup', pointerUp);
            slider.addEventListener('mouseleave', pointerUp);

            // Touch
            slider.addEventListener('touchstart', (e) => pointerDown(e.touches[0].clientX));
            slider.addEventListener('touchmove', (e) => pointerMove(e.touches[0].clientX));
            slider.addEventListener('touchend', pointerUp);

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
            const actionWrapper = createElement({
                parent: countedActions,
                classes: ['post__action'],
            });
            createElement({
                parent: actionWrapper,
                classes: [`post__${key}`],
            });
            createElement({
                parent: actionWrapper,
                classes: ['post__counter'],
                text: this.#config[`${key}_count`]
            });
        }

        createElement({
            parent: actionsWrapper,
            classes: ['post__bookmark'],
        });
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
            text: this.#config.text,
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
            src: this.#config.author.avatar_url,
            href: `/profiles/${this.#config.author.username}`,
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
            attrs: { href: `/profiles/${this.#config.author.username}` },
            text: `${this.#config.author.firstname} ${this.#config.author.lastname}`,
        });

        createElement({
            classes: ['post__date', 'p1'],
            parent: nameDateWrapper,
            text: AUTHOR_NAME_DATE_DIVIDER,
        });

        createElement({
            classes: ['post__date', 'p1'],
            parent: nameDateWrapper,
            text: `${getTimeDifference(this.#config.created_at)}`,
        });

        if (DISPLAYED_RELATIONS.includes(this.#config?.author?.relation)) {
            const isStranger = this.#config?.author?.relation === RELATION_STRANGER;
            const actionBtn = createElement({
                tag: 'a',
                classes: [
                    'h3',
                    'post__add-to-friends',
                    `js-post-action-${this.#config?.author?.username}`,
                ],
                parent: topRightWrapper,
                text: isStranger ? ADD_TO_FRIENDS_BTN_TEXT : ACCEPT_BTN_TEXT,
            });
            actionBtn.addEventListener('click', () => {
                Ajax.post({
                    url: isStranger ? '/follow' : '/followers/accept',
                    body: { receiver_id: this.#config?.author?.id },
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

        const data: Record<string, object> = {
            copyLink: {
                href: '/copy-link',
                text: 'Скопировать ссылку',
                icon: 'copy-icon',
            },
        };

        if (
            this.#config.author.username === getLsItem('username', '') ||
            ADMINS_USERNAMES.includes(getLsItem('username', ''))
        ) {
            data.edit = {
                href: '/edit',
                text: 'Редактировать',
                icon: 'pencil-primary-icon',
                onClick: () => {
                    new PostMwComponent(this.#parent.parentNode, {
                        type: 'edit-post',
                        data: this.#config,
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
                    new DeleteMwComponent(this.#parent.parentNode, {
                        data: {
                            title: 'Вы уверены, что хотите удалить этот пост?',
                            text: 'Пост будет удалён навсегда, это действие нельзя будет отменить',
                            cancel: 'Отмена',
                            confirm: 'Удалить',
                        },
                        delete: () => this.ajaxDeletePost(this.#config.id),
                    });
                }
            };
        } else {
            data.notify = {
                href: '/notify',
                text: 'Уведомлять о постах',
                icon: 'notice-icon',
            };
            data.notInterested = {
                href: '/not-interested',
                text: 'Не интересно',
                icon: 'cross-circle-icon',
            };
            data.ban = {
                href: '/ban',
                text: 'Пожаловаться',
                icon: 'ban-icon',
                isCritical: true
            };
        }

        new ContextMenuComponent(dropdown, { data });
    }

    actionCbOk() {
        const actions = Array.from(
            document.getElementsByClassName(`js-post-action-${this.#config?.author?.username}`)
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
        this.#config = config;
        this.#config.position = "same";
        this.render();
    }
}
