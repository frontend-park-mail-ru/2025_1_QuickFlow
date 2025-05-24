import { UserPublic } from "./UserTypes";


export interface Community {
    id: string;
    owner: UserPublic;
    created_at: string;
    community: {
        nickname: string;
        name: string;
        description?: string;
        avatar_url?: string;
        cover_url?: string;
    }
}
