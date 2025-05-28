import { Community } from "./CommunityTypes";
import { Attachment } from "./UploadTypes";
import { UserPublic } from "./UserTypes";


export interface PostRequest {
    text?: string;
    author_id?: string;
    author_type?: 'user' | 'community';

    media?: string[];
    files?: string[];
    audio?: string[];
    stickers?: string[];
}

interface BasePost {
    id: string;
    text?: string;
    created_at: string;
    updated_at: string;
    like_count: number;
    repost_count: number;
    comment_count: number;
    is_repost: boolean;
    is_liked: boolean;
    last_comment?: Comment;

    media?: Attachment[];
    audio?: Attachment[];
    files?: Attachment[];
    stickers?: Attachment[];
}

export interface UserPost extends BasePost {
    author_type: 'user';
    author: UserPublic;
}

export interface CommunityPost extends BasePost {
    author_type: 'community';
    author: Community;
}

export type Post = UserPost | CommunityPost;

export interface PostResponse {
    payload: Post;
}

export interface CommentRequest {
    text?: string;

    files?: string[];
    media?: string[];
    audio?: string[];
    stickers?: string[];
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

    media?: Attachment[];
    audio?: Attachment[];
    files?: Attachment[];
    stickers?: Attachment[];
}