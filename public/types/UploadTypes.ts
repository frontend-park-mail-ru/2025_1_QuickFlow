export interface UploadRequest {
    media?: FileList | null;
    audio?: FileList | null;
    files?: FileList | null;
}

export interface UploadData {
    payload?: {
        media: string[] | null;
        audio: string[] | null;
        files: string[] | null;
    }
}