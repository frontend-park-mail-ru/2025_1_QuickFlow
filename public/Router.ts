import MenuComponent from "@components/MenuComponent/MenuComponent";
import HeaderComponent from "@components/HeaderComponent/HeaderComponent";

const DEFAULT_PATH = '/feed';
const NOT_FOUND_PATH = '/not-found';
const AUTH_PATHS = [
    '/login',
    '/signup',
    '/logout'
];


class Router {
    #routes: Record<string, any> = {};
    #menu: MenuComponent | null = null;
    #header: HeaderComponent | null = null;
    static __instance: any = null;
    constructor() {
        if (Router.__instance) return Router.__instance;
        Router.__instance = this;
    }

    set menu(menu: MenuComponent) {
        this.#menu = menu;
    }

    set header(header: HeaderComponent) {
        this.#header = header;
    }

    get menu(): any {
        return this.#menu;
    }

    get header(): any {
        return this.#header;
    }

    register(view: any, config: any) {
        const { path, section }: Record<string, string> = config;
        this.#routes[path] = {
            view,
            path,
            section: section === null ? null : (section || path).slice(1),
        };
    }

    #matchRoute(path: string) {
        const [pathname] = path.split('?');
        const pathSegments = pathname.split('/').filter(Boolean);

        for (const route in this.#routes) {
            const routeSegments = route.split('/').filter(Boolean);
            if (pathSegments.length !== routeSegments.length) continue;

            const params: Record<string, any> = {};
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

    go(data: any) {
        // const pathWithoutQuery = data.path.split('?')[0];

        if (AUTH_PATHS.includes(this.path)) { // TODO
            this.#header?.renderAvatarMenu();
        }
 
        if (data.path === '/') data.path = DEFAULT_PATH;
        if (data.path !== NOT_FOUND_PATH) this.#historyPush(data.path);

        this.#renderPath(data);
    }

    get path() {
        return window.location.pathname + window.location.search;
    }

    back() {
        window.history.back();
    }
    
    forward() {
        window.history.forward();
    }

    #historyPush(path: string, state = {}, title = '') {
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

    #parseQueryParams(queryString: string) {
        const params: Record<string, any> = {};
        const query = new URLSearchParams(queryString);
        for (const [key, value] of query.entries()) {
            params[key] = value;
        }
        return params;
    }

    #renderPath(data: any) {
        const [pathname, queryString] = data.path.split('?');
        if (pathname) null; // for linter

        const matchResult = this.#matchRoute(data.path);
        if (!matchResult) {
            console.error(`No view registered for path: ${data.path}`);
            return this.go({ path: NOT_FOUND_PATH });
        }
        // const { view, params, section } = matchResult;
        const { view, params: routeParams, section } = matchResult;
        const queryParams = queryString ? this.#parseQueryParams(queryString) : {};

        if (section && this.#menu) {
            this.#menu.setActive(section);
        }

        view.render({ ...routeParams, ...queryParams });
        // view.render(params);
    }
}

export default new Router();