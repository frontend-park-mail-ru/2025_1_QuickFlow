import Ajax from '@modules/ajax';

import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import CoverComponent from '@components/CoverComponent/CoverComponent';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';

import createElement from '@utils/createElement';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import { getLsItem } from '@utils/localStorage';
import convertDate from '@utils/convertDate';
import convertToFormData from '@utils/convertToFormData';

import router from '@router';


const forms = {
    profile: {
        header: true,
        fields: [
            [{
                key: 'username',
                config: {
                    label: 'Имя пользователя',
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
                    max: 2050,
                    min: 1925,
                    validation: "year",
                    type: "number",
                }
            }]
        ]
    }
};


class EditProfileView {
    #containerObj
    #section
    #userData
    #stateUpdaters
    constructor() {
        this.#userData = null;
        this.#stateUpdaters = [];
        this.#section = null;
    }

    render(params, section = 'profile') {
        this.#containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        new RadioMenuComponent(this.#containerObj.right, {
            items: {
                profile: {
                    title: 'Профиль',
                    onClick: () => this.renderSection('profile')
                },
                contacts: {
                    title: 'Контакты',
                    onClick: () => this.renderSection('contacts')
                },
                education: {
                    title: 'Образование',
                    onClick: () => this.renderSection('education')
                },
            },
            active: section,
        });

        this.renderSection(section);
    }

    renderSection(sectionName) {
        this.#section = sectionName;
        this.#stateUpdaters = [];
        const sectionData = forms[this.#section];
        this.#containerObj.left.innerHTML = '';

        Ajax.get({
            url: `/profiles/${getLsItem('username', '')}`,
            callback: (status, userData) => {
                switch (status) {
                    case 200:
                        this.getCbOk(userData, sectionData);
                        break;
                    case 401:
                        this.cbUnauthorized();
                        break;
                }
            }
        });
    }

    cbUnauthorized() {
        router.go({ path: '/login' });
    }

    getCbOk(userData, sectionData) {
        this.#userData = userData;
        if (sectionData.header) this.renderHeader();
        this.renderForm(sectionData);
    }

    renderForm(sectionData) {
        const fields = sectionData.fields;

        const form = createElement({
            parent: this.#containerObj.left,
            tag: 'form',
            classes: ['profile_edit__form']
        });

        if (sectionData.title) {
            createElement({
                parent: form,
                tag: 'h1',
                text: sectionData.title
            });
        }

        const formFields = createElement({
            parent: form,
            classes: ['profile_edit__fields']
        });

        for (let i = 0; i < fields.length; i++) {
            const fieldset = fields[i];

            const fieldsetElement = createElement({
                parent: formFields,
                tag: 'fieldset',
                classes: ['profile_edit__fieldset'],
            });
        
            for (const field of fieldset) {
                field.config.classes = ['profile_edit__field'];
                // field.type === 'textarea' ? field.config.classes.push('modal-textarea') : null;

                field.config.name = field.key;
                field.config.placeholder = field.config.placeholder || field.config.label;
                field.config.value = 
                    this.#userData?.profile?.[field.key] ?? 
                    this.#userData?.contact_info?.[field.key] ??
                    this.#userData?.school?.[field.key] ?? 
                    this.#userData?.university?.[field.key];

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
                    classes: ['modal__divider'],
                });
            }
        }
        
        new ButtonComponent(form, {
            text: 'Сохранить',
            variant: 'primary',
            size: 'large',
            classes: ['profile_edit__btn'],
            onClick: () => this.handleFormSubmit(),
            disabled: true,
            stateUpdaters: this.#stateUpdaters,
        });

        console.log(this.#stateUpdaters);
    }

    handleFormSubmit() {
        const body: Record<string, any> = {};

        this.#stateUpdaters.forEach(({ name, value }) => {
            if (name === 'birth_date') value = convertDate(value, 'ts');
            const sections = {
                profile: () => {
                    body.profile ??= {};
                    if (name === 'avatar' || name === 'cover') {
                        body[name] = value instanceof File || (value instanceof FileList && value.length > 0) ? value : '';
                        return;
                    }
                    body.profile[name] = value;
                },
                contacts: () => {
                    body.contact_info ??= {};
                    body.contact_info[name] = value;
                },
                education: () => {
                    const key = name.startsWith('school') ? 'school' : 'university';
                    body[key] ??= {};
                    body[key][name] = name === 'grad_year' ? Number(value) : value;
                }
            };
            sections[this.#section]?.();
        })

        if (body.profile) {
            body.profile['sex'] = this.#userData.profile.sex;
            body.profile = JSON.stringify(body.profile);
        }
        if (body.contact_info) body.contact_info = JSON.stringify(body.contact_info);
        if (body.school) body.school = JSON.stringify(body.school);
        if (body.university) body.university = JSON.stringify(body.university);

        for (const key in this.#userData) {
            if (!body[key] || body[key].length === 0) {
                if (typeof this.#userData[key] === 'object') {
                    body[key] = JSON.stringify(this.#userData[key]);
                } else {
                    body[key] = this.#userData[key];
                }
            }
        }

        if (!body['cover']) body['cover'] = '';
        if (!body['avatar']) body['avatar'] = '';

        console.log(body);
        const fd = convertToFormData(body);

        Ajax.post({
            url: '/profile',
            body: fd,
            isFormData: true,
            callback: (status) => {
                switch (status) {
                    case 200:
                        this.postCbOk();
                        break;
                    case 401:
                        this.cbUnauthorized();
                        break;
                }
            }
        });
    }

    postCbOk() {
        console.log(router?.header);
        router?.header?.renderAvatarMenu();
        this.render(this.#section);
    }

    renderHeader() {
        const profileHeader = createElement({
            parent: this.#containerObj.left,
            classes: ['profile', 'profile_edit']
        });

        const cover = new CoverComponent(profileHeader, {
            src: this.#userData.profile.cover_url,
            type: 'edit',
        });

        this.#stateUpdaters.push(cover.fileInput);

        const avatar = new AvatarComponent(profileHeader, {
            size: 'xxl',
            src: this.#userData.profile.avatar_url,
            type: 'edit'
        });

        this.#stateUpdaters.push(
            new FileInputComponent(this.#containerObj.left, {
                imitator: avatar.wrapper,
                preview: avatar.avatar,
                id: 'profile-avatar-upload',
                name: 'avatar',
            })
        );
    }
}

export default new EditProfileView();
