export default class GlobalStorage {
    public static isTouchDevice() {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        return isTouchDevice;
    }
};
