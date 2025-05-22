import createElement from '@utils/createElement';


const SLIDER_RESPONSIVITY = 50;


interface SwiperConfig {
    slider: HTMLElement;
    picsWrapper: HTMLElement;
    picsCount: number;

    hasPaginator?: boolean;
    isHandlingMouse?: boolean;
    isHandlingTouch?: boolean;
}


export default class SwiperComponent {
    private parent: HTMLElement;
    private config: SwiperConfig;

    private picWidth: number;
    private currentIndex: number = 0;
    private prevTranslate: number = 0;

    private paginator: HTMLElement;
    private prevBtn: HTMLElement;
    private nextBtn: HTMLElement;

    public wasDragging: boolean = false;
    private isDragging: boolean = false;
    private isHorizontalSwipe: boolean = false;
    private currentTranslate: number = 0;
    private startX: number = 0;
    private startY: number = 0;

    constructor(parent: HTMLElement, config: SwiperConfig) {
        this.parent = parent;
        this.config = config;

        this.picWidth = this.config.picsWrapper.getBoundingClientRect().width;
        this.render();
    }

    private render() {
        if (this.config.picsCount <= 1) {
            return;
        }

        if (this.config.hasPaginator) {
            this.renderPaginator();
        }

        if (this.config.isHandlingMouse) {
            this.handleMouse();
        }

        if (this.config.isHandlingTouch) {
            this.handleTouch();
        }

        this.config.slider.querySelectorAll('img').forEach(img => {
            img.setAttribute('draggable', 'false');
        });
    }

    private handleTouch() {
        this.config.picsWrapper.addEventListener('touchstart', (e) => 
            this.pointerDown(e.touches[0].clientX, e.touches[0].clientY),
        {
            passive: false
        });
        
        this.config.picsWrapper.addEventListener('touchmove', (e) => 
            this.pointerMove(e.touches[0].clientX, e.touches[0].clientY)
        );
        
        this.config.picsWrapper.addEventListener('touchend', () => this.pointerUp());
        this.config.picsWrapper.addEventListener('touchcancel', () => this.pointerUp());
    }

    private handleMouse() {
        this.config.slider.addEventListener('mousedown', (e) => this.pointerDown(e.clientX, e.clientY));
        this.config.slider.addEventListener('mousemove', (e) => this.pointerMove(e.clientX, e.clientY));
        this.config.slider.addEventListener('mouseup', () => this.pointerUp());
        this.config.slider.addEventListener('mouseleave', () => this.pointerUp());
    }

    private pointerMove(x: number, y: number) {
        if (!this.isDragging) return;
    
        const dx = x - this.startX;
        const dy = y - this.startY;
    
        // Определяем направление свайпа
        if (!this.isHorizontalSwipe && Math.abs(dx) > 5) {
            this.isHorizontalSwipe = Math.abs(dx) > Math.abs(dy);
        }

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            this.wasDragging = true; // свайп!
        }
    
        // Если свайп вертикальный — ничего не делаем
        if (!this.isHorizontalSwipe) return;
    
        this.currentTranslate = this.prevTranslate + dx;
        this.config.slider.style.transform = `translateX(${this.currentTranslate}px)`;
    };

    private pointerDown(x: number, y: number) {
        this.startX = x;
        this.startY = y;
        this.wasDragging = false;
        this.isDragging = true;
        this.isHorizontalSwipe = false;
        this.currentTranslate = this.prevTranslate;
        // this.config.slider.style.transition = 'none';
    };

    private pointerUp() {
        if (!this.isDragging) return;
        this.isDragging = false;
    
        if (!this.isHorizontalSwipe) return;
    
        const movedBy = this.currentTranslate - this.prevTranslate;
    
        if (movedBy < -SLIDER_RESPONSIVITY && this.currentIndex < this.config.picsCount - 1) this.currentIndex++;
        if (movedBy > SLIDER_RESPONSIVITY && this.currentIndex > 0) this.currentIndex--;
    
        this.config.slider.style.transition = 'var(--trans-swiper)';
        this.updateSlider();
        this.prevTranslate = -this.currentIndex * this.picWidth;
    }

    private renderPaginator() {
        this.paginator = createElement({
            parent: this.config.picsWrapper,
            classes: ['post__paginator'],
            text: `${this.currentIndex + 1}/${this.config.picsCount}`
        });

        this.prevBtn = createElement({
            parent: this.config.picsWrapper,
            classes: ['post__nav', 'post__nav_prev', 'hidden'],
        });

        createElement({
            parent: this.prevBtn,
            attrs: {src: '/static/img/prev-arrow-icon.svg'}
        });

        this.nextBtn = createElement({
            parent: this.config.picsWrapper,
            classes: ['post__nav', 'post__nav_next'],
        });

        createElement({
            parent: this.nextBtn,
            attrs: {src: '/static/img/next-arrow-icon.svg'}
        });
        
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
    }

    public next() {
        if (this.currentIndex >= this.config.picsCount - 1) {
            return;
        }
        this.currentIndex++;
        this.updateSlider();
    }

    public prev() {
        if (this.currentIndex <= 0) {
            return;
        }
        this.currentIndex--;
        this.updateSlider();
    }

    public showSlide(index: number) {
        if (index < 0 || index >= this.config.picsCount) {
            return;
        }
        
        this.currentIndex = index;
        this.updateSlider();
    }

    private updateSlider() {
        this.config.slider.style.transform = `translateX(-${this.currentIndex * this.picWidth}px)`;
        this.paginator.innerText = `${this.currentIndex + 1}/${this.config.picsCount}`;
        this.prevBtn.classList.toggle('hidden', this.currentIndex === 0);
        this.nextBtn.classList.toggle('hidden', this.currentIndex === this.config.picsCount - 1);

        this.prevTranslate = -this.currentIndex * this.picWidth;
    }
}
