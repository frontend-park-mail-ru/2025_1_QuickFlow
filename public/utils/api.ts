import ajax from '@modules/ajax';
import convertToFormData from './convertToFormData';


export default class API {
    static async searchUsers(string: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/users/search',
                params: { string, count },
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async searchFriends(string: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/users/search',
                params: { string, count },
                callback: (status: number, data: any) => resolve([status, data]),
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

    static async searchMyCommunities(string: string, count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/users/search',
                params: { string, count },
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }



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
                body,
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

    static async getCommunityPosts(name: string, posts_count: number): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/communities/${name}/posts`,
                params: { posts_count },
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

    static async getProfile(username: string): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: `/profiles/${username}`,
                callback: (status: number, data: any) => resolve([status, data]),
            });
        });
    }

    static async getFriends(user_id: any, count: number = 25, offset: number = 0): Promise<[number, Record<string, any>]> {
        return new Promise((resolve) => {
            ajax.get({
                url: '/friends',
                params: { count, offset, user_id },
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
};
