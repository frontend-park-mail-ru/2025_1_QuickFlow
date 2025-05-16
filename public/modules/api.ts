import ajax from '@modules/ajax';
import convertToFormData from '@utils/convertToFormData';


export class PostsRequests {
    static async createPost(body: Record<string, any>): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.post({
                url: `/post`,
                body,
                isFormData: true,
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async getPost(post_id: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/posts/${post_id}`,
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }

    static async editPost(post_id: string, body: Record<string, any>): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.put({
                url: `/posts/${post_id}`,
                body,
                isFormData: true,
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
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


export class ChatsRequests {
    static async getMessages(chat_id: string, messages_count: number, ts?: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/chats/${chat_id}/messages`,
                params: { messages_count, ...(ts && { ts }) },
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
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


export class UsersRequests {
    static async getMyProfile(): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/my_profile',
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
            });
        });
    }
    
    static async getProfile(username: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/profiles/${username}`,
                callback: (status: number, data: Record<string, any>) => resolve([status, data]),
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
