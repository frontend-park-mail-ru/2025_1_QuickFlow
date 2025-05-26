interface ValidationResultType {
    result: boolean;
    message: string | null;
}

const ValidationResult = (result: boolean, message: string | null = null): ValidationResultType => {
    return { result, message };
};


export const ValidateCommunityName = (value: string): ValidationResultType => {
    if (!value) {
        return ValidationResult(false, 'Введите название');
    }
  
    if (value.length < 3) {
        return ValidationResult(false, 'Название не может быть короче 3 символов');
    }
  
    if (value.length > 50) {
        return ValidationResult(false, 'Название не может быть длиннее 50 символов');
    }
  
    return ValidationResult(true);
};

export const ValidateCommunityNickname = (value: string): ValidationResultType => {
    if (!value) {
        return ValidationResult(false, 'Введите адрес');
    }

    const chars = Array.from(value);
    const hasValidCharacters = chars.every((char) => /^[a-zA-Z0-9._]+$/.test(char));
  
    if (!hasValidCharacters) {
        return ValidationResult(false, 'Адрес может содержать только латинские буквы, цифры, "." и "_"');
    }

    if (chars[0] === '.' || chars[0] === '_') {
        return ValidationResult(false, 'Адрес не должен начинаться с "." или "_"');
    }

    if (value.length < 4) {
        return ValidationResult(false, 'Название не может быть короче 4 символов');
    }
  
    if (value.length > 20) {
        return ValidationResult(false, 'Название не может быть длиннее 20 символов');
    }
  
    return ValidationResult(true);
};