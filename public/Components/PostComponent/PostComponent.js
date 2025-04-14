import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.js'
import AvatarComponent from '../AvatarComponent/AvatarComponent.js';
import ModalWindowComponent from '../UI/ModalWindowComponent/ModalWindowComponent.js';
// import formatTimeAgo from '../../utils/formatTimeAgo.js';
import getTimeDifference from '../../utils/getTimeDifference.js';
import createElement from '../../utils/createElement.js';
import { getLsItem } from '../../utils/localStorage.js';
import Ajax from '../../modules/ajax.js';
import router from '../../Router.js';


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
            classes: ['post__pics'],
        });

        const slider = createElement({
            parent: picsWrapper,
            classes: ['post__slider'],
        });

        if (this.#config.pics && this.#config.pics.length > 0) {
            this.#config.pics.forEach((pic) => {
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

        let currentIndex = 0;
        const totalPics = this.#config.pics.length;

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

        const flag = true;
        if (flag) { // TODO: сделать проверку на то, есть ли в друзьях
            createElement({
                tag: 'a',
                classes: ['h3', 'post__add-to-friends'],
                parent: topRightWrapper,
                text: ADD_TO_FRIENDS_BTN_TEXT,
            });
        }

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

        const data = {
            copyLink: {
                href: '/copy-link',
                text: 'Скопировать ссылку',
                icon: 'copy-icon',
            },
        };

        if (this.#config.author.username === getLsItem('username', '')) {
            data.edit = {
                href: '/edit',
                text: 'Редактировать',
                icon: 'pencil-primary-icon',
                onClick: () => {
                    new ModalWindowComponent(this.#config.container, {
                        type: 'edit-post',
                        data: this.#config,
                    });
                },
            };
            data.delete = {
                href: '/delete',
                text: 'Удалить',
                icon: 'trash-accent-icon',
                isCritical: true,
                onClick: () => this.ajaxDeletePost(this.#config.id),
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

    ajaxDeletePost(id) {
        Ajax.delete({
            url: `/posts/${id}`,
            callback: (status) => {
                switch (status) {
                    case 401:
                        router.go({ path: '/login' });
                        break;
                    case 200:
                        this.wrapper.remove();
                        break;
                }
            }
        });
    }
}
