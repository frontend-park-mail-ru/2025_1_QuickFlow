import { users, chats, messages } from '../mocks.js'


const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';
const API_BASE_URL = 'https://quickflowapp.ru/api';
const DEVELOP = true;


class Ajax {
    constructor() {
        this.baseUrl = DEVELOP ? '' : API_BASE_URL;
    }

    fakeRequest(url, params, callback) {
        if (!DEVELOP) {
            if (url === '/user') {
                callback(200, users['rvasutenko']);
                return true;
            } else if (url === '/chats') {
                callback(200, chats['rvasutenko']);
                return true;
            } else if (url === '/chat') {
                callback(200, messages['rvasutenko'][params.username]);
                return true;
            }
        }
        if (url === '/user-dev-false') {
            url = '/feed';
        }
        return false;
    }

    async get({ url, params = {}, callback = () => {} }) {
        try {
            // if (!DEVELOP) {
            //     if (url === '/user') {
            //         callback(200, users['rvasutenko']);
            //         return;
            //     }
            // }
            // if (url === '/user-dev-false') {
            //     url = '/feed';
            // }
            if (this.fakeRequest(url, params, callback)) return;

            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${this.baseUrl}${url}${queryString ? `?${queryString}` : ''}`;
    
            const response = await fetch(fullUrl, {
                method: HTTP_METHOD_GET,
                credentials: 'include'
            });
    
            let data = null;
            if (response.headers.get('content-length') !== '0' && response.headers.get('content-type')?.includes('application/json')) {
                data = await response.json();
            }

            callback(response.status, data);
        } catch (error) {
            console.error('GET request failed:', error);
        }
    }

    async post({ url, body = {}, isFormData = false, callback = () => {} }) {
        let response;
        try {
            const options = {
                method: HTTP_METHOD_POST,
                credentials: 'include',
                body: isFormData ? body : JSON.stringify(body)
            };

            if (!isFormData) {
                options.headers = { 'Content-Type': 'application/json; charset=utf-8' };
            }

            response = await fetch(`${this.baseUrl}${url}`, options);
    
            let data = null;
            if (
                response.headers.get('content-length') !== '0' &&
                response.headers.get('content-type')?.includes('application/json')
            ) {
                data = await response.json();
            }
    
            callback(response.status, data);
        } catch (error) {
            console.error('POST request failed:', error);
            callback(response.status);
        }
    }
    
}

export default new Ajax();