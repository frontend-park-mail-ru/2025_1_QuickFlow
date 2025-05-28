import SearchComponent from "@components/SearchComponent/SearchComponent";
import { StickersRequests } from "@modules/api";
import Emoji from "@modules/Emoji/Emoji";
import Router from "@router";
import createElement from "@utils/createElement";
import insertIcon from "@utils/insertIcon";


interface EmojiBarConfig {
    sendSticker: (stickerUrl: string) => void;
    addToMessage: (emojiSym: string) => void;
}


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

    private async render() {
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
        const stickerSection = await this.renderStickers();
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

    private async renderStickers(): Promise<HTMLElement> {
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
        
        const [status, stickerPacksData] = await StickersRequests.getStickerPacks(50);
        switch (status) {
            case 200:
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
        }

        if (!stickerPacksData || !stickerPacksData?.payload?.length) {
            return section;
        }
        
        for (const stickerPack of stickerPacksData.payload) {
            createElement({
                parent: emojiList,
                classes: ['emoji-bar__title'],
                text: stickerPack.name,
            });

            for (const sticker of stickerPack.stickers) {
                const stickerWrapper = createElement({
                    parent: emojiList,
                    classes: ['emoji-bar__sticker-wrapper'],
                });
    
                createElement({
                    parent: stickerWrapper,
                    classes: ['emoji-bar__sticker'],
                    attrs: { src: sticker },
                })
                .addEventListener('click', () => {
                    this.config.sendSticker(sticker);
                });
            }
        }

        return section;
    }
}
