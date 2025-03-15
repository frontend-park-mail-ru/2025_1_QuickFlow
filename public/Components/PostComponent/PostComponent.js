// import Ajax from '../../modules/ajax.js';
// import InputComponent from '../UI/InputComponent/InputComponent.js';
// import RadioComponent from '../UI/RadioComponent/RadioComponent.js';
// import ButtonComponent from '../UI/ButtonComponent/ButtonComponent.js';
import ContextMenuComponent from '../ContextMenuComponent/ContextMenuComponent.js';
import formatTimeAgo from '../../utils/formatTimeAgo.js';

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
        this.renderPics();
        // this.renderActions();
        this.renderText();

        this.container.appendChild(this.wrapper);
    }

    renderPics() {
        const picsWrapper = document.createElement('div');
        picsWrapper.classList.add('post-pics-wrapper');
        this.wrapper.appendChild(picsWrapper);

        const slider = document.createElement('div');
        slider.classList.add('post-pics-slider');
        picsWrapper.appendChild(slider);

        if (this.data.pics && this.data.pics.length > 0) {
            this.data.pics.forEach((pic) => {
                const postPic = document.createElement('img');
                postPic.src = pic;
                postPic.alt = 'post image';
                postPic.classList.add('post-pic');
                slider.appendChild(postPic);
            });
        }

        let currentIndex = 0;
        const picWidth = 553;
        const totalPics = this.data.pics.length;

        if (totalPics > 1) {
            const paginator = document.createElement('div');
            paginator.classList.add('post-pics-paginator');
            paginator.innerText = `${currentIndex + 1}/${totalPics}`;
            picsWrapper.appendChild(paginator);

            const prevBtn = document.createElement('div');
            prevBtn.classList.add('post-nav-btn', 'post-prev-btn', 'hidden');
            const prevIcon = document.createElement('img');
            prevIcon.src = 'static/img/prev-arrow-icon.svg';
            prevBtn.appendChild(prevIcon);
            picsWrapper.appendChild(prevBtn);

            const nextBtn = document.createElement('div');
            nextBtn.classList.add('post-nav-btn', 'post-next-btn');
            const nextIcon = document.createElement('img');
            nextIcon.src = 'static/img/next-arrow-icon.svg';
            nextBtn.appendChild(nextIcon);
            picsWrapper.appendChild(nextBtn);

            prevBtn.addEventListener('click', () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    slider.style.transform = `translateX(-${currentIndex * picWidth}px)`;
                    paginator.innerText = `${currentIndex + 1}/${totalPics}`;

                    if (currentIndex === 0) {
                        prevBtn.classList.add('hidden');
                    }
                    if (currentIndex < totalPics - 1) {
                        nextBtn.classList.remove('hidden');
                    }
                }
            });
    
            nextBtn.addEventListener('click', () => {
                if (currentIndex < totalPics - 1) {
                    currentIndex++;
                    slider.style.transform = `translateX(-${currentIndex * picWidth}px)`;
                    paginator.innerText = `${currentIndex + 1}/${totalPics}`;

                    if (currentIndex > 0) {
                        prevBtn.classList.remove('hidden');
                    }
                    if (currentIndex === totalPics - 1) {
                        nextBtn.classList.add('hidden');
                    }
                }
            });
        }
    }

    renderActions() {
        const actionsWrapper = document.createElement('div');
        actionsWrapper.classList.add('post-actions-wrapper');
        this.wrapper.appendChild(actionsWrapper);

        const countedActions = document.createElement('div');
        countedActions.classList.add('post-actions-counted');
        actionsWrapper.appendChild(countedActions);

        const likeWrapper = document.createElement('div');
        likeWrapper.classList.add('post-action-wrapper');
        countedActions.appendChild(likeWrapper);
        const like = document.createElement('div');
        like.classList.add('post-like');
        const likeCounter = document.createElement('div');
        likeCounter.classList.add('post-action-counter');
        likeCounter.textContent = this.data.like_count;
        likeWrapper.appendChild(like);
        likeWrapper.appendChild(likeCounter);

        const commentWrapper = document.createElement('div');
        commentWrapper.classList.add('post-action-wrapper');
        countedActions.appendChild(commentWrapper);
        const comment = document.createElement('div');
        comment.classList.add('post-comment');
        const commentCounter = document.createElement('div');
        commentCounter.classList.add('post-action-counter');
        commentCounter.textContent = this.data.comment_count;
        commentWrapper.appendChild(comment);
        commentWrapper.appendChild(commentCounter);

        const repostWrapper = document.createElement('div');
        repostWrapper.classList.add('post-action-wrapper');
        countedActions.appendChild(repostWrapper);
        const repost = document.createElement('div');
        repost.classList.add('post-repost');
        const repostCounter = document.createElement('div');
        repostCounter.classList.add('post-action-counter');
        repostCounter.textContent = this.data.repost_count;
        repostWrapper.appendChild(repost);
        repostWrapper.appendChild(repostCounter);

        const bookmark = document.createElement('div');
        actionsWrapper.appendChild(bookmark);
        bookmark.classList.add('post-action-bookmark');
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
        date.textContent = `${formatTimeAgo(this.data.created_at)}`; // сделать имя пользователя
        nameDateWrapper.appendChild(date);

        const flag = true;
        if (flag) { // сделать проверку на то есть ли в друзьях
            const addToFriends = document.createElement('a');
            addToFriends.classList.add('h3');
            addToFriends.classList.add('a-btn');
            addToFriends.textContent = 'Добавить в друзья'; // сделать имя пользователя
            topRightWrapper.appendChild(addToFriends);
        }

        const dropdown = document.createElement('div');
        dropdown.classList.add('dropdown');
        topWrapper.appendChild(dropdown);

        const options = document.createElement('div');
        options.classList.add('post-options');
        const optionsWrapper = document.createElement('div');

        optionsWrapper.classList.add('post-options-wrapper');
        optionsWrapper.appendChild(options);
        dropdown.appendChild(optionsWrapper);


        new ContextMenuComponent(dropdown, {
            data: {
                notify: {
                    href: '/notify',
                    text: 'Уведомлять о постах',
                    icon: 'notice-icon',
                    isCritical: false
                },
                copyLink: {
                    href: '/copy-link',
                    text: 'Скопировать ссылку',
                    icon: 'copy-icon',
                    isCritical: false
                },
                notInterested: {
                    href: '/not-interested',
                    text: 'Не интересно',
                    icon: 'cross-circle-icon',
                    isCritical: false
                },
                ban: {
                    href: '/ban',
                    text: 'Пожаловаться',
                    icon: 'ban-icon',
                    isCritical: true
                }
            }
        });
    }
}
