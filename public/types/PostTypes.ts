import { Community } from "./CommunityTypes";
import { UserPublic } from "./UserTypes";


export interface PostRequest {
    text?: string;
    media?: string[];
    files?: string[];
    audio?: string[];
    author_id?: string;
    author_type?: 'user' | 'community';
}

interface BasePost {
    id: string;
    text?: string;
    media?: string[];
    audio?: string[];
    files?: string[];
    created_at: string;
    updated_at: string;
    like_count: number;
    repost_count: number;
    comment_count: number;
    is_repost: boolean;
    is_liked: boolean;
    last_comment?: Comment;
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