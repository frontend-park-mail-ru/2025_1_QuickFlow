const HTTP_METHOD_GET = 'GET';
const HTTP_METHOD_POST = 'POST';

class Ajax {
    async get({ url, callback = () => {} }) {
        try {
            const response = await fetch(url, { method: HTTP_METHOD_GET, credentials: 'include' });
            const text = await response.text();
            callback(response.status, text);
        } catch (error) {
            console.error('GET request failed:', error);
        }
    }

    async post({ url, body, callback = () => {} }) {
        try {
            const response = await fetch(url, {
                method: HTTP_METHOD_POST,
                credentials: 'include',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(body)
            });
            const text = await response.text();
            callback(response.status, text);
        } catch (error) {
            console.error('POST request failed:', error);
        }
    }
}

export default new Ajax();
