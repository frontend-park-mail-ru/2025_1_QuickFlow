// import { users, chats, messages } from '../mocks.js'


const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';
const API_BASE_URL = 'https://quickflowapp.ru/api';
const DEVELOP = false;


class Ajax {
    constructor() {
        this.baseUrl = DEVELOP ? '' : API_BASE_URL;
    }

    redirectRequest(url, queryString) {
        if (!DEVELOP) {
            if (url === '/user' || url === '/chats' || url === '/chat') {
                return `${url}${queryString ? `?${queryString}` : ''}`;
            }
        }
        return null;
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
            
            if (url === '/user-dev-false') {
                url = '/feed';
            }

            const queryString = new URLSearchParams(params).toString();
            
            let fullUrl = null;
            fullUrl = this.redirectRequest(url, queryString);
            if (!fullUrl) {
                fullUrl = `${this.baseUrl}${url}${queryString ? `?${queryString}` : ''}`;
            }
    
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