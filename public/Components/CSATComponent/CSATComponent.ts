import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import { setLsItem, getLsItem } from '@utils/localStorage';


const DEFAULT_SRC = '/static/img/default-cover.jpg';


export default class CSATComponent {
    private parent: HTMLElement;
    private config: Record<string, any>;
    private header: HTMLElement;

    container: HTMLElement;
    private selectedRating: number = 0;
    private textarea: TextareaComponent | null = null;
    private stars: HTMLElement[] = [];

    constructor(parent: HTMLElement, config: Record<string, any>) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    render() {
        this.container = createElement({
            parent: this.parent,
            classes: ['csat'],
        });

        this.header = createElement({
            parent: this.container,
            classes: ['csat__header'],
        });

        switch (this.config.type) {
            case 'general':
                this.renderGeneralFeedback();
                break;
            case 'auth':
                this.renderAuthFeedback();
                break;
            case 'post':
                this.renderPostFeedback();
                break;
            case 'recommendation':
                this.renderRecommendationFeedback();
                break;
            case 'messenger':
                this.renderMessengerFeedback();
                break;
            case 'profile':
                this.renderProfileFeedback();
                break;
        }
    }

    renderProfileFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько просто управлять своим аккаунтом в QuickFlow?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    renderMessengerFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько просто пользоваться мессенджером в QuickFlow?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    renderRecommendationFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько вы готовы рекомендовать QuickFlow друзьям и знакомым?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    renderGeneralFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько вы удовлетворены удобством QuickFlow?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    renderPostFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько просто было создать пост в QuickFlow?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    private renderSubmitBtn(text = 'Продолжить') {
        new ButtonComponent(this.container, {
            text,
            type: "submit",
            variant: 'primary',
            size: 'small',
            onClick: () => this.feedbackPost(),
            disabled: true,
            stateUpdaters: [],
        });
    }

    private renderCloseBtn() {
        createElement({
            tag: 'button',
            parent: this.header,
            classes: ['modal__close']
        })
        .addEventListener('click', () => {
            this.close();
        });
    }

    private renderRating() {
        const rating = createElement({
            parent: this.container,
            classes: ['csat__rating'],
        });

        for (let i = 0; i < 5; i++) {
            insertIcon(rating, {
                name: 'star-fill-icon',
                classes: ['csat__rate-icon'],
            })
            .then((rate) => {
                rate.setAttribute('data-value', (i + 1).toString());
                this.stars.push(rate);

                rate.addEventListener('mouseenter', () => this.highlightStars(i + 1, 'hover'));
                rate.addEventListener('mouseleave', () => this.highlightStars(this.selectedRating, 'select'));
                rate.addEventListener('click', () => this.selectRating(i + 1));
            });
        }
    }

    renderAuthFeedback() {
        createElement({
            parent: this.header,
            classes: ['csat__title'],
            text: 'Насколько просто было зарегистрироваться в QuickFlow?'
        });

        this.renderCloseBtn();
        this.renderRating();
        this.renderSubmitBtn();
    }

    feedbackPost() {
        if (!this.textarea && this.selectedRating < 5) {
            this.container.innerHTML = '';

            this.header = createElement({
                parent: this.container,
                classes: ['csat__header'],
            });

            createElement({
                parent: this.header,
                classes: ['csat__title'],
                text: 'Расскажите, что можно было бы улучшить?'
            });

            this.renderCloseBtn();
            this.textarea = new TextareaComponent(this.container, {});
            this.renderSubmitBtn('Отправить');

            return;
        }

        const body = {
            type: this.config.type,
            text: this.textarea.value,
            rating: this.selectedRating,
        };

        console.log(body);

        if (body.rating < 1 || body.rating > 5) return;

        this.config.feedbackPost(body, (status: number) => {
            switch (status) {
                case 200:
                    this.cb200();
                    break;
            }
        });
    }

    cb200() {
        this.container.innerHTML = '';

        setLsItem(`is-${this.config.type}-feedback-given`, 'true');

        const header = createElement({
            parent: this.container,
            classes: ['csat__header'],
        });

        createElement({
            parent: header,
            classes: ['csat__title'],
            text: 'Спасибо за вашу оценку! Благодаря вам мы становимся лучше.'
        });

        setTimeout(() => {
            this.container.remove();
        }, 3000);
    }

    private highlightStars(count: number, mode: 'hover' | 'select') {
        this.stars.forEach((star, index) => {
            if (index < count) {
                if (mode === 'hover') {
                    star.classList.add('csat__rate-icon_hover');
                } else {
                    star.classList.remove('csat__rate-icon_hover');
                    star.classList.add('csat__rate-icon_selected');
                }
            } else {
                if (mode === 'hover') {
                    star.classList.remove('csat__rate-icon_hover');
                } else {
                    star.classList.remove('csat__rate-icon_selected');
                    star.classList.remove('csat__rate-icon_hover');
                }
            }
        });
    }

    private selectRating(rating: number) {
        this.selectedRating = rating;
        this.highlightStars(rating, 'select');
    }

    close() {
        // if (!this.wrapper) return;
        this.container.remove();
        document.body.style.overflow = 'auto';
    }
}
