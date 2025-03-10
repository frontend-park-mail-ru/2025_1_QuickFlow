const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';
const API_BASE_URL = 'https://quickflowapp.ru/api';

class Ajax {
    async get({ url, callback = () => {} }) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: HTTP_METHOD_GET,
                credentials: 'include'
            });
            const data = await response.json();
            callback(response.status, data);
        } catch (error) {
            console.error('GET request failed:', error);
        }
    }

    async post({ url, body, callback = () => {} }) {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: HTTP_METHOD_POST,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(body)
            });
    
            console.log(response);
    
            let data = null;
            if (response.headers.get('content-length') !== '0' && response.headers.get('content-type')?.includes('application/json')) {
                data = await response.json();
            }
    
            callback(response.status, data);
        } catch (error) {
            console.error('POST request failed:', error);
        }
    }
    
}

export default new Ajax();