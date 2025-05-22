import createElement from '@utils/createElement';
import insertIcon from '@utils/insertIcon';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import { PostsRequests } from '@modules/api';
import router from '@router';


interface LikeConfig {
    isLiked: boolean;
    likeCount: number;
    targetId: string;
    putMethod: (id: string) => Promise<number>;
    removeMethod: (id: string) => Promise<number>,
    classes?: string[];
}


export default class LikeComponent {
    private parent: HTMLElement;
    private config: LikeConfig;

    private isLiked: boolean;
    public element: HTMLElement | null = null;

    constructor(parent: HTMLElement, config: LikeConfig) {
        this.parent = parent;
        this.config = config;
        this.isLiked = this.config.isLiked;
        this.render();
    }

    private render() {
        this.element = createElement({
            parent: this.parent,
            classes: [
                this.isLiked ? 'post__action_liked' : 'post__action',
                `js-post-action-like`,
            ],
        });

        if (this.config.classes) {
            this.element.classList.add(...this.config.classes);
        }

        insertIcon(this.element, {
            name: this.isLiked ? `like-fill-icon` : `like-icon`,
            classes: [
                this.isLiked ? 'post__action-icon_liked' : 'post__action-icon',
                'post__action-icon',
                `js-post-action-icon-like`,
            ],
        });

        createElement({
            parent: this.element,
            classes: [
                'post__counter',
                `js-post-action-counter-like`,
            ],
            text: this.config.likeCount.toString(),
        });

        this.element.addEventListener('click', this.handleLike.bind(this));
    }

    private async handleLike() {
        let status: number;
        const oldIsLiked = this.isLiked;

        this.isLiked = !this.isLiked;
        this.toggleLike();

        if (oldIsLiked) {
            status = await this.config.removeMethod(this.config.targetId)
        } else {
            status = await this.config.putMethod(this.config.targetId);
        }

        switch (status) {
            case 204:
                // this.isLiked = false;
                break;
            case 401:
                router.go({ path: '/login' });
                return;
            default:
                this.isLiked = oldIsLiked;
                this.toggleLike();
                this.renderNetworkErrorPopUp();
                break;
        }
    }

    private renderNetworkErrorPopUp() {
        new PopUpComponent({
            icon: 'close-icon',
            size: 'large',
            text: 'Проверьте подключение к интернету',
            isError: true,
        });
    }

    private async toggleLike() {
        const icon: HTMLElement = this.element.querySelector('.js-post-action-icon-like');
        icon.remove();

        this.element.classList.toggle('post__action');
        this.element.classList.toggle('post__action_liked');

        const newIcon: HTMLElement = await insertIcon(this.element, {
            name: this.isLiked ? 'like-fill-icon' : 'like-icon',
            classes: [
                'post__action-icon',
                'js-post-action-icon-like',
            ],
        });

        if (this.isLiked) {
            newIcon.classList.add('post__action-icon_liked');
            
            newIcon.classList.add('post__action-icon_like-animating');

            newIcon.addEventListener('animationend', () => {
                newIcon.classList.remove('post__action-icon_like-animating');
            }, { once: true });
        }

        const counter: HTMLElement = this.element.querySelector('.js-post-action-counter-like');

        if (!this.config.isLiked) {
            counter.innerText = (this.isLiked ?
                this.config.likeCount + 1 :
                this.config.likeCount).toString();
        } else {
            counter.innerText = (this.isLiked ?
                this.config.likeCount :
                this.config.likeCount - 1).toString();
        }
    }
}
