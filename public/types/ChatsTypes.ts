import { Attachment } from "./UploadTypes";
import { UserPublic } from "./UserTypes";

export interface UnreadChatsCountResponse {
    payload: {
        chats_count: number;
    }
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
    files?: Attachment[];
    media?: Attachment[];
    audio?: Attachment[];
}

export interface MessagesResponse {
    messages?: Message[];
    last_read_ts?: string;
}
