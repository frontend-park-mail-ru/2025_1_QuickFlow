export const forms = {
    profile: {
        header: true,
        fields: [
            [{
                key: 'username',
                config: {
                    label: 'Никнейм',
                    validation: 'username',
                    required: true,
                    maxLength: 20,
                }
            }],
            [{
                key: 'firstname',
                config: {
                    label: 'Имя',
                    validation: 'name',
                    required: true,
                    maxLength: 25,
                }
            },
            {
                key: 'lastname',
                config: {
                    label: 'Фамилия',
                    validation: 'name',
                    required: true,
                    maxLength: 25,
                }
            },
            {
                key: 'birth_date',
                config: {
                    label: 'Дата рождения',
                    validation: 'date',
                    autocomplete: 'date',
                    placeholder: 'дд.мм.гггг',
                    required: true,
                    maxLength: 10,
                }
            }],
            [{
                key: 'bio',
                type: 'textarea',
                config: {
                    label: 'Краткая информация',
                    placeholder: 'Расскажите о себе',
                    maxLength: 256,
                }
            }]
        ]
    },
    contacts: {
        title: 'Контакты',
        fields: [
            [{
                key: 'city',
                config: {
                    label: 'Город',
                    maxLength: 25,
                }
            }],
            [{
                key: 'phone',
                config: {
                    label: 'Телефон',
                    validation: 'phone',
                }
            },
            {
                key: 'email',
                config: {
                    label: 'Почта',
                    validation: 'email',
                    maxLength: 32,
                }
            }]
        ]
    },
    education: {
        title: 'Образование',
        fields: [
            [{
                key: 'school_city',
                config: {
                    label: 'Город',
                    maxLength: 25,
                }
            },
            {
                key: 'school_name',
                config: {
                    label: 'Школа',
                    maxLength: 32,
                }
            }],
            [{
                key: 'univ_city',
                config: {
                    label: 'Город',
                    maxLength: 25,
                }
            },
            {
                key: 'univ_name',
                config: {
                    label: 'Высшее учебное заведение',
                    maxLength: 50,
                }
            },
            {
                key: 'faculty',
                config: {
                    label: 'Факультет',
                    maxLength: 32,
                }
            },
            {
                key: 'grad_year',
                config: {
                    label: 'Год выпуска',
                    max: 2040,
                    min: 1925,
                    validation: "year",
                    type: "number",
                }
            }]
        ]
    }
};