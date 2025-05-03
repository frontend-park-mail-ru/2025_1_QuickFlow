import ajax from '@modules/ajax';


export default class API {
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
