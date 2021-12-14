class ApiSettingDialog {
    API_SETTINGS_NAME_FOR_LOCAL_STORAGE = 'apiSettings';
    apiSettingDialog;
    tools;
    showToast;
    showDeleteConfirmToast;
    onRefreshApiSettings;
    constructor(onRefreshApiSettings, showToast, showDeleteConfirmToast) {
        this.tools = new Tools();
        this.onRefreshApiSettings = onRefreshApiSettings;
        this.showToast = showToast;
        this.showDeleteConfirmToast = showDeleteConfirmToast;
    }
    init() {
        this.apiSettingDialog = new bootstrap.Modal(document.getElementById('apiSettingDialog'), {
            keyboard: false
        });

        this.apiSettingsRefresh();

        $('#addApiSetting').on('click', this.addNewApiSetting.bind(this));
        $('#saveApiSetting').on('click', this.saveApiSetting.bind(this));

        $('#clearImageBase64').on('click', ()=>{
            let formElements = document.getElementById('apiSettingForm').elements;
            formElements['ImageBase64'].value = '';
        });

        $('.is-change-settings').on('change', this.apiSettingsDisableControls.bind(this));
    }
    getSelectedDeviceSettingId() {
        return document.getElementById('deviceSetting').value;
    }
    getApiSettingsFromLocalStorage() {
        return this.tools.loadFromLocalStorage(this.API_SETTINGS_NAME_FOR_LOCAL_STORAGE, []);
    }
    saveApiSettingsInLocalStorage(apiSettings) {
        this.tools.saveInLocalStorage(this.API_SETTINGS_NAME_FOR_LOCAL_STORAGE, apiSettings);
    }

    async apiSettingsDisableControls() {
        const formData = await this.getValueApiSettingForm();

        $('#isAllowPublicOnSharedMap').prop('disabled', !formData.IsChangePublicOnSharedMapSettings);
        $('#isShowTextLabel').prop('disabled', !formData.IsChangeShowTextLabelSettings);
        $('#textLabel').prop('disabled', !formData.IsChangeTextLabelSettings);
        $('#isShowImageLabel').prop('disabled', !formData.IsChangeShowImageLabelSettings);
        $('#imgBase64Label').prop('disabled', !formData.IsChangeImageLabelSettings);
        $('#clearImageBase64').prop('disabled', !formData.IsChangeImageLabelSettings);
        $('#imageUrl').prop('disabled', !formData.IsChangeImageLabelSettings);
        $('#description').prop('disabled', !formData.IsChangeDescriptionSettings);
        $('#isShowOnlyBySearchCode').prop('disabled', !formData.IsChangeShowOnlyBySearchCodeSettings);
        $('#searchCode').prop('disabled', !formData.IsChangeSearchCodeSettings);
    }

    apiSettingsRefresh() {
        const deviceSettingId = this.getSelectedDeviceSettingId();
        const savedApiSettings = this.getApiSettingsFromLocalStorage();

        const savedApiSettingsForCurrentDevice = savedApiSettings.filter((setting)=>{
            return  deviceSettingId === setting.DeviceSettingId || !setting.DeviceSettingId;
        });

        let cardsForDevice = [];
        let cardsForAllDevices = [];
        savedApiSettingsForCurrentDevice.forEach((setting) => {
            const str = `
                            <div class="card api-setting-card mt-2 bg-primary text-white shadow-sm api-setting-card" id="${setting.ApiSettingId}">
                                <div class="card-body d-flex flex-row align-items-center p-0">
                                    <div class="d-flex flex-column">
                                         <button type="button" class="btn btn-outline-primary btn-sm p-2 edit-api-setting bg-light" data-api-setting-id="${setting.ApiSettingId}">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                                            </svg>
                                        </button>
                                        <button type="button" class="btn btn-outline-primary btn-sm p-2 remove-api-setting bg-light" data-api-setting-id="${setting.ApiSettingId}" style="opacity: 0.9">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                            </svg>
                                        </button>
                                    </div>
                                     <h5 class="card-title" style="width: 100%; text-align: center">${setting.ApiSettingName}</h5>
                                 </div>
                             </div>
                        `;
            if(setting.DeviceSettingId)
                cardsForDevice.push(str);
            else
                cardsForAllDevices.push(str);
        })

        $('#apiSettingsForDeviceLabel').css('display', cardsForDevice.length ? 'block' : 'none');

        $('#apiSettingsForAllDevicesLabel').css('display', cardsForAllDevices.length ? 'block' : 'none');

        $('#apiSettingsForDevice').html(cardsForDevice.join(' '));
        $('#apiSettingsForAllDevices').html(cardsForAllDevices.join(' '));

        this.editAndRemoveSubscribersInit();
        this.onRefreshApiSettings();
    }

    editAndRemoveSubscribersInit() {
        $('.edit-api-setting').off('click');
        $('.remove-api-setting').off('click');
        $('.edit-api-setting').on('click', this.editApiSetting.bind(this));
        $('.remove-api-setting').on('click', this.beforeRemoveApiSetting.bind(this));
    }
    addNewApiSetting() {
        this.openApiSettingDialog();
    }
    editApiSetting(event) {
        event.stopPropagation();
        const apiSettingId = event.currentTarget.getAttribute('data-api-setting-id');
        this.openApiSettingDialog(apiSettingId);
    }
    beforeRemoveApiSetting(event) {
        event.stopPropagation();
        this.showDeleteConfirmToast('Удалить настройку?', ()=>{
            const apiSettingId = event.currentTarget.getAttribute('data-api-setting-id')
            this.removeApiSetting(apiSettingId);
        })
    }
    removeApiSetting(apiSettingId) {
        let savedApiSettings = this.getApiSettingsFromLocalStorage();

        const apiSettingWithoutCurrentSettings = savedApiSettings.filter((setting, index) => {
            return apiSettingId !== setting.ApiSettingId
        });

        this.saveApiSettingsInLocalStorage(apiSettingWithoutCurrentSettings);
        this.apiSettingsRefresh();
    }

    setValueApiSettingForm(formData) {
        let formElements = document.getElementById('apiSettingForm').elements;
        formElements['ApiSettingName'].value = formData.ApiSettingName;
        formElements['IsAllow'].checked = formData.IsAllow;
        formElements['IsShowOnlyBySearchCode'].checked = formData.IsShowOnlyBySearchCode;
        formElements['SearchCode'].value = formData.SearchCode;
        formElements['IsShowImageLabel'].checked = formData.IsShowImageLabel;
        formElements['IsShowTextLabel'].checked = formData.IsShowTextLabel;
        formElements['ImageUrl'].value = formData.ImageUrl;
        formElements['TextLabel'].value = formData.TextLabel;
        formElements['Description'].value = formData.Description;
        formElements['IsChangePublicOnSharedMapSettings'].checked = formData.IsChangePublicOnSharedMapSettings;
        formElements['IsChangeTextLabelSettings'].checked = formData.IsChangeTextLabelSettings;
        formElements['IsChangeShowTextLabelSettings'].checked = formData.IsChangeShowTextLabelSettings;
        formElements['IsChangeImageLabelSettings'].checked = formData.IsChangeImageLabelSettings;
        formElements['IsChangeShowImageLabelSettings'].checked = formData.IsChangeShowImageLabelSettings;
        formElements['IsChangeDescriptionSettings'].checked = formData.IsChangeDescriptionSettings;
        formElements['IsChangeSearchCodeSettings'].checked = formData.IsChangeSearchCodeSettings;
        formElements['IsChangeShowOnlyBySearchCodeSettings'].checked = formData.IsChangeShowOnlyBySearchCodeSettings;


        if(!!formData.ImageBase64) {
            const file = new File([formData.ImageBase64], 'Загружено', {type: 'image/png'});
            let dt = new DataTransfer();
            dt.items.add(file);
            const file_list = dt.files;
            formElements['ImageBase64'].files = file_list;
        }
        else
            formElements['ImageBase64'].value = '';

        const deviceSettingId = document.getElementById('deviceSetting').value;
        $('#allDevices').prop('checked', !formData.DeviceSettingId);
        $('#allDevices').prop('disabled', !formData.DeviceSettingId && !deviceSettingId);

    }

    openApiSettingDialog(apiSettingId) {
        if(apiSettingId) {
            let savedApiSettings = this.getApiSettingsFromLocalStorage();
            const currentApiSetting = savedApiSettings.find((setting)=>{
                return setting.ApiSettingId === apiSettingId;
            });
            this.currentApiSettingId = currentApiSetting.ApiSettingId;
            this.currentImageBase64 = currentApiSetting.ImageBase64;
            this.setValueApiSettingForm(currentApiSetting);
        }
        else {
            this.currentApiSettingId = null;
            this.currentImageBase64 = null;
            const deviceSettingId = document.getElementById('deviceSetting').value;
            this.setValueApiSettingForm({
                ApiSettingName: '',
                IsChangePublicOnSharedMapSettings: false,
                IsChangeTextLabelSettings: false,
                IsChangeShowTextLabelSettings: false,
                IsChangeImageLabelSettings: false,
                IsChangeShowImageLabelSettings: false,
                IsChangeDescriptionSettings: false,
                IsChangeSearchCodeSettings: false,
                IsChangeShowOnlyBySearchCodeSettings: false,
                SearchCode: '',
                ImageUrl: '',
                TextLabel: '',
                Description: '',
                ImageBase64: '',
                IsShowOnlyBySearchCode: false,
                IsShowImageLabel: false,
                IsShowTextLabel: false,
                DeviceSettingId: deviceSettingId,
            });
        }
        this.apiSettingDialog.show();
        this.apiSettingsDisableControls();
    }
    async getValueApiSettingForm() {
        const formElements = document.getElementById('apiSettingForm').elements;
        const image = formElements['ImageBase64'].files[0];
        let imageBase64;
        if(!!image && image.name === 'Загружено')
            imageBase64 = this.currentImageBase64;
        else if(image)
            imageBase64 = await this.tools.getFileUrl(image);
        return  {
            ApiSettingName: formElements['ApiSettingName'].value,
            IsChangePublicOnSharedMapSettings: formElements['IsChangePublicOnSharedMapSettings'].checked,
            IsChangeTextLabelSettings: formElements['IsChangeTextLabelSettings'].checked,
            IsChangeShowTextLabelSettings: formElements['IsChangeShowTextLabelSettings'].checked,
            IsChangeImageLabelSettings: formElements['IsChangeImageLabelSettings'].checked,
            IsChangeShowImageLabelSettings: formElements['IsChangeShowImageLabelSettings'].checked,
            IsChangeDescriptionSettings: formElements['IsChangeDescriptionSettings'].checked,
            IsChangeSearchCodeSettings: formElements['IsChangeSearchCodeSettings'].checked,
            IsChangeShowOnlyBySearchCodeSettings: formElements['IsChangeShowOnlyBySearchCodeSettings'].checked,
            IsAllow: formElements['IsAllow'].checked,
            IsShowOnlyBySearchCode: formElements['IsShowOnlyBySearchCode'].checked,
            SearchCode: formElements['SearchCode'].value,
            IsShowImageLabel: formElements['IsShowImageLabel'].checked,
            IsShowTextLabel: formElements['IsShowTextLabel'].checked,
            ImageUrl: formElements['ImageUrl'].value,
            TextLabel: formElements['TextLabel'].value,
            Description: formElements['Description'].value,
            ImageBase64: imageBase64,
        }
    }
    async saveApiSetting() {
        const deviceSettingId = document.getElementById('deviceSetting').value;
        const isForAllDevices = document.getElementById('allDevices').checked;
        if(!deviceSettingId && !isForAllDevices) {
            this.showToast('Выберите устройство', 'error');
            return;
        }
        const formData = await this.getValueApiSettingForm();

        const dataForSave = {
            DeviceSettingId: isForAllDevices ? undefined : deviceSettingId,
            ApiSettingId: this.currentApiSettingId ? this.currentApiSettingId : `api_setting_${this.tools.randomStr(5)}`,
            ...formData
        }
        let savedApiSettings = this.getApiSettingsFromLocalStorage();

        let newApiSettings = [];
        savedApiSettings.forEach(savedApiSetting => {
            if(savedApiSetting.ApiSettingId === this.currentApiSettingId) {
                newApiSettings.push(dataForSave);
            }
            else
                newApiSettings.push(savedApiSetting);
        });
       if(!this.currentApiSettingId)
            newApiSettings.push(dataForSave);

        this.saveApiSettingsInLocalStorage(newApiSettings);
        this.apiSettingsRefresh();
        this.apiSettingDialog.hide();
    }

}