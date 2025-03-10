import Ajax from '../../modules/ajax.js';
// import InputComponent from '../UI/InputComponent/InputComponent.js';
// import RadioComponent from '../UI/RadioComponent/RadioComponent.js';
import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';

export default class PostComponent {
    constructor(container, data) {
        this.container = container;
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('post');
        this.data = data;
        this.render();
    }

    render() {
        this.renderTop();
        // this.renderPics();
        // this.renderActions();
        this.renderText();

        this.container.appendChild(this.wrapper);
    }

    renderPics() {
        const picsWrapper = document.createElement('div');
        picsWrapper.classList.add('post-pics-wrapper');
        this.wrapper.appendChild(picsWrapper);

        if (this.data.pics && this.data.pics.length > 0) {
            this.data.pics.forEach((pic) => {
                const postPic = document.createElement('img');
                postPic.src = pic;
                postPic.alt = 'post image';
                postPic.classList.add('post-pic');
                picsWrapper.appendChild(postPic);
            });
        }
    }

    renderActions() {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.classList.add('post-actions-wrapper');
        this.wrapper.appendChild(actionsWrapper);

        const likeWrapper = document.createElement('div');
        likeWrapper.classList.add('post-action-wrapper');
        actionsWrapper.appendChild(likeWrapper);
        const like = document.createElement('div');
        like.classList.add('post-like');
        const likeCounter = document.createElement('div');
        likeCounter.classList.add('post-action-counter');
        likeCounter.textContent = this.data.like_count;
        likeWrapper.appendChild(like);
        likeWrapper.appendChild(likeCounter);

        const commentWrapper = document.createElement('div');
        commentWrapper.classList.add('post-action-wrapper');
        actionsWrapper.appendChild(commentWrapper);
        const comment = document.createElement('div');
        comment.classList.add('post-comment');
        const commentCounter = document.createElement('div');
        commentCounter.classList.add('post-action-counter');
        commentCounter.textContent = this.data.comment_count;
        commentWrapper.appendChild(comment);
        commentWrapper.appendChild(commentCounter);

        const repostWrapper = document.createElement('div');
        repostWrapper.classList.add('post-action-wrapper');
        actionsWrapper.appendChild(repostWrapper);
        const repost = document.createElement('div');
        repost.classList.add('post-repost');
        const repostCounter = document.createElement('div');
        repostCounter.classList.add('post-action-counter');
        repostCounter.textContent = this.data.repost_count;
        repostWrapper.appendChild(repost);
        repostWrapper.appendChild(repostCounter);

        const bookmark = document.createElement('div');
        actionsWrapper.appendChild(bookmark);
        bookmark.classList.add('post-bookmark');
    }

    renderText() {
        const textWrapper = document.createElement('div');
        textWrapper.classList.add('post-text-wrapper');
        this.wrapper.appendChild(textWrapper);

        const text = document.createElement('p');
        text.classList.add('post-text-content');
        text.textContent = this.data.text;
        textWrapper.appendChild(text);

        // Создаём кнопку "Читать дальше"
        const readMore = document.createElement('p');
        readMore.classList.add('post-read-more');
        readMore.textContent = 'Показать ещё';
        readMore.style.display = 'none';

        textWrapper.appendChild(readMore);

        // После рендеринга проверяем, обрезается ли текст
        requestAnimationFrame(() => {
            if (text.scrollHeight > text.clientHeight) {
                readMore.style.display = 'inline-block';
            }
        });

        // Добавляем обработчик клика для разворачивания и сворачивания текста
        readMore.addEventListener('click', () => {
            if (text.classList.contains('expanded')) {
                text.classList.remove('expanded');
                readMore.textContent = 'Показать ещё';
            } else {
                text.classList.add('expanded');
                readMore.textContent = 'Скрыть';
            }
        });
    }

    renderTop() {
        const topWrapper = document.createElement('div');
        topWrapper.classList.add('post-top-wrapper');
        this.wrapper.appendChild(topWrapper);

        const authorWrapper = document.createElement('div');
        authorWrapper.classList.add('post-author-wrapper');
        topWrapper.appendChild(authorWrapper);

        const avatar = document.createElement('img');
        avatar.classList.add('avatar');
        avatar.classList.add('s');
        avatar.src = 'static/img/avatar.jpg'; // сделать аватар пользователя
        authorWrapper.appendChild(avatar);

        const topRightWrapper = document.createElement('div');
        topRightWrapper.classList.add('post-top-right-wrapper');
        authorWrapper.appendChild(topRightWrapper);

        const nameDateWrapper = document.createElement('div');
        nameDateWrapper.classList.add('post-name-date-wrapper');
        topRightWrapper.appendChild(nameDateWrapper);

        const name = document.createElement('h2');
        name.textContent = 'Илья Мациевский'; // сделать имя пользователя
        nameDateWrapper.appendChild(name);

        const divider = document.createElement('div');
        divider.classList.add('post-date');
        divider.classList.add('p1');
        divider.textContent = '•'; // сделать имя пользователя
        nameDateWrapper.appendChild(divider);

        const date = document.createElement('div');
        date.classList.add('post-date');
        date.classList.add('p1');
        date.textContent = `${this.formatTimeAgo(this.data.created_at)}`; // сделать имя пользователя
        nameDateWrapper.appendChild(date);

        if (true) { // сделать проверку на то есть ли в друзьях
            const addToFriends = document.createElement('a');
            addToFriends.classList.add('h3');
            addToFriends.classList.add('a-btn');
            addToFriends.textContent = 'Добавить в друзья'; // сделать имя пользователя
            topRightWrapper.appendChild(addToFriends);
        }

        const options = document.createElement('div');
        options.classList.add('post-options');
        const optionsWrapper = document.createElement('div');
        optionsWrapper.classList.add('post-options-wrapper');
        optionsWrapper.appendChild(options);
        topWrapper.appendChild(optionsWrapper);
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return `${diffInSeconds} секунд${getEnding(diffInSeconds)} назад`;
        }
    
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} минут${getEnding(diffInMinutes)} назад`;
        }
    
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return diffInHours === 1 ? '1 час назад' : `${diffInHours} часов назад`;
        }
    
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return 'Вчера';
        }
        if (diffInDays < 7) {
            return `${diffInDays} дней назад`;
        }
    
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    getEnding(number) {
        const lastDigit = number % 10;
        const lastTwoDigits = number % 100;
    
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return '';
        }
    
        if (lastDigit === 1) {
            return 'у';
        }
        if (lastDigit >= 2 && lastDigit <= 4) {
            return 'ы';
        }
    
        return '';
    }
}
