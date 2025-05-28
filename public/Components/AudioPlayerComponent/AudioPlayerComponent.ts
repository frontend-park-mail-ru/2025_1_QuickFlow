import GlobalStorage from "@modules/GlobalStorage";
import createElement from "@utils/createElement";
import downloadFile from "@utils/downloadFile";
import insertIcon from "@utils/insertIcon";

interface AudioPlayerConfig {
    src: string;
    name: string;
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
        });
        
        insertIcon(this.playBtn, {
            name: 'play-fill-icon',
            classes: ['audio-player__icon'],
        });

        this.playBtn.addEventListener('click', () => {
            if (this.audio.paused) {
                this.audio.play();
            } else {
                this.audio.pause();
            }
        });

        // Time display
        this.currentTimeDisplay = createElement({
            parent: this.element,
            classes: ['audio-player__time'],
            text: '0:00',
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
        this.durationDisplay = createElement({
            parent: this.element,
            classes: ['audio-player__time'],
            text: '0:00',
        });

        const rightControls = createElement({
            parent: this.element,
            classes: ['audio-player__controls'],
        });

        // Mute
        const volumeControl = createElement({
            parent: rightControls,
            classes: ['audio-player__volume-wrapper'],
        })

        // Volume control
        this.volumeInput = createElement({
            tag: 'input',
            parent: volumeControl,
            classes: ['audio-player__volume', 'hidden'],
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

        this.muteBtn = createElement({
            parent: volumeControl,
            classes: ['audio-player__btn', 'audio-player__mute'],
        });

        insertIcon(this.muteBtn, {
            name: 'volume-fill-icon',
            classes: ['audio-player__icon'],
        });

        this.muteBtn.addEventListener('click', () => {
            this.audio.muted = !this.audio.muted;
            this.muteBtn.innerHTML = '';

            insertIcon(this.muteBtn, {
                name: this.audio.muted ? 'mute-fill-icon' : 'volume-fill-icon',
                classes: ['audio-player__icon'],
            });
        });

        this.attachShowVolumeEvent(volumeControl);

        // Download button
        this.downloadBtn = createElement({
            parent: rightControls,
            classes: ['audio-player__btn'],
        }) as HTMLAnchorElement;

        this.downloadBtn.addEventListener('click', (e) => {
            downloadFile(this.config.src, this.config?.name || 'qf_audio.mp3');
        });

        insertIcon(this.downloadBtn, {
            name: 'download-icon',
            classes: ['audio-player__icon'],
        });

        // Append audio (hidden)
        this.element.appendChild(this.audio);

        this.attachEvents();
    }

    private attachShowVolumeEvent(volumeControl: HTMLElement) {
        if (!GlobalStorage.isTouchDevice()) {
            volumeControl.addEventListener('mouseover', () => {
                this.volumeInput.classList.remove('hidden');
            });
    
            volumeControl.addEventListener('mouseout', () => {
                this.volumeInput.classList.add('hidden');
            });
        }
    }

    private updateRangeBackground(input: HTMLInputElement, color = 'var(--button-primary-disabled)', background = 'var(--stroke-primary)') {
        const min = parseFloat(input.min) || 0;
        const max = parseFloat(input.max) || 100;
        const val = parseFloat(input.value);
        const percent = ((val - min) / (max - min)) * 100;
    
        input.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${percent}%, ${background} ${percent}%, ${background} 100%)`;
    }
    

    private attachEvents() {
        this.audio.addEventListener('play', () => {
            this.playBtn.innerHTML = '';
            insertIcon(this.playBtn, {
                name: 'pause-fill-icon',
                classes: ['audio-player__icon'],
            });
        });

        this.audio.addEventListener('pause', () => {
            this.playBtn.innerHTML = '';
            insertIcon(this.playBtn, {
                name: 'play-fill-icon',
                classes: ['audio-player__icon'],
            });
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
