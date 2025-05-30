import Router from "@router";
import LsProfile from "./LsProfile";
import NotificationComponent from "@components/NotificationComponent/NotificationComponent";
import { Message } from "types/ChatsTypes";
import ws from "./WebSocketService";
import { CommentsRequests, FriendsRequests, PostsRequests } from "./api";

export default abstract class NotificationService {
    public static subscribe(skipRouteChecking: boolean = false) {
        if (!skipRouteChecking &&
            (
                Router.path.startsWith('/scores') ||
                Router.path.startsWith('/login') ||
                Router.path.startsWith('/signup')
            )
        ) return;

        NotificationService.subscribeMessage();

        PostsRequests.onPostLiked((data) => {
            if (data?.user?.id === LsProfile?.id) {
                return;
            }

            new NotificationComponent({
                type: 'post_liked',
                classes: ['notification_msg'],
                data,
            });
        });

        PostsRequests.onPostCommented((data) => {
            if (data?.comment?.author?.id === LsProfile?.id) {
                return;
            }

            new NotificationComponent({
                type: 'post_commented',
                classes: ['notification_msg'],
                data,
            });
        });

        CommentsRequests.onCommentLiked((data) => {
            if (data?.user?.id === LsProfile?.id) {
                return;
            }

            new NotificationComponent({
                type: 'comment_liked',
                classes: ['notification_msg'],
                data,
            });
        });

        FriendsRequests.onRequestReceived((data) => {
            new NotificationComponent({
                type: 'friend_request_received',
                classes: ['notification_msg'],
                data,
            });
        });

        FriendsRequests.onRequestAccepted((data) => {
            new NotificationComponent({
                type: 'friend_request_accepted',
                classes: ['notification_msg'],
                data,
            });
        });
    }

    public static subscribeMessage() {
        new ws().subscribe('message', (payload: Message) => {
            if (
                Router.path.startsWith('/messenger') ||
                payload?.sender?.username === LsProfile.username
            ) return;
        
            new NotificationComponent({
                type: 'msg',
                classes: ['notification_msg'],
                data: payload,
            });

            Router.menu.renderCounters('messenger');
        });
    }
};
