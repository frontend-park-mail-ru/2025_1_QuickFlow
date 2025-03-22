import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';
import InputComponent from '../../Components/UI/InputComponent/InputComponent.js';
import FileInputComponent from '../../Components/UI/FileInputComponent/FileInputComponent.js';

import createElement from '../../utils/createElement.js';

import {profileData} from '../mocks.js';
import TextareaComponent from '../../Components/UI/TextareaComponent/TextareaComponent.js';


const forms = {
    profile: {
        header: true,
        fields: [
            [{
                config: {
                    label: 'Имя пользователя',
                    validation: 'username',
                    value: profileData.username,
                    required: true
                }
            }],
            [{
                config: {
                    label: 'Имя',
                    validation: 'name',
                    value: profileData.firstname,
                    required: true
                }
            },
            {
                config: {
                    label: 'Фамилия',
                    validation: 'name',
                    value: profileData.lastname,
                    required: true
                }
            },
            {
                config: {
                    label: 'Дата рождения',
                    validation: 'date',
                    autocomplete: 'date',
                    placeholder: 'дд.мм.гггг',
                    value: profileData.additionalData.birthDate,
                    required: true
                }
            }],
            [{
                type: 'textarea',
                config: {
                    label: 'Краткая информация',
                    value: profileData.additionalData.bio,
                    placeholder: 'Расскажите о себе'
                }
            }]
        ]
    },
    contacts: {
        title: 'Контакты',
        fields: [
            [{
                config: {
                    label: 'Город',
                    value: profileData.additionalData.city,
                }
            }],
            [{
                config: {
                    label: 'Телефон',
                    value: profileData.additionalData.phoneNumber,
                }
            },
            {
                config: {
                    label: 'Почта',
                    value: profileData.additionalData.email,
                }
            }]
        ]
    },
    education: {
        title: 'Образование',
        fields: [
            [{
                config: {
                    label: 'Город',
                    value: profileData.additionalData.schoolCity,
                }
            },
            {
                config: {
                    label: 'Школа',
                    value: profileData.additionalData.school,
                }
            }],
            [{
                config: {
                    label: 'Город',
                    value: profileData.additionalData.universityCity,
                }
            },
            {
                config: {
                    label: 'Высшее учебное заведение',
                    value: profileData.additionalData.university,
                }
            },
            {
                config: {
                    label: 'Факультет',
                    value: profileData.additionalData.department,
                }
            },
            {
                config: {
                    label: 'Год выпуска',
                    value: profileData.additionalData.finishYear,
                }
            }]
        ]
    }
};


export default class EditProfileView {
    #containerObj
    constructor(containerObj) {
        this.#containerObj = containerObj;
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
                        this.renderSection(forms.profile);
                    }
                },
                contacts: {
                    title: 'Контакты',
                    onClick: () => {
                        this.renderSection(forms.contacts);
                    }
                },
                education: {
                    title: 'Образование',
                    onClick: () => {
                        this.renderSection(forms.education);
                    }
                },
            }
        });

        this.renderSection(forms.profile);
    }

    renderSection(data) {
        this.#containerObj.left.innerHTML = '';

        if (data.header) {
            this.renderEditHeader();
        }
        
        const form = createElement({
            parent: this.#containerObj.left,
            tag: 'form',
            classes: ['profile-edit-form']
        });

        if (data.title) {
            createElement({
                parent: form,
                tag: 'h1',
                text: data.title
            });
        }

        this.renderFormFields(form, data.fields);
        
        new ButtonComponent(form, {
            text: 'Сохранить',
            variant: 'primary',
            size: 'large',
            classes: ['profile-edit-btn'],
            onClick: () => {
                // TODO: сохранить изменения
            },
        });
    }

    renderFormFields(form, fields) {
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
                if (field.type === 'textarea') {
                    field.config.classes = ['profile-edit-input', 'modal-window-textarea']
                    new TextareaComponent(fieldsetElement, field.config);
                } else {
                    field.config.classes = ['profile-edit-input']
                    field.config.placeholder ? null : field.config.placeholder = field.config.label;
                    new InputComponent(fieldsetElement, field.config);
                }
            }
        
            if (i < fields.length - 1) {
                createElement({
                    parent: formFields,
                    classes: ['divider'],
                });
            }
        }
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
            attrs: {src: '/static/img/profile-header.jpg'}
        });

        const coverUploadBtn = new ButtonComponent(coverWrapper, {
            text: 'Изменить обложку',
            variant: 'overlay',
            size: 'small',
            classes: ['cover-edit-btn'],
        });

        new FileInputComponent(this.#containerObj.left, {
            imitator: coverUploadBtn.buttonElement,
            preview: cover,
            id: 'profile-cover-upload'
        });

        const avatar = new AvatarComponent(profileHeader, {
            size: 'xxl',
            class: 'profile-avatar',
            src: 'avatar.jpg',
            type: 'edit'
        });

        new FileInputComponent(this.#containerObj.left, {
            imitator: avatar.wrapper,
            preview: avatar.avatar,
            id: 'profile-avatar-upload'
        });
    }
}
