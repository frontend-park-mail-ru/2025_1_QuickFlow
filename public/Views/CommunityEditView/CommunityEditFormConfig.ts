export const forms = {
    settings: {
        header: true,
        fields: [
            [{
                key: 'name',
                config: {
                    label: 'Название',
                    required: true,
                    maxLength: 20,
                }
            },
            {
                key: 'description',
                type: 'textarea',
                config: {
                    label: 'Описание',
                    placeholder: 'Описание сообщества',
                    maxLength: 256,
                }
            }],
            [{
                key: 'nickname',
                config: {
                    label: 'Адрес сообщества',
                    validation: 'username',
                    entity: 'Адрес',
                    required: true,
                    maxLength: 20,
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
                    max: 2050,
                    min: 1925,
                    validation: "year",
                    type: "number",
                }
            }]
        ]
    }
};