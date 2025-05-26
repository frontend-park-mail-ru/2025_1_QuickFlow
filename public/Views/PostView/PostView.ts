import router from '@router';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import { PostsRequests } from '@modules/api';
import PostComponent from '@components/Post/PostComponent/PostComponent';


class ProfileView {
    private containerObj: MainLayoutComponent | null = null;

    constructor() {}

    async render(params: Record<string, any>) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        const [status, postData] = await PostsRequests.getPost(params?.post_id);
        switch (status) {
            case 200:
                this.renderPost(postData);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
            case 404:
                router.go({ path: '/not-found' });
                break;
        }

        return this.containerObj.container;
    }

    private renderPost(postData: Record<string, any>) {
        new PostComponent(this.containerObj.left, postData?.payload);
    }
}

export default new ProfileView();
