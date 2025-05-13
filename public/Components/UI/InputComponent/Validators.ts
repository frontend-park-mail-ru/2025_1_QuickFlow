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