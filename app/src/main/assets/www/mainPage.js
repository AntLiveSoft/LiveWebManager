
class MainPage {
    LAST_SELECTED_DEVICE_SETTING_ID_NAME_FOR_LOCAL_STORAGE = 'lastSelectedDeviceSettingId'
    tools;
    deviceSettingDialog;
    apiSettingDialog;
    toast;
    confirmToast;
    constructor() {
        this.tools = new Tools();
        this.apiSettingDialog = new ApiSettingDialog(this.onRefreshApiSettings.bind(this), this.showToast.bind(this), this.showDeleteConfirmToast.bind(this));
        this.deviceSettingDialog = new DeviceSettingDialog(this.onRemoveDeviceSetting.bind(this), this.onSaveDeviceSetting.bind(this), this.showToast.bind(this), this.showDeleteConfirmToast.bind(this));
    }
    init() {
        this.deviceSettingDialog.init();
        this.apiSettingDialog.init();

        this.toast = new bootstrap.Toast(document.getElementById('toast'));
        this.confirmToast = new bootstrap.Toast(document.getElementById('confirmToast'), {
            autohide: false
        });

        $('#deviceSetting').val(this.getLastSelectedDeviceSettingIdFromLocalStorage());

        $('#deviceSetting').on('change', ()=>{
            this.apiSettingDialog.apiSettingsRefresh();
            const deviceSettingId = document.getElementById('deviceSetting').value;
           this.saveLastSelectedDeviceSettingIdInLocalStorage(deviceSettingId);
        });
    }
    getLastSelectedDeviceSettingIdFromLocalStorage() {
        return this.tools.loadFromLocalStorage(this.LAST_SELECTED_DEVICE_SETTING_ID_NAME_FOR_LOCAL_STORAGE, '');
    }
    saveLastSelectedDeviceSettingIdInLocalStorage(deviceSettingId) {
        this.tools.saveInLocalStorage(this.LAST_SELECTED_DEVICE_SETTING_ID_NAME_FOR_LOCAL_STORAGE, deviceSettingId);
    }
    onRefreshApiSettings() {
        $('.api-setting-card').off('click');
        $('.api-setting-card').on('click', this.sendApiSetting.bind(this));
    }
    showToast(message, type) {
        $('#toast').removeClass(type == 'error' ? 'bg-success' : 'bg-danger').addClass(type == 'error' ? 'bg-danger' : 'bg-success');
        $('#toast').find('.toast-body').html(message);
        this.toast.show();
    }
    showDeleteConfirmToast(message, onConfirmDelete) {
        $('#confirmToastOverlay').css('display', 'flex');
        $('#confirmToast').find('.toast-body').find('h5').html(message);
        this.confirmToast.show();
        $('#confirmDeleteSetting').on('click', ()=>{
            $('#confirmToastOverlay').css('display', 'none');
            this.confirmToast.hide();
            onConfirmDelete();
        })
        $('#closeConfirmDeleteSetting').on('click', ()=>{
            $('#confirmToastOverlay').css('display', 'none');
            this.confirmToast.hide();
        })
    }
    onRemoveDeviceSetting(deviceSettingId) {
        let savedApiSettings = this.apiSettingDialog.getApiSettingsFromLocalStorage();
        const filteredApiSettings = savedApiSettings.filter((setting)=>{
            return setting.DeviceSettingId !== deviceSettingId;
        })
        this.apiSettingDialog.saveApiSettingsInLocalStorage(filteredApiSettings);

        const savedDeviceSettings = this.deviceSettingDialog.getDeviceSettingsFromLocalStorage();

        const targetDeviceSettingId = savedDeviceSettings[0]?.deviceSettingId || '';
        $('#deviceSetting').val(targetDeviceSettingId);
        this.saveLastSelectedDeviceSettingIdInLocalStorage(targetDeviceSettingId);

        this.apiSettingDialog.apiSettingsRefresh();

    }
    onSaveDeviceSetting(deviceSettingId) {
        $('#deviceSetting').val(deviceSettingId);
        this.saveLastSelectedDeviceSettingIdInLocalStorage(deviceSettingId);
        this.apiSettingDialog.apiSettingsRefresh();
    }

    async sendApiSetting(event) {
        let savedApiSettings = this.apiSettingDialog.getApiSettingsFromLocalStorage();
        const apiSettingId = event.currentTarget.id;
        const targetApiSetting = savedApiSettings.find((setting)=>{
            return setting.ApiSettingId === apiSettingId;
        });
        let savedDeviceSettings = this.deviceSettingDialog.getDeviceSettingsFromLocalStorage();
        const selectedDeviceId = this.deviceSettingDialog.getSelectedDeviceSettingId();
        if(selectedDeviceId) {
            const targetDeviceSetting = savedDeviceSettings.find((setting)=>{
                return setting.deviceSettingId === selectedDeviceId;
            });
            const data = this.getDataForSave(targetDeviceSetting, targetApiSetting);
            const result = await this.sendRequest(data);

            this.showRequestResult(result.IsSuccess, result.ErrorMessage);
        }
        else
            this.showToast('Добавьте устройство', 'error');
    }
    getDataForSave(targetDeviceSetting, targetApiSetting) {
        const data = {
            ApiKey: targetDeviceSetting.apiCode,
            ChangeShareOnMapParams: {
                ...(targetApiSetting.IsChangePublicOnSharedMapSettings && { IsAllow: targetApiSetting.IsAllow }),
                ...(targetApiSetting.IsChangeShowOnlyBySearchCodeSettings && {  IsShowOnlyBySearchCode: targetApiSetting.IsShowOnlyBySearchCode, }),
                ...(targetApiSetting.IsChangeSearchCodeSettings && {  SearchCode: targetApiSetting.SearchCode, }),
                ...(targetApiSetting.IsChangeShowImageLabelSettings && {  IsShowImageLabel: targetApiSetting.IsShowImageLabel, }),
                ...(targetApiSetting.IsChangeImageLabelSettings && {  ImageUrl: !!targetApiSetting.ImageUrl ? targetApiSetting.ImageUrl : undefined, }),
                ...(targetApiSetting.IsChangeImageLabelSettings && {  ImageBase64: !!targetApiSetting.ImageBase64 ? targetApiSetting.ImageBase64.split(',')[1] : undefined, }),
                ...(targetApiSetting.IsChangeShowTextLabelSettings && {   IsShowTextLabel: targetApiSetting.IsShowTextLabel, }),
                ...(targetApiSetting.IsChangeTextLabelSettings && {   TextLabel: targetApiSetting.TextLabel, }),
                ...(targetApiSetting.IsChangeDescriptionSettings && {    Description: targetApiSetting.Description, }),
            }
        }
        return data;
    }
    sendRequest(data) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://service.antlive.org/api/live/executecommand',
                type: "POST",
                data: JSON.stringify(data),
                contentType: "application/json; charset=UTF-8",
                async: true,
                cache: false,
                success: (data, status, xhr) => {
                    resolve(data);
                },
                error: (err) => {
                    this.showToast(err.responseText, 'error');
                    reject(err)
                }
            });
        })
    }
    showRequestResult(isSuccess, errorMessage) {
        if(isSuccess)
            this.showToast('Изменения успешно применены', 'success');
        else
            this.showToast(errorMessage, 'error');
    }

}


$(document).ready(async () => {
    const mainPage = new MainPage();
    mainPage.init();

});