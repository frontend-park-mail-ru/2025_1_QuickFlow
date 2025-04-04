import Ajax from '../../modules/ajax.js';

import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';
import InputComponent from '../../Components/UI/InputComponent/InputComponent.js';
import FileInputComponent from '../../Components/UI/FileInputComponent/FileInputComponent.js';

import createElement from '../../utils/createElement.js';
import TextareaComponent from '../../Components/UI/TextareaComponent/TextareaComponent.js';
import { getLsItem } from '../../utils/localStorage.js';
import convertDate from '../../utils/convertDate.js';
import convertToFormData from '../../utils/convertToFormData.js';


const forms = {
    profile: {
        header: true,
        fields: [
            [{
                key: 'username',
                config: {
                    label: 'Имя пользователя',
                    validation: 'username',
                    required: true
                }
            }],
            [{
                key: 'firstname',
                config: {
                    label: 'Имя',
                    validation: 'name',
                    required: true
                }
            },
            {
                key: 'lastname',
                config: {
                    label: 'Фамилия',
                    validation: 'name',
                    required: true
                }
            },
            {
                key: 'birth_date',
                config: {
                    label: 'Дата рождения',
                    validation: 'date',
                    autocomplete: 'date',
                    placeholder: 'дд.мм.гггг',
                    required: true
                }
            }],
            [{
                key: 'bio',
                type: 'textarea',
                config: {
                    label: 'Краткая информация',
                    placeholder: 'Расскажите о себе'
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
                }
            }],
            [{
                key: 'phone',
                config: {
                    label: 'Телефон',
                    maxLength: 11,
                }
            },
            {
                key: 'email',
                config: {
                    label: 'Почта',
                    validation: 'email',
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
                }
            },
            {
                key: 'school_name',
                config: {
                    label: 'Школа',
                }
            }],
            [{
                key: 'univ_city',
                config: {
                    label: 'Город',
                }
            },
            {
                key: 'univ_name',
                config: {
                    label: 'Высшее учебное заведение',
                }
            },
            {
                key: 'faculty',
                config: {
                    label: 'Факультет',
                }
            },
            {
                key: 'grad_year',
                config: {
                    label: 'Год выпуска',
                    maxLength: 4,
                }
            }]
        ]
    }
};


export default class EditProfileView {
    #containerObj
    #menu
    #section
    #userData
    #stateUpdaters
    constructor(containerObj, menu) {
        this.#containerObj = containerObj;
        this.#menu = menu;
        
        this.#userData = null;
        this.#stateUpdaters = [];
        this.#section = null;
    }

    render() {
        this.#containerObj.clear();
        this.#containerObj = new MainLayoutComponent({
            type: 'feed',
        });

        new RadioMenuComponent(this.#containerObj.right, {
            items: {
                profile: {
                    title: 'Профиль',
                    onClick: () => {
                        this.renderSection('profile');
                    }
                },
                contacts: {
                    title: 'Контакты',
                    onClick: () => {
                        this.renderSection('contacts');
                    }
                },
                education: {
                    title: 'Образование',
                    onClick: () => {
                        this.renderSection('education');
                    }
                },
            }
        });

        this.renderSection('profile');
    }

    renderSection(sectionName) {
        this.#section = sectionName;
        this.#stateUpdaters = [];
        const data = forms[this.#section];
        this.#containerObj.left.innerHTML = '';

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status, userData) => {
                let isAuthorized = status === 200;
    
                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }

                this.#userData = userData;
                if (data.header) this.renderEditHeader();
                this.renderForm(data.fields);
            }
        });
    }

    renderForm(fields) {
        const form = createElement({
            parent: this.#containerObj.left,
            tag: 'form',
            classes: ['profile-edit-form']
        });

        if (this.#userData.title) {
            createElement({
                parent: form,
                tag: 'h1',
                text: this.#userData.title
            });
        }

        const formFields = createElement({
            parent: form,
            classes: ['profile-edit-form-fields']
        });

        for (let i = 0; i < fields.length; i++) {
            const fieldset = fields[i];

            const fieldsetElement = createElement({
                parent: formFields,
                tag: 'fieldset',
                classes: ['profile-edit-fieldset'],
            });
        
            for (const field of fieldset) {
                field.config.classes = ['profile-edit-input'];
                field.type === 'textarea' ? field.config.classes.push('modal-window-textarea') : null;

                field.config.name = field.key;
                field.config.placeholder = field.config.placeholder || field.config.label;
                field.config.value = 
                    this.#userData[field.key] ?? 
                    this.#userData?.contact_info?.[field.key] ?? 
                    this.#userData?.school_education?.[field.key] ?? 
                    this.#userData?.university_education?.[field.key];

                if (field.config.name === 'birth_date') {
                    field.config.value = convertDate(field.config.value);
                }

                this.#stateUpdaters.push(
                    field.type === 'textarea' ?
                    new TextareaComponent(fieldsetElement, field.config) :
                    new InputComponent(fieldsetElement, field.config)
                );
            }
        
            if (i < fields.length - 1) {
                createElement({
                    parent: formFields,
                    classes: ['divider'],
                });
            }
        }
        
        new ButtonComponent(form, {
            text: 'Сохранить',
            variant: 'primary',
            size: 'large',
            classes: ['profile-edit-btn'],
            onClick: () => this.handleFormSubmit(),
            disabled: true,
            stateUpdaters: this.#stateUpdaters,
        });
    }

    handleFormSubmit() {
        const body = {};

        this.#stateUpdaters.forEach(({ name, value }) => {
            if (name === 'birth_date') value = convertDate(value, 'ts');
            const sections = {
                profile: () => {
                    body[name] = value;
                },
                contacts: () => {
                    body.contact_info ??= {};
                    body.contact_info[name] = value;
                },
                education: () => {
                    const key = name.startsWith('school') ? 'school_education' : 'university_education';
                    body[key] ??= {};
                    body[key][name] = typeof value === 'number' ? `${value}` : value;
                }
            };
            sections[this.#section]?.();
        })

        if (body.contact_info) body.contact_info = JSON.stringify(body.contact_info);
        if (body.school_education) body.school_education = JSON.stringify(body.school_education);
        if (body.university_education) body.university_education = JSON.stringify(body.university_education);

        for (const key in this.#userData) {
            if (!body[key] || body[key].length === 0) {
                if (typeof this.#userData[key] === 'object') {
                    body[key] = JSON.stringify(this.#userData[key]);
                } else {
                    body[key] = this.#userData[key];
                }
            }
        }

        if (!body['cover_url']) body['cover_url'] = '';
        if (!body['avatar_url']) body['avatar_url'] = '';

        console.log(body);

        const fakebody = {
            "contact_info": "{\"city\":\"Moscow\",\"phone\":\"8964882645\",\"email\":\"vasyutenko20050205@mail.ru\"}",
            "username": "rvasutenko",
            "firstname": "Роман",
            "lastname": "Васютенко",
            "sex": 0,
            "birth_date": "2005-05-02",
            "bio": "Тут пара слов обо мне, моих увлечениях, занятиях и предпочтениях",
            "avatar_url": "/avatars/avatar.jpg",
            "cover_url": "/covers/profile-header.jpg",
            "school_education": "{\"school_city\":\"Ахтубинск\",\"school_name\":\"МБОУ СОШ №4\"}",
            "university_education": "{\"univ_city\":\"Москва\",\"univ_name\":\"МГТУ им. Н.Э. Баумана\",\"faculty\":\"Социальные и гуманитарные науки\",\"grad_year\":\"2027\"}"
        };

        console.log(fakebody);

        const fd = convertToFormData(fakebody);
        console.log(fd);
        for (var pair of fd.entries()) {
            console.log(pair);
        }

        Ajax.post({
            url: '/profile',
            body: fd,
            isFormData: true,
            callback: (status) => {
                let isAuthorized = status === 200;

                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }

                this.render();
            }
        });
    }

    renderEditHeader() {
        const profileHeader = createElement({
            parent: this.#containerObj.left,
            classes: ['profile-header', 'edit']
        });

        const coverWrapper = createElement({
            parent: profileHeader,
            classes: ['profile-cover-wrapper']
        });

        const cover = createElement({
            parent: coverWrapper,
            classes: ['profile-cover', 'edit'],
            attrs: {src: this.#userData.cover_url}
        });

        const coverUploadBtn = new ButtonComponent(coverWrapper, {
            text: 'Изменить обложку',
            variant: 'overlay',
            size: 'small',
            classes: ['cover-edit-btn'],
        });

        this.#stateUpdaters.push(
            new FileInputComponent(this.#containerObj.left, {
                imitator: coverUploadBtn.buttonElement,
                preview: cover,
                id: 'profile-cover-upload',
                name: 'cover_url',
            })
        );

        const avatar = new AvatarComponent(profileHeader, {
            size: 'xxl',
            class: 'profile-avatar',
            src: this.#userData.avatar_url,
            type: 'edit'
        });

        this.#stateUpdaters.push(
            new FileInputComponent(this.#containerObj.left, {
                imitator: avatar.wrapper,
                preview: avatar.avatar,
                id: 'profile-avatar-upload',
                name: 'avatar_url',
            })
        );
    }
}
