import MessengerComponent from '@components/Messenger/MessengerComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { getLsItem } from '@utils/localStorage';
import router from '@router';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { UsersRequests } from '@modules/api';
import LsProfile from '@modules/LsProfile';


class MessengerView {
    private params: Record<string, any>;
    private containerObj: MainLayoutComponent;

    constructor() {}

    async render(params: Record<string, any>) {
        this.params = params;

        this.containerObj = new MainLayoutComponent().render({
            type: 'messenger',
        });

        await LsProfile.update();
        new MessengerComponent(this.containerObj, {
            user: LsProfile.data,
            receiver_username: this.params?.username,
            chat_id: this.params?.chat_id,
        });

        // const [status, profileData] = await UsersRequests.getMyProfile();
        // // const [status, profileData] = await UsersRequests.getProfile(getLsItem('username', ''));
        // switch (status) {
        //     case 200:
        //         new MessengerComponent(this.containerObj, {
        //             user: profileData,
        //             receiver_username: this.params?.username,
        //             chat_id: this.params?.chat_id,
        //         });
        //         break;
        //     case 401:
        //         router.go({ path: '/login' });
        //         break;
        //     default:
        //         new PopUpComponent({
        //             isError: true,
        //             text: 'Не удалось получить данные профиля',
        //         });
        //         break;
        // }

        return this.containerObj.container;
    }
}

export default new MessengerView();
