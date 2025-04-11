const DEFAULT_PATH = '/feed';
const NOT_FOUND_PATH = '/not-found';
const AUTH_PATHS = [
    '/login',
    '/signup',
    '/logout'
];


class Router {
    #routes = {};
    #menu;
    #header;
    constructor() {
        if (Router.__instance) return Router.__instance;
        Router.__instance = this;
    }

    set menu(menu) {
        this.#menu = menu;
    }

    set header(header) {
        this.#header = header;
    }

    register(view, config) {
        const { path, section } = config;
        this.#routes[path] = {
            view,
            path,
            section: section === null ? null : (section || path).slice(1),
        };
    }

    #matchRoute(path) {
        const pathSegments = path.split('/').filter(Boolean);

        for (const route in this.#routes) {
            const routeSegments = route.split('/').filter(Boolean);
            if (pathSegments.length !== routeSegments.length) continue;

            const params = {};
            let matched = true;

            for (let i = 0; i < routeSegments.length; i++) {
                const rSegment = routeSegments[i];
                const pSegment = pathSegments[i];

                if (rSegment.startsWith('{') && rSegment.endsWith('}')) {
                    const paramName = rSegment.slice(1, -1);
                    params[paramName] = decodeURIComponent(pSegment);
                } else if (rSegment !== pSegment) {
                    matched = false;
                    break;
                }
            }

            if (matched) {
                const { view, section } = this.#routes[route];
                return { view, params, section };
            }
        }

        return null;
    }

    start() {
        this.go({ path: this.path });
        window.addEventListener('popstate', () => this.#renderPath({ path: this.path }));
    }

    go(data) {
        if (AUTH_PATHS.includes(this.path)) {
            this.#header.renderAvatarMenu();
        }
 
        if (data.path === '/') data.path = DEFAULT_PATH;
        if (data.path !== NOT_FOUND_PATH) this.#historyPush(data.path);

        this.#renderPath(data);
    }

    get path() {
        return window.location.pathname;
    }

    back() {
        window.history.back();
    }
    
    forward() {
        window.history.forward();
    }

    #historyPush(path, state = {}, title = '') {
        window.history.pushState(
            state,
            title,
            path
        );
    }

    // #historyReplace(path, state = {}, title = '') {
    //     window.history.replaceState(
    //         state,
    //         title,
    //         path
    //     );
    // }

    #renderPath(data) {
        const path = data.path;
        console.error(path);

        const matchResult = this.#matchRoute(path);
        if (!matchResult) {
            console.error(`No view registered for path: ${path}`);
            return this.go({ path: NOT_FOUND_PATH });
        }
        const { view, params, section } = matchResult;

        if (section && this.#menu) {
            this.#menu.setActive(section);
        }

        view.render(params);
    }
}

export default new Router();