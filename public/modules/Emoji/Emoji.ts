import emojiData from './compact.raw.json';


interface EmojiEntry {
    hexcode: string;
    label: string;
    unicode: string;
    group?: number;
    order?: number;
    tags?: string[];
    emoticon?: string | string[];
    skins?: EmojiEntry[];
};

enum GroupName {
    'Смайлы' = 0,
    'Люди',
    '--',
    'Животные и природа',
    'Еда и напитки',
    'Места и путешествия',
    'Деятельность и спорт',
    'Одежда и предметы',
    'Символы',
    'Флаги',
};


const HIDDEN_EMOJIS = [
    '🫩',
    '🪾',
    '🫜',
    '🪉',
    '🫟',
    '🫆',
    '🇨🇶',
    '🇦',
    '🇧',
    '🇨',
    '🇩',
    '🇪',
    '🇫',
    '🇬',
    '🇭',
    '🇮',
    '🇯',
    '🇰',
    '🇱',
    '🇲',
    '🇳',
    '🇴',
    '🇵',
    '🇶',
    '🇷',
    '🇸',
    '🇹',
    '🇺',
    '🇻',
    '🇼',
    '🇽',
    '🇾',
    '🇿',
];


export default abstract class Emoji {
    private static emojiList: EmojiEntry[] = emojiData;

    private static filterAccepted(list: EmojiEntry[]): EmojiEntry[] {
        return list.filter((e) => {
            return !e.unicode.includes('\u200D') &&
                !HIDDEN_EMOJIS.includes(e.unicode) &&
                e.group !== 2;
        });
    }

    public static getEmojis(): EmojiEntry[] {
        return this.filterAccepted(this.emojiList);
    }

    // Найти эмодзи по emoticon
    public static findByEmoticon(emoticon: string): EmojiEntry | undefined {
        return this.getEmojis().find((emoji) => {
            if (Array.isArray(emoji.emoticon)) {
                return emoji.emoticon.includes(emoticon);
            }
            return emoji.emoticon === emoticon;
        });
    }
    
    // Найти эмодзи по точному названию (label)
    public static findByLabel(label: string): EmojiEntry | undefined {
        return this.getEmojis().find((emoji) => emoji.label.toLowerCase() === label.toLowerCase());
    }
    
    // Найти эмодзи по одному из тегов (точное совпадение)
    public static findByTag(tag: string): EmojiEntry[] {
        const lowerTag = tag.toLowerCase();
        return this.getEmojis().filter((emoji) =>
            emoji.tags.some((t) => t.toLowerCase() === lowerTag)
        );
    }
    
    // Найти эмодзи по части тега или части названия (поиск по подстроке)
    public static async search(query: string, limit: number): Promise<[number, Record<string, EmojiEntry[]>]> {
        const q = query.toLowerCase();

        const result: [number, Record<string, EmojiEntry[]>] = [
            200,
            {
                payload: Emoji.getEmojis().filter((emoji) =>
                    emoji.label.toLowerCase().includes(q) ||
                    emoji.tags.some((t) => t.toLowerCase().includes(q))
                )
            }
        ];

        return result;
    }

    public static getGroupName(id: number) {
        return GroupName[id];
    }
}
