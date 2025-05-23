import { UserPublic } from "./UserTypes";


export interface CommentRequest {
    text?: string;
    files?: string[];
    media?: string[];
    audio?: string[];
}

export interface Comment {
    id: string;
    text: string;
    created_at: string;
    updated_at: string;
    author: UserPublic;
    post_id: string;
    like_count: number;
    is_liked: boolean;

    media?: string[];
    audio?: string[];
    files?: string[];
}