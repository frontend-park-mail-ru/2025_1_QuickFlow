import PopUpComponent from "@components/UI/PopUpComponent/PopUpComponent";


const DEFAULT_POPUP_TEXT = 'Проверьте подключение к интернету';


interface NetworkErrorPopUpConfig {
    text?: string;
}


export default function networkErrorPopUp(config?: NetworkErrorPopUpConfig) {
    new PopUpComponent({
        icon: 'close-icon',
        size: 'large',
        text: config?.text || DEFAULT_POPUP_TEXT,
        isError: true,
    });
}