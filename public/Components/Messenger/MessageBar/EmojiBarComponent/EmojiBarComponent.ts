import SearchComponent from "@components/SearchComponent/SearchComponent";
import Emoji from "@modules/Emoji/Emoji";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";


interface EmojiBarConfig {
    addToMessage: (emojiSym: string) => void;
    sendSticker: (stickerUrl: string) => void;
}

const STICKER_URLS = [
    'https://quickflowapp.ru/minio/posts/c0feed28-d97c-4296-a77a-a4d53aa83cb4.gif',
    'https://quickflowapp.ru/minio/posts/04f7ae39-5c45-4b17-9b86-7451efbb1299.gif',
    'https://quickflowapp.ru/minio/posts/fcb86dd9-53c6-4095-be95-98b1a8cf399f.gif',
    'https://quickflowapp.ru/minio/posts/c8ea94aa-eee0-47bd-ad6a-439fc170fc3e.gif',
    'https://quickflowapp.ru/minio/posts/be519cbb-a10b-4c04-8bd6-e3cc3a1b9a82.gif',
    'https://quickflowapp.ru/minio/posts/09407d45-9523-43a0-b9c5-635af2f31c2e.gif',
    'https://quickflowapp.ru/minio/posts/edc2546e-d5c2-473c-a3f4-f9b94f994a0f.gif',
    'https://quickflowapp.ru/minio/posts/0a74b5e0-ed7d-4985-aaf5-0f8bd28ababb.gif',
    'https://quickflowapp.ru/minio/posts/baa23981-a850-4ddf-a56f-1cbbd0d0072d.gif'
];


export default class EmojiBarComponent {
    private parent: HTMLElement | null = null;
    private config: EmojiBarConfig;
    
    private wrapper: HTMLElement | null = null;
    private element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: EmojiBarConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.wrapper = createElement({
            parent: this.parent,
            classes: ['emoji-bar__wrapper'],
        });

        const iconWrapper = createElement({
            parent: this.wrapper,
            classes: ['emoji-bar__icon-wrapper'],
        });

        insertIcon(iconWrapper, {
            name: 'smile-icon',
            classes: ['emoji-bar__icon'],
        });

        this.element = createElement({
            parent: this.wrapper,
            classes: [
                'emoji-bar',
                'emoji-bar_hidden'
            ],
        });

        const emojiSection = this.renderEmojis();
        const stickerSection = this.renderStickers();
        this.renderToggle(emojiSection, stickerSection);
        this.handleHover();
    }

    private handleHover() {
        let timeout: NodeJS.Timeout | null = null;

        this.wrapper.addEventListener('mouseover', () => {
            clearTimeout(timeout);
            this.element.classList.remove('emoji-bar_hidden');
        });

        this.wrapper.addEventListener('mouseout', () => {
            timeout = setTimeout(() => {
                this.element.classList.add('emoji-bar_hidden');
            }, 300);
        });
    }

    private renderToggle(emojiSection: HTMLElement, stickerSection: HTMLElement) {
        const sectionToggle = createElement({
            parent: this.element,
            classes: ['emoji-bar__section-toggle'],
        });

        const emojiTitle = createElement({
            parent: sectionToggle,
            classes: ['emoji-bar__section-title', 'emoji-bar__section-title_active'],
            text: 'Эмодзи',
        });

        const stickerTitle = createElement({
            parent: sectionToggle,
            classes: ['emoji-bar__section-title'],
            text: 'Стикеры',
        });

        sectionToggle.addEventListener('click', (e) => {
            if (e.target === emojiTitle) {
                emojiTitle.classList.add('emoji-bar__section-title_active');
                stickerTitle.classList.remove('emoji-bar__section-title_active');

                emojiSection.classList.remove('hidden');
                stickerSection.classList.add('hidden');
            } else {
                emojiTitle.classList.remove('emoji-bar__section-title_active');
                stickerTitle.classList.add('emoji-bar__section-title_active');

                emojiSection.classList.add('hidden');
                stickerSection.classList.remove('hidden');
            }
        });
    }

    private renderEmojis(): HTMLElement {
        const section = createElement({
            parent: this.element,
            classes: ['emoji-bar__scroll'],
        });

        const results = createElement({
            parent: section,
            classes: [
                'emoji-bar__search-results',
                'hidden'
            ],
        });

        new SearchComponent(section, {
            renderTitle: this.renderSearchEmojiTitle,
            classes: ['emoji-bar__search'],
            inputClasses: ['emoji-bar__search-input'],
            results,
            searchResults: Emoji.search,
            renderResult: this.renderEmoji,
            renderEmptyState: this.renderEmptyState,
        });

        const emojiList = createElement({
            parent: section,
            classes: [
                'emoji-bar__list',
                'emoji-bar__list_emoji',
            ],
        });

        const emojis = Emoji.getEmojis();
        let prevGroup: number = -1;
        for (const emoji of emojis) {
            if (emoji.group !== prevGroup) {
                createElement({
                    parent: emojiList,
                    classes: ['emoji-bar__title'],
                    text: Emoji.getGroupName(emoji.group),
                });
            }
            this.renderEmoji(emojiList, emoji);
            prevGroup = emoji.group;
        }

        section.addEventListener('click', (e) => {
            if (!(e.target instanceof HTMLElement)) return;
            
            let emojiSym: string;
            if (e.target.classList.contains('emoji-bar__emoji-wrapper')) {
                emojiSym = e.target.querySelector('.emoji-bar__emoji')?.textContent;
            } else if (e.target.classList.contains('emoji-bar__emoji')) {
                emojiSym = e.target?.textContent;
            } else return;

            this.config.addToMessage(emojiSym);
        });

        return section;
    }

    private renderEmptyState(parent: HTMLElement) {
        createElement({
            parent,
            classes: ['emoji-bar__not-found'],
            text: 'Результаты не найдены',
        });
    }

    private renderEmoji(parent: HTMLElement, data: Record<string, any>) {
        const emojiSym = data.unicode;

        const emojiWrapper = createElement({
            parent,
            classes: ['emoji-bar__emoji-wrapper'],
            attrs: {
                'data-label': data.label,
            },
        });

        createElement({
            parent: emojiWrapper,
            classes: ['emoji-bar__emoji'],
            text: emojiSym,
        });
    }

    private renderSearchEmojiTitle(parent: HTMLElement) {
        createElement({
            parent,
            classes: ['emoji-bar__title'],
            text: 'Эмодзи',
        });
    }

    private renderStickers(): HTMLElement {
        const section = createElement({
            parent: this.element,
            classes: [
                'emoji-bar__scroll',
                'hidden',
            ],
        });

        const emojiList = createElement({
            parent: section,
            classes: [
                'emoji-bar__list',
                'emoji-bar__list_emoji',
            ],
        });

        createElement({
            parent: emojiList,
            classes: ['emoji-bar__title'],
            text: 'Все стикеры',
        });
        
        for (let i = 0; i < 5; i++) {
            for (const stickerUrl of STICKER_URLS) {
                const stickerWrapper = createElement({
                    parent: emojiList,
                    classes: ['emoji-bar__sticker-wrapper'],
                });
    
                createElement({
                    parent: stickerWrapper,
                    classes: ['emoji-bar__sticker'],
                    attrs: { src: stickerUrl },
                })
                .addEventListener('click', () => {
                    this.config.sendSticker(stickerUrl);
                });
            }
        }

        return section;
    }
}
