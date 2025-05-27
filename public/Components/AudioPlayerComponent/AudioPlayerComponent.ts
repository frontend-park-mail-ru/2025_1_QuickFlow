import createElement from "@utils/createElement";

interface AudioPlayerConfig {
    src: string;
    classes?: string[];
}

export default class AudioPlayerComponent {
    private parent: HTMLElement;
    private config: AudioPlayerConfig;

    public element: HTMLElement;
    private audio: HTMLAudioElement;
    private playBtn: HTMLElement;
    private muteBtn: HTMLElement;
    private volumeInput: HTMLInputElement;
    private timelineInput: HTMLInputElement;
    private currentTimeDisplay: HTMLElement;
    private durationDisplay: HTMLElement;
    private downloadBtn: HTMLAnchorElement;

    constructor(parent: HTMLElement, config: AudioPlayerConfig) {
        this.parent = parent;
        this.config = config;
        this.render();
    }

    private render() {
        this.element = createElement({
            parent: this.parent,
            classes: ['audio-player', ...(this.config.classes || [])],
        });

        this.audio = createElement({
            tag: 'audio',
            attrs: { src: this.config.src },
        }) as HTMLAudioElement;

        // Play/Pause
        this.playBtn = createElement({
            parent: this.element,
            classes: ['audio-player__btn', 'audio-player__play'],
            text: '▶️',
        });
        this.playBtn.addEventListener('click', () => {
            if (this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        });

        // Mute
        this.muteBtn = createElement({
            parent: this.element,
            classes: ['audio-player__btn', 'audio-player__mute'],
            text: '🔈',
        });
        this.muteBtn.addEventListener('click', () => {
            this.audio.muted = !this.audio.muted;
            this.muteBtn.textContent = this.audio.muted ? '🔇' : '🔈';
        });

        // Volume control
        this.volumeInput = createElement({
            tag: 'input',
            parent: this.element,
            classes: ['audio-player__volume'],
            attrs: {
                type: 'range',
                min: '0',
                max: '1',
                step: '0.01',
                value: String(this.audio.volume),
            },
        }) as HTMLInputElement;

        this.updateRangeBackground(this.volumeInput);
        this.volumeInput.addEventListener('input', () => {
            this.audio.volume = parseFloat(this.volumeInput.value);
            this.updateRangeBackground(this.volumeInput);
        });

        // Timeline (seek)
        this.timelineInput = createElement({
            tag: 'input',
            parent: this.element,
            classes: ['audio-player__timeline'],
            attrs: {
                type: 'range',
                min: '0',
                max: '100',
                value: '0',
                step: '0.1',
            },
        }) as HTMLInputElement;

        this.updateRangeBackground(this.timelineInput);
        this.timelineInput.addEventListener('input', () => {
            const value = parseFloat(this.timelineInput.value);
            this.audio.currentTime = (value / 100) * this.audio.duration;
            this.updateRangeBackground(this.timelineInput);
        });

        // Time display
        this.currentTimeDisplay = createElement({
            parent: this.element,
            classes: ['audio-player__time'],
            text: '0:00',
        });

        this.durationDisplay = createElement({
            parent: this.element,
            classes: ['audio-player__time'],
            text: '0:00',
        });

        // Download button
        this.downloadBtn = createElement({
            tag: 'a',
            parent: this.element,
            classes: ['audio-player__download'],
            text: '⬇️',
            attrs: {
                href: this.config.src,
                download: '',
            },
        }) as HTMLAnchorElement;

        // Append audio (hidden)
        this.element.appendChild(this.audio);

        this.attachEvents();
    }

    private updateRangeBackground(input: HTMLInputElement, color = 'var(--icon-accent)', background = 'var(--stroke-primary)') {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        const val = parseFloat(input.value);
        const percent = ((val - min) / (max - min)) * 100;
    
        input.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${background} ${percent}%, ${background} 100%)`;
    }
    

    private attachEvents() {
        this.audio.addEventListener('play', () => {
            this.playBtn.textContent = '⏸️';
        });

        this.audio.addEventListener('pause', () => {
            this.playBtn.textContent = '▶️';
        });

        this.audio.addEventListener('timeupdate', () => {
            const progress = (this.audio.currentTime / this.audio.duration) * 100;
            this.timelineInput.value = String(progress);

            this.currentTimeDisplay.textContent = this.formatTime(this.audio.currentTime);
            this.updateRangeBackground(this.timelineInput);
        });

        this.audio.addEventListener('loadedmetadata', () => {
            this.durationDisplay.textContent = this.formatTime(this.audio.duration);
        });
    }

    private formatTime(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' + s : s}`;
    }
}
