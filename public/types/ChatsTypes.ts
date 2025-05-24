import { UserPublic } from "./UserTypes";

export interface UnreadChatsCountResponse {
    chats_count: number;
}

export interface Chat {
    id: string;
    name: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    type: 'private';
    last_message?: Message;
    online: boolean;
    last_seen: string;
    username: string;
    last_read_by_other?: string;
    last_read_by_me?: string;
    unread_messages: number;
}

export interface Message {
    id: string;
    text: string;
    created_at: string;
    updated_at: string;
    sender: UserPublic;
    chat_id: string;
    files?: string[];
    media?: string[];
    audio?: string[];
}

export interface MessagesResponse {
    messages?: Message[];
    last_read_ts?: string;
}
