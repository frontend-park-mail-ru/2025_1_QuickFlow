import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.js'
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import formatTimeAgo from '../../utils/formatTimeAgo.js';
import createElement from '../../utils/createElement.js';


const AUTHOR_AVATAR_SIZE = 's';
const PICTURE_WIDTH = 553;
const READ_MORE_BTN_TEXT = 'Показать ещё';
const READ_LESS_BTN_TEXT = 'Скрыть';
const ADD_TO_FRIENDS_BTN_TEXT = 'Добавить в друзья';
const AUTHOR_NAME_DATE_DIVIDER = '•';
const DEAFULT_IMG_ALT = 'post image';
const DISPLAYED_ACTIONS = ['like', 'comment', 'repost'];


export default class PostComponent {
    #parent
    #config
    constructor(parent, config) {
        this.#parent = parent;
        this.#config = config;
        
        this.wrapper = null;
        this.render();
    }

    render() {
        this.wrapper = createElement({
            parent: this.#parent,
            classes: ['post'],
        });

        this.renderTop();
        this.renderPics();
        // this.renderActions();
        this.renderText();
    }

    renderPics() {
        if (!this.#config.pics || this.#config.pics.length === 0) {
            return;
        }

        const picsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post-pics-wrapper'],
        });

        const slider = createElement({
            parent: picsWrapper,
            classes: ['post-pics-slider'],
        });

        if (this.#config.pics && this.#config.pics.length > 0) {
            this.#config.pics.forEach((pic) => {
                const slide = createElement({
                    parent: slider,
                    classes: ['post-slide'],
                });
                createElement({
                    parent: slide,
                    classes: ['post-pic'],
                    attrs: {src: pic, alt: DEAFULT_IMG_ALT}
                });
            });
        }

        let currentIndex = 0;
        const totalPics = this.#config.pics.length;

        if (totalPics > 1) {
            const paginator = createElement({
                parent: picsWrapper,
                classes: ['post-pics-paginator'],
                text: `${currentIndex + 1}/${totalPics}`
            });

            const prevBtn = createElement({
                parent: picsWrapper,
                classes: ['post-nav-btn', 'post-prev-btn', 'hidden'],
            });

            createElement({
                parent: prevBtn,
                attrs: {src: 'static/img/prev-arrow-icon.svg'}
            });

            const nextBtn = createElement({
                parent: picsWrapper,
                classes: ['post-nav-btn', 'post-next-btn'],
            });

            createElement({
                parent: nextBtn,
                attrs: {src: 'static/img/next-arrow-icon.svg'}
            });

            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    slider.style.transform = `translateX(-${currentIndex * PICTURE_WIDTH}px)`;
                    paginator.innerText = `${currentIndex + 1}/${totalPics}`;

                    if (currentIndex === 0) {
                        prevBtn.classList.add('hidden');
                    }
                    if (currentIndex < totalPics - 1) {
                        nextBtn.classList.remove('hidden');
                    }
                }
            });
    
            nextBtn.addEventListener('click', () => {
                if (currentIndex < totalPics - 1) {
                    currentIndex++;
                    slider.style.transform = `translateX(-${currentIndex * PICTURE_WIDTH}px)`;
                    paginator.innerText = `${currentIndex + 1}/${totalPics}`;

                    if (currentIndex > 0) {
                        prevBtn.classList.remove('hidden');
                    }
                    if (currentIndex === totalPics - 1) {
                        nextBtn.classList.add('hidden');
                    }
                }
            });
        }
    }

    renderActions() {
        const actionsWrapper = createElement({
            parent: this.wrapper,
            classes: ['post-actions-wrapper'],
        });

        const countedActions = createElement({
            parent: actionsWrapper,
            classes: ['post-actions-counted'],
        });

        for (const key of DISPLAYED_ACTIONS) {
            const actionWrapper = createElement({
                parent: countedActions,
                classes: ['post-action-wrapper'],
            });
            createElement({
                parent: actionWrapper,
                classes: [`post-${key}`],
            });
            createElement({
                parent: actionWrapper,
                classes: ['post-action-counter'],
                text: this.#config[`${key}_count`]
            });
        }

        createElement({
            parent: actionsWrapper,
            classes: ['post-action-bookmark'],
        });
    }

    renderText() {
        const textWrapper = createElement({
            parent: this.wrapper,
            classes: ['post-text-wrapper'],
        });

        const text = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['post-text-content'],
            text: this.#config.text,
        });

        const readMore = createElement({
            tag: 'p',
            parent: textWrapper,
            classes: ['post-read-more'],
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
            if (text.classList.contains('expanded')) {
                text.classList.remove('expanded');
                readMore.textContent = READ_MORE_BTN_TEXT;
            } else {
                text.classList.add('expanded');
                readMore.textContent = READ_LESS_BTN_TEXT;
            }
        });
    }

    renderTop() {
        const topWrapper = createElement({
            parent: this.wrapper,
            classes: ['post-top-wrapper'],
        });

        const authorWrapper = createElement({
            parent: topWrapper,
            classes: ['post-author-wrapper'],
        });

        new AvatarComponent(authorWrapper, {
            size: AUTHOR_AVATAR_SIZE,
            src: this.#config.avatar,
        });

        const topRightWrapper = createElement({
            parent: authorWrapper,
            classes: ['post-top-right-wrapper'],
        });

        const nameDateWrapper = createElement({
            parent: topRightWrapper,
            classes: ['post-name-date-wrapper'],
        });

        createElement({
            tag: 'h2',
            parent: nameDateWrapper,
            text: `${this.#config.firstname} ${this.#config.lastname}`,
        });

        createElement({
            classes: ['post-date', 'p1'],
            parent: nameDateWrapper,
            text: AUTHOR_NAME_DATE_DIVIDER,
        });

        createElement({
            classes: ['post-date', 'p1'],
            parent: nameDateWrapper,
            text: `${formatTimeAgo(this.#config.created_at)}`,
        });

        const flag = true;
        if (flag) { // TODO: сделать проверку на то, есть ли в друзьях
            createElement({
                tag: 'a',
                classes: ['h3', 'a-btn'],
                parent: topRightWrapper,
                text: ADD_TO_FRIENDS_BTN_TEXT,
            });
        }

        const dropdown = createElement({
            classes: ['dropdown'],
            parent: topWrapper,
        });

        const optionsWrapper = createElement({
            classes: ['post-options-wrapper'],
            parent: dropdown,
        });

        createElement({
            classes: ['post-options'],
            parent: optionsWrapper,
        });

        new ContextMenuComponent(dropdown, {
            data: {
                notify: {
                    href: '/notify',
                    text: 'Уведомлять о постах',
                    icon: 'notice-icon',
                },
                copyLink: {
                    href: '/copy-link',
                    text: 'Скопировать ссылку',
                    icon: 'copy-icon',
                },
                notInterested: {
                    href: '/not-interested',
                    text: 'Не интересно',
                    icon: 'cross-circle-icon',
                },
                ban: {
                    href: '/ban',
                    text: 'Пожаловаться',
                    icon: 'ban-icon',
                    isCritical: true
                }
            }
        });
    }
}
