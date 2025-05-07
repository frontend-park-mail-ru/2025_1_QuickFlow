import RadioMenuComponent from '@components/RadioMenuComponent/RadioMenuComponent';
import MainLayoutComponent from '@components/MainLayoutComponent/MainLayoutComponent';
import AvatarComponent from '@components/AvatarComponent/AvatarComponent';
import ButtonComponent from '@components/UI/ButtonComponent/ButtonComponent';
import InputComponent from '@components/UI/InputComponent/InputComponent';
import PopUpComponent from '@components/UI/PopUpComponent/PopUpComponent';
import CoverComponent from '@components/CoverComponent/CoverComponent';
import FileInputComponent from '@components/UI/FileInputComponent/FileInputComponent';

import createElement from '@utils/createElement';
import TextareaComponent from '@components/UI/TextareaComponent/TextareaComponent';
import convertDate from '@utils/convertDate';

import router from '@router';
import { forms } from './CommunityEditFormConfig';
import API from '@utils/api';
import { FILE } from '@config';
import EmptyStateComponent from '@components/EmptyStateComponent/EmptyStateComponent';
import FriendComponent from '@components/FriendComponent/FriendComponent';
import SearchComponent from '@components/SearchComponent/SearchComponent';
import DeleteMwComponent from '@components/UI/ModalWindowComponent/DeleteMwComponent';


class CommunityEditView {
    private containerObj: MainLayoutComponent;
    private section: string = null;
    private communityData: Record<string, any> = null;
    private stateUpdaters: Array<any> = [];
    private submitButton: ButtonComponent;
    private params: Record<string, any>;

    constructor() {}

    async render(params: Record<string, any>, section: string = 'settings') {
        this.params = params;

        this.containerObj = new MainLayoutComponent().render({
            type: 'feed',
        });

        const [status, communityData] = await API.getCommunity(this.params.address);
        switch (status) {
            case 200:
                this.communityData = communityData;
                break;
            case 401:
                return router.go({ path: '/login' });
            case 404:
                return router.go({ path: '/not-found' });
        }

        new RadioMenuComponent(this.containerObj.right, {
            items: {
                settings: {
                    title: 'Настройка',
                    onClick: () => this.renderSection('settings')
                },
                contacts: {
                    title: 'Контакты',
                    onClick: () => this.renderSection('contacts')
                },
                members: {
                    title: 'Подписчики',
                    onClick: () => this.renderSection('members')
                    // onClick: () => this.renderMembers(),
                },
                managers: {
                    title: 'Управляющие',
                    onClick: () => this.renderSection('managers')
                },
                deletion: {
                    title: 'Удаление сообщества',
                    onClick: () => this.renderDeleteCommunity(),
                },
            },
        active: section,
    });
        this.renderSection(section);
    }

    private async renderDeleteCommunity() {
        this.containerObj.left.innerHTML = '';

        createElement({
            tag: 'h1',
            parent: this.containerObj.left,
            text: 'Удаление сообщества',
        });

        createElement({
            parent: this.containerObj.left,
            classes: ['community_edit__text'],
            text: 'Все связанные данные, включая посты, комментарии и подписчиков, будут безвозвратно удалены. Пожалуйста, убедитесь, что хотите продолжить, так как восстановить информацию будет невозможно.',
        });

        new ButtonComponent(this.containerObj.left, {
            text: 'Удалить сообщество',
            variant: 'primary',
            onClick: () => {
                new DeleteMwComponent(this.containerObj.left, {
                    data: {
                        title: 'Удаление сообщества',
                        text: 'Вы уверены, что хотите удалить сообщество? После подтверждения удаления, действие нельзя будет отменить.',
                        cancel: 'Отмена',
                        confirm: 'Удалить',
                    },
                    delete: async () => {
                        const status = await API.deleteCommunity(this.communityData?.payload?.id);
                        switch (status) {
                            case 200:
                                router.go({ path: '/feed' });
                                new PopUpComponent({
                                    text: 'Сообщество было удалено',
                                })
                                break;
                            default:
                                new PopUpComponent({
                                    isError: true,
                                    text: 'Не удалось удалить сообщество, попробуйте позже',
                                })
                                break;
                        }
                    },
                })
            },
        });
    }




    private renderMembers() {
        const results = createElement({
            parent: this.containerObj.left,
            classes: [
                'communities',
                'communities__search-results',
                'hidden',
            ],
        });

        const members = createElement({
            parent: this.containerObj.left,
            classes: ['communities'],
        });

        new SearchComponent(this.containerObj.left, {
            placeholder: 'Введите запрос',
            classes: ['search_wide'],
            inputClasses: [
                'input_wide',
                'input_search-small',
                'communities__search',
            ],
            results,
            searchResults: API.searchCommunities,
            renderTitle: this.renderTitle,
            renderEmptyState: this.renderEmptyState,
            renderResult: this.renderCommunity,
            elementToHide: members,
        });
    }

    private renderTitle(parent: HTMLElement) {
        createElement({
            tag: 'h2',
            parent,
            classes: ['search__title'],
            text: 'Результаты поиска',
        });
    }

    private renderEmptyState(parent: HTMLElement) {
        new EmptyStateComponent(parent, {
            icon: 'communities-icon',
            text: 'Сообщества не найдены',
        });
    }

    private renderCommunity(parent: HTMLElement, friendData: Record<string, any>) {
        new FriendComponent(parent, {
            data: friendData,
        });
    }







    private async renderSection(sectionName: string) {
        this.section = sectionName;
        this.stateUpdaters = [];
        const sectionData = forms[this.section];
        this.containerObj.left.innerHTML = '';

        if (
            ['contacts', 'members', 'managers', 'deletion']
            .includes(this.section)
        ) {
            return new EmptyStateComponent(this.containerObj.left, {
                text: 'Этот раздел пока в разработке',
                icon: 'communities-icon',
            });
        }

        const [status, communityData] = await API.getCommunity(this.params.address);

        switch (status) {
            case 200:
                this.getCbOk(communityData, sectionData);
                break;
            case 401:
                router.go({ path: '/login' });
                break;
        }
    }

    getCbOk(communityData: Record<string, any>, sectionData: Record<string, any>) {
        this.communityData = communityData;
        if (sectionData.header) {
            this.renderHeader();
        }
        this.renderForm(sectionData);
    }

    renderForm(sectionData: Record<string, any>) {
        const fields = sectionData.fields;

        const form = createElement({
            parent: this.containerObj.left,
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
                    this.communityData?.payload?.[field.key] ??
                    this.communityData?.payload?.community?.[field.key] ??
                    this.communityData?.payload?.owner?.[field.key];

                if (field.config.name === 'birth_date') {
                    field.config.value = convertDate(field.config.value);
                }

                this.stateUpdaters.push(
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
        
        this.submitButton = new ButtonComponent(form, {
            text: 'Сохранить',
            variant: 'primary',
            size: 'large',
            classes: ['profile_edit__btn'],
            onClick: () => this.handleFormSubmit(),
            disabled: true,
            stateUpdaters: this.stateUpdaters,
        });
    }

    async handleFormSubmit() {
        this.submitButton.disable();

        const body: Record<string, any> = {};

        this.stateUpdaters.forEach(({ name, value }) => {
            const sections = {
                settings: () => {
                    if (name === 'avatar' || name === 'cover') {
                        body[name] = value instanceof File || (value instanceof FileList && value.length > 0) ? value : '';
                        return;
                    }
                    body[name] = value;
                }
            };
            sections[this.section]?.();
        })

        // if (!body['cover']) body['cover'] = '';
        // if (!body['avatar']) body['avatar'] = '';
        
        const newNickname = body?.nickname;

        try {
            const [status, communityData] = await API.editCommunity(this.communityData?.payload?.id, body);
            switch (status) {
                case 200:
                    this.postCbOk(newNickname);
                    break;
                case 401:
                    router.go({ path: '/login' });
                    break;
                default:
                    this.cbDefault();
                    break;
            }
        } catch {
            this.cbDefault();
        }
    }

    cbDefault() {
        new PopUpComponent({
            text: 'Не удалось сохранить изменеия',
            size: "large",
            isError: true,
        });
    }

    postCbOk(newNickname: string | undefined) {
        router.go({ path: `/communities/${newNickname}/edit` });
        new PopUpComponent({
            text: 'Изменения сохранены',
            icon: "check-icon",
            size: "large",
        });
    }

    renderHeader() {
        const profileHeader = createElement({
            parent: this.containerObj.left,
            classes: ['profile', 'profile_edit']
        });

        const cover = new CoverComponent(profileHeader, {
            src: this.communityData.payload.community.cover_url,
            type: 'edit',
        });

        this.stateUpdaters.push(cover.fileInput);

        const avatar = new AvatarComponent(profileHeader, {
            size: 'xxl',
            src: this.communityData.payload.community.avatar_url,
            type: 'edit',
        });

        this.stateUpdaters.push(
            new FileInputComponent(this.containerObj.left, {
                imitator: avatar.wrapper,
                preview: avatar.avatar,
                id: 'profile-avatar-upload',
                name: 'avatar',
                compress: true,
                maxResolution: FILE.IMG_MAX_RES,
                maxSize: FILE.MAX_SIZE_SINGLE * FILE.MB_MULTIPLIER,
            })
        );
    }
}

export default new CommunityEditView();
