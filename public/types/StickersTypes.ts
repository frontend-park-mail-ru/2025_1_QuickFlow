export interface StickerPack {
    id: string;
    name: string;
    creator_id: string;
    created_at: string;
    updated_at: string;
    stickers: string[];
}

export interface StickerPackRequest {
    name: string;
    stickers: string[];
}

export interface StickerPackResponse {
    payload: StickerPack;
}

export interface StickerPacksResponse {
    payload: StickerPack[];
}
