import router from '@router';

import LoginView from '@views/LoginView/LoginView';
import SignupView from '@views/SignupView/SignupView';
import FeedView from '@views/FeedView/FeedView';
import MessengerView from '@views/MessengerView/MessengerView';
import ProfileView from '@views/ProfileView/ProfileView';
import LogoutView from '@views/LogoutView/LogoutView';
import EditProfileView from '@views/EditProfileView/EditProfileView';
import NotFoundView from '@views/NotFoundView/NotFoundView';
import CSATView from '@views/CSATView/CSATView';
import StatsView from '@views/StatsView/StatsView';
import FriendsView from '@views/FriendsView/FriendsView';
import CommunityView from '@views/CommunityView/CommunityView';
import CommunitiesView from '@views/CommunitiesView/CommunitiesView';


export default function registerRoutes() {
    router.register(FriendsView, { path: '/friends', section: '/friends' });
    router.register(ProfileView, { path: '/profiles/{username}', section: '/profiles' });
    router.register(FeedView, { path: '/feed' });
    router.register(MessengerView, { path: '/messenger', section: '/messenger' });
    router.register(MessengerView, { path: '/messenger/{username}', section: '/messenger' });
    router.register(CommunitiesView, { path: '/communities', section: '/communities' });
    router.register(CommunityView, { path: '/communities/{address}', section: '/communities' });

    router.register(LoginView, { path: '/login', section: null });
    router.register(SignupView, { path: '/signup', section: null });
    router.register(LogoutView, { path: '/logout', section: null });
    router.register(NotFoundView, { path: '/not-found', section: null });

    router.register(EditProfileView, { path: '/profile/edit', section: '/profiles' });

    router.register(CSATView, { path: '/scores', section: null });
    router.register(StatsView, { path: '/stats', section: null });
}