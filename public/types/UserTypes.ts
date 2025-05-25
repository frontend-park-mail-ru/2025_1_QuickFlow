export interface User {
    id: string;
    profile: {
        username: string;
        firstname: string;
        lastname: string;
        sex: 1 | 2;
        birth_date: string;
        avatar_url?: string;
        bio?: string;
        cover_url?: string;
    };
    contact_info?: {
        city?: string;
        email?: string;
        phone?: string;
    };
    school?: {
        school_city?: string;
        school_name?: string;
    };
    university?: {
        univ_city?: string;
        univ_name?: string;
        faculty?: string;
        grad_year?: number;
    };
    last_seen: string;
    online: boolean;
    relation: 'self' | 'following' | 'followed_by' | 'stranger' | 'friend';
    chat_id: string;
}

export interface UserPublic {
    id: string;
    username: string;
    firstname: string;
    lastname: string;
    avatar_url?: string;
    relation?: string;
}