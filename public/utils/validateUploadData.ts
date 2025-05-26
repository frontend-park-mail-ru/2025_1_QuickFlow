import FileInputComponent from "@components/UI/FileInputComponent/FileInputComponent";
import networkErrorPopUp from "./networkErrorPopUp";
import { CONSTS, UPLOAD_DATA } from "@config/config";


interface ValidateUploadDataConfig {
    mediaInputs?: FileInputComponent[];
    filesInputs?: FileInputComponent[];
}


export default function validateUploadData(config: ValidateUploadDataConfig): boolean {
    let totalDataSize = 0;

    config?.mediaInputs?.forEach(mediaInput => totalDataSize += mediaInput.size);
    config?.filesInputs?.forEach(fileInput => totalDataSize += fileInput.size);

    if (totalDataSize > UPLOAD_DATA.MAX_SIZE) {
        networkErrorPopUp({ text: `Размер вложений суммарно не должен превышать ${UPLOAD_DATA.MAX_SIZE / CONSTS.MB_MULTIPLIER}Мб` });
        return false;
    }

    // if (this.mediaInput.isLarge) {
    //     networkErrorPopUp({ text: `Размер вложений суммарно не должен превышать ${this.mediaInput.conf.maxSize / CONSTS.MB_MULTIPLIER}Мб` });
    //     return false;
    // }

    // if (this.mediaInput.isAnyLarge) {
    //     networkErrorPopUp({ text: `Размер каждого вложения не должен превышать ${this.mediaInput.conf.maxSizeSingle / CONSTS.MB_MULTIPLIER}Мб` });
    //     return false;
    // }

    // if (this.filesInput.isLarge) {
    //     networkErrorPopUp({ text: `Размер файлов суммарно не должен превышать ${this.filesInput.conf.maxSize / CONSTS.MB_MULTIPLIER}Мб` });
    //     return false;
    // }

    return true;
}