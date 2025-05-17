import PopUpComponent from "@components/UI/PopUpComponent/PopUpComponent";
import { UsersRequests } from "@modules/api";
import Router from "@router";
import { getLsItem, setLsItem } from "@utils/localStorage";


interface ProfileData {
    id: string;
    profile: {
        username: string;
        firstname: string;
        lastname: string;
        sex: 1 | 2;
        birth_date: string;
        bio?: string;
        avatar_url?: string;
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
    online: boolean;
    relation: string;
    chat_id?: string;
}


export default class LsProfile {
    public static async update() {
        const [status, profileData] = await UsersRequests.getMyProfile();
    
        switch (status) {
            case 200:
                break;
            case 401:
                Router.go({ path: '/login' });
                return;
            default:
                new PopUpComponent({
                    isError: true,
                    text: 'Не удалось получить данные, проверьте подключение к интернету',
                });
                return;
        }
    
        setLsItem('my_profile_data', JSON.stringify(profileData));
    }

    public static get data(): ProfileData {
        return JSON.parse(getLsItem('my_profile_data', '{}'));
    }

    public static get username(): string {
        return JSON.parse(getLsItem('my_profile_data', '{}')).profile.username;
    }

    public static set username(newUsername: string) {
        const profileData = JSON.parse(getLsItem('my_profile_data', '{}')).id;
        profileData.profile.username = newUsername;
        setLsItem('my_profile_data', JSON.stringify(profileData));
    }

    public static get id(): string {
        return JSON.parse(getLsItem('my_profile_data', '{}')).id;
    }
};
