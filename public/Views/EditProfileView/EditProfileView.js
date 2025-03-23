import Ajax from '../../modules/ajax.js';

import RadioMenuComponent from '../../Components/RadioMenuComponent/RadioMenuComponent.js';
import MainLayoutComponent from '../../Components/MainLayoutComponent/MainLayoutComponent.js';
import AvatarComponent from '../../Components/AvatarComponent/AvatarComponent.js';
import ButtonComponent from '../../Components/UI/ButtonComponent/ButtonComponent.js';
import InputComponent from '../../Components/UI/InputComponent/InputComponent.js';
import FileInputComponent from '../../Components/UI/FileInputComponent/FileInputComponent.js';

import createElement from '../../utils/createElement.js';
import TextareaComponent from '../../Components/UI/TextareaComponent/TextareaComponent.js';


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
                key: 'birthDate',
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
                key: 'phoneNumber',
                config: {
                    label: 'Телефон',
                }
            },
            {
                key: 'email',
                config: {
                    label: 'Почта',
                }
            }]
        ]
    },
    education: {
        title: 'Образование',
        fields: [
            [{
                key: 'schoolCity',
                config: {
                    label: 'Город',
                }
            },
            {
                key: 'school',
                config: {
                    label: 'Школа',
                }
            }],
            [{
                key: 'universityCity',
                config: {
                    label: 'Город',
                }
            },
            {
                key: 'university',
                config: {
                    label: 'Высшее учебное заведение',
                }
            },
            {
                key: 'department',
                config: {
                    label: 'Факультет',
                }
            },
            {
                key: 'finishYear',
                config: {
                    label: 'Год выпуска',
                }
            }]
        ]
    }
};


export default class EditProfileView {
    #containerObj
    #menu
    constructor(containerObj, menu) {
        this.#containerObj = containerObj;
        this.#menu = menu;
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

        Ajax.get({
            url: '/user',
            callback: (status, userData) => {
                let isAuthorized = status === 200;
    
                if (!isAuthorized) {
                    this.#menu.goToPage(this.#menu.menuElements.login);
                    this.#menu.updateMenuVisibility(false);
                    return;
                }

                if (data.header) {
                    this.renderEditHeader(userData);
                }
                
                this.renderForm(data.fields, userData);
            }
        });
    }

    renderForm(fields, userData) {
        const form = createElement({
            parent: this.#containerObj.left,
            tag: 'form',
            classes: ['profile-edit-form']
        });

        if (userData.title) {
            createElement({
                parent: form,
                tag: 'h1',
                text: userData.title
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
                if (field.type === 'textarea') {
                    field.config.classes = ['profile-edit-input', 'modal-window-textarea'];
                    field.config.value = userData[field.key] || userData.additionalData[field.key];
                    new TextareaComponent(fieldsetElement, field.config);
                } else {
                    field.config.classes = ['profile-edit-input']
                    field.config.value = userData[field.key] || userData.additionalData[field.key];
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

    renderEditHeader(userData) {
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
            attrs: {src: userData.cover}
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
            src: userData.avatar,
            type: 'edit'
        });

        new FileInputComponent(this.#containerObj.left, {
            imitator: avatar.wrapper,
            preview: avatar.avatar,
            id: 'profile-avatar-upload'
        });
    }
}
