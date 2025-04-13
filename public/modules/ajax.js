import { users } from '../mocks.js'


const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';
const API_BASE_URL = 'https://quickflowapp.ru/api';
const DEV_BASE_URL = 'http://localhost:3000/api';
const CSRF_FREE_URLS = [
    '/login',
    '/signup',
    '/logout'
];


class Ajax {
    constructor() {
        this.develop = true;
        this.baseUrl = this.detectEnvironment();
    }

    detectEnvironment() {
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return DEV_BASE_URL;
        }
        this.develop = false;
        return API_BASE_URL;
    }

    async csrfRequest() {
        let csrfToken = null;

        if (!this.develop) {
            const csrfResponse = await fetch(`${this.baseUrl}/csrf`, {
                method: HTTP_METHOD_GET,
                credentials: 'include'
            });
            csrfToken = csrfResponse.headers.get('X-CSRF-Token');
        }

        return csrfToken;
    }

    async fakeRequest(url, params, callback) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Симуляция сетевой задержки
        if (!this.develop) {
            if (url === '/user') {
                callback(200, users['rvasutenko']);
                return true;
            }
        }
        return false;
    }

    async get({ url, params = {}, callback = () => {} }) {
        try {
            if (await this.fakeRequest(url, params, callback)) return;
            // if (url === '/user-dev-false') url = '/feed';

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
            const headers = {};
            if (!isFormData) headers['Content-Type'] = 'application/json; charset=utf-8';
            if (!CSRF_FREE_URLS.includes(url)) {
                headers['X-CSRF-Token'] = await this.csrfRequest() || '';
            }

            const options = {
                method: HTTP_METHOD_POST,
                credentials: 'include',
                body: isFormData ? body : JSON.stringify(body),
                headers
            };

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
            callback(response?.status || 500);
        }
    }
    
    async delete({ url, params = {}, callback = () => {} }) {
        try {
            const headers = {};
            if (!CSRF_FREE_URLS.includes(url)) {
                headers['X-CSRF-Token'] = await this.csrfRequest() || '';
            }
    
            const queryString = new URLSearchParams(params).toString();
            const fullUrl = `${this.baseUrl}${url}${queryString ? `?${queryString}` : ''}`;
    
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                credentials: 'include',
                headers
            });
    
            let data = null;
            if (
                response.headers.get('content-length') !== '0' &&
                response.headers.get('content-type')?.includes('application/json')
            ) {
                data = await response.json();
            }
    
            callback(response.status, data);
        } catch (error) {
            console.error('DELETE request failed:', error);
            callback(500);
        }
    }

    async put({ url, body = {}, isFormData = false, callback = () => {} }) {
        let response;
        try {
            const headers = {};
            if (!isFormData) headers['Content-Type'] = 'application/json; charset=utf-8';
            if (!CSRF_FREE_URLS.includes(url)) {
                headers['X-CSRF-Token'] = await this.csrfRequest() || '';
            }
    
            const options = {
                method: 'PUT',
                credentials: 'include',
                body: isFormData ? body : JSON.stringify(body),
                headers
            };
    
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
            console.error('PUT request failed:', error);
            callback(response?.status || 500);
        }
    }    
}

export default new Ajax();