export const MOBILE_MAX_WIDTH = 480;

export const CONSTS = {
    MB_MULTIPLIER: 1024 * 1024,
};

export const VIDEO_EXTENSIONS = ['mp4', 'mov'];

export const UPLOAD_DATA = {
    MAX_SIZE: 200 * CONSTS.MB_MULTIPLIER,
    MAX_SINGLE_SIZE: 100 * CONSTS.MB_MULTIPLIER,
};

export const FILE = {
    ACCEPT: 'any',
    MAX_SIZE_TOTAL: 200 * CONSTS.MB_MULTIPLIER,
    MAX_SIZE_SINGLE: 200 * CONSTS.MB_MULTIPLIER,
};

export const AVATAR = {
    ACCEPT: '.jpg, .jpeg, .png, .gif',
    MAX_SIZE_SINGLE: 10 * CONSTS.MB_MULTIPLIER,
    IMG_MAX_RES: 1680,
};

export const COVER = {
    ACCEPT: '.jpg, .jpeg, .png, .gif',
    MAX_SIZE_SINGLE: 10 * CONSTS.MB_MULTIPLIER,
    IMG_MAX_RES: 1680,
};

export const MEDIA = {
    ACCEPT: '.jpg, .jpeg, .png, .gif, .mov, .mp4',
    MAX_SIZE_TOTAL: 10 * CONSTS.MB_MULTIPLIER,
    MAX_SIZE_SINGLE: 6 * CONSTS.MB_MULTIPLIER,
    IMG_MAX_RES: 1680,
};

export const MSG = {
    MAX_LEN: 4000,
    IMG_MAX_COUNT: 10,
    FILE_MAX_COUNT: 10,
};

export const SEX = {
    MALE: 1,
    FEMALE: 2,
};

export const POST = {
    MAX_LEN: 4000,
    IMG_MAX_COUNT: 10,
    FILE_MAX_COUNT: 10,
};
