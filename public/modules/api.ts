import ajax from '@modules/ajax';
import convertToFormData from '@utils/convertToFormData';
import { Chat, MessagesResponse, MessageWsSend, UnreadChatsCountResponse } from 'types/ChatsTypes';
import { Comment, CommentRequest, Post, PostRequest, PostResponse } from 'types/PostTypes';
import { StickerPackRequest, StickerPackResponse, StickerPacksResponse } from 'types/StickersTypes';
import { UploadData, UploadRequest } from 'types/UploadTypes';
import { User } from 'types/UserTypes';
import ws from './WebSocketService';


export class PostsRequests {
    static async createPost(body: PostRequest): Promise<[number, PostResponse]> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/post`,
                body,
                callback: (status: number, data: PostResponse) => resolve([status, data]),
            });
        });
    }

    static async getPost(post_id: string): Promise<[number, Post]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/posts/${post_id}`,
                callback: (status: number, data: Post) => resolve([status, data]),
            });
        });
    }

    static async editPost(post_id: string, body: PostRequest): Promise<[number, PostResponse]> {
        return new Promise((resolve) => {
            ajax.put({
                url: `/posts/${post_id}`,
                body,
                callback: (status: number, data: PostResponse) => resolve([status, data]),
            });
        });
    }

    static async putLike(post_id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/posts/${post_id}/like`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async removeLike(post_id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: `/posts/${post_id}/like`,
                callback: (status: number) => resolve(status),
            });
        });
    }
};


export class CommentsRequests {
    static async createComment(post_id: string, body: CommentRequest): Promise<[number, Comment]> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/posts/${post_id}/comment`,
                body,
                callback: (status: number, data: Comment) => resolve([status, data]),
            });
        });
    }

    static async getComments(post_id: string, count: number, ts?: string): Promise<[number, Comment[]]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/posts/${post_id}/comments`,
                params: { count, ...(ts && { ts }) },
                callback: (status: number, data: Comment[]) => resolve([status, data]),
            });
        });
    }

    static async editComment(comment_id: string, body: CommentRequest): Promise<[number, Comment]> {
        return new Promise((resolve) => {
            ajax.put({
                url: `/comments/${comment_id}`,
                body,
                callback: (status: number, data: Comment) => resolve([status, data]),
            });
        });
    }

    static async deleteComment(comment_id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: `/comments/${comment_id}`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async putLike(comment_id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/comments/${comment_id}/like`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async removeLike(comment_id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: `/comments/${comment_id}/like`,
                callback: (status: number) => resolve(status),
            });
        });
    }
};


export class ChatsRequests {
    static async getMessages(chat_id: string, messages_count: number, ts?: string): Promise<[number, MessagesResponse]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/chats/${chat_id}/messages`,
                params: { messages_count, ...(ts && { ts }) },
                callback: (status: number, data: MessagesResponse) => resolve([status, data]),
            });
        });
    }

    static sendMessage(payload: MessageWsSend): void {
        new ws().send('message', payload);
    }

    static deleteChat(chat_id: string): void {
        new ws().send('chat_delete', { chat_id });
    }

    static onChatDeleted(cb: (chat_id: string) => void) {
        new ws().subscribe(
            'chat_delete',
            (payload: { chat_id: string }) => cb(payload.chat_id),
        );
    }

    static deleteMessage(message_id: string): void {
        new ws().send('message_delete', { message_id });
    }

    static onMessageDeleted(cb: (chat_id: string, message_id: string) => void) {
        new ws().subscribe(
            'message_delete',
            (payload: {
                chat_id: string,
                message_id: string,
            }) => cb(
                payload.chat_id,
                payload.message_id
            ),
        );
    }

    static async getUnreadChatsCount(): Promise<[number, UnreadChatsCountResponse]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/chats/unread`,
                callback: (status: number, data: UnreadChatsCountResponse) => resolve([status, data]),
            });
        });
    }

    static async getChats(chats_count: number): Promise<[number, Chat[]]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/chats`,
                params: { chats_count },
                callback: (status: number, data: Chat[]) => resolve([status, data]),
            });
        });
    }
};


export class AuthRequests {
    static async logout(): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: '/logout',
                callback: (status: number) => resolve(status),
            });
        });
    }
};


export class StickersRequests {
    static async createStickerPack(body: StickerPackRequest): Promise<[number, StickerPackResponse]> {
        return new Promise((resolve) => {
            ajax.post({
                url: '/sticker_packs/add',
                body,
                callback: (status: number, data: StickerPackResponse) => resolve([status, data]),
            });
        });
    }

    static async getStickerPacks(count: number, offset: number = 0): Promise<[number, StickerPacksResponse]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/sticker_packs',
                params: { count, offset },
                callback: (status: number, data: StickerPacksResponse) => resolve([status, data]),
            });
        });
    }

    static async deleteStickerPack(id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: `/sticker_packs/${id}`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async getStickerPack(id: string): Promise<[number, StickerPackResponse]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/sticker_packs/${id}`,
                callback: (status: number, data: StickerPackResponse) => resolve([status, data]),
            });
        });
    }
};


export class FilesRequests {
    static async upload(data: UploadRequest): Promise<[number, UploadData]> {
        return new Promise((resolve) => {
            ajax.post({
                url: '/upload',
                isFormData: true,
                body: convertToFormData(data),
                callback: (status: number, data: UploadData) => resolve([status, data]),
            });
        });
    }
};


export class UsersRequests {
    static async getMyProfile(): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/my_profile',
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }
    
    static async getProfile(username: string): Promise<[number, User]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/profiles/${username}`,
                callback: (status: number, data: User) => resolve([status, data]),
            });
        });
    }

    static async editProfile(body: Record<string, any>): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.post({
                url: '/profile',
                body: convertToFormData(body),
                isFormData: true,
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async searchUsers(string: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/users/search',
                params: { string, count },
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }
};


export class CommunitiesRequests {
    static async createCommunity(nickname: string, name: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/community`,
                body: convertToFormData({ nickname, name }),
                isFormData: true,
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async getCommunity(pk: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/communities/${pk}`,
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async editCommunity(id: string, body: Record<string, any>): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.put({
                url: `/communities/${id}`,
                body: convertToFormData(body),
                isFormData: true,
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async leaveCommunity(id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/communities/${id}/leave`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async joinCommunity(id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/communities/${id}/join`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async searchCommunities(string: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/communities/search',
                params: { string, count },
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async getCommunityMembers(id: string, count: number, ts?: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/communities/${id}/members`,
                params: ts? { count, ts } : { count },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async getUserCommunities(username: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/profiles/${username}/communities`,
                params: { count },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async getManagedCommunities(username: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/profiles/${username}/controlled`,
                params: { count },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async deleteCommunity(id: string): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: `/communities/${id}`,
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async getCommunityPosts(name: string, posts_count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/communities/${name}/posts`,
                params: { posts_count },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }
};


export class FriendsRequests {
    static async getFriends(user_id: string, count: number = 25, offset: number = 0, section: string = 'all'): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/friends',
                params: { section, count, offset, user_id },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async deleteFriend(friend_id: any): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: '/friends',
                body: { friend_id },
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async acceptFriendRequest(receiver_id: any): Promise<number> {
        return new Promise((resolve) => {
            ajax.post({
                url: '/followers/accept',
                body: { receiver_id },
                callback: (status: number) => resolve(status),
            });
        });
    }

    static async cancelFriendRequest(friend_id: any): Promise<number> {
        return new Promise((resolve) => {
            ajax.delete({
                url: '/follow',
                body: { friend_id },
                callback: (status: number) => resolve(status),
            });
        });
    }
};


export class FeedRequests {
    static async getFeed(posts_count: number = 1): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/feed',
                params: { posts_count },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }
};
