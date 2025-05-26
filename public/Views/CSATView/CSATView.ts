import CSATComponent from '@components/CSATComponent/CSATComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import Ajax from '@modules/ajax';
import router from '@router';


class СSATView {
    private containerObj: MainLayoutComponent;

    constructor() {
        this.feedbackPost = this.feedbackPost.bind(this);
    }

    render(params: Record<string, any>) {
        this.containerObj = new MainLayoutComponent().render({
            type: 'scores',
        });

        new CSATComponent(this.containerObj.container, {
            type: params.type,
            feedbackPost: this.feedbackPost,
        });

        return this.containerObj.container;
    }

    feedbackPost(body: Record<string, any>, cb: Function) {
        Ajax.post({
            url: `/feedback`,
            body,
            callback: (status: number) => {
                this.ajaxCallbackAuth(status);
                cb(status);
            }
        });
    }

    ajaxCallbackAuth(status: number) {
        if (status === 401) {
            router.go({ path: '/login' });
        }
    }
}

export default new СSATView();
