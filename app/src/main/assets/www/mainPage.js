
class MainPage {
    tools;
    deviceSettingDialog;
    apiSettingDialog;
    toast;
    constructor() {
        this.tools = new Tools();
        this.apiSettingDialog = new ApiSettingDialog(this.onRefreshApiSettings.bind(this), this.showToast.bind(this));
        this.deviceSettingDialog = new DeviceSettingDialog(this.onRemoveDeviceSetting.bind(this), this.onSaveDeviceSetting.bind(this), this.showToast.bind(this));
    }
    init() {
        this.deviceSettingDialog.init();
        this.apiSettingDialog.init();

        this.toast = new bootstrap.Toast(document.getElementById('toast'));

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
    onRemoveDeviceSetting(deviceSettingId) {
        let savedApiSettings = this.apiSettingDialog.getApiSettingsFromLocalStorage();
        const filteredApiSettings = savedApiSettings.filter((setting)=>{
            return setting.DeviceSettingId !== deviceSettingId;
        })
        this.apiSettingDialog.saveApiSettingsInLocalStorage(filteredApiSettings);
        this.apiSettingDialog.apiSettingsRefresh();

    }
    onSaveDeviceSetting() {
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
    }
    getDataForSave(targetDeviceSetting, targetApiSetting) {
        const data = {
            ApiKey: targetDeviceSetting.apiCode,
            ChangeShareOnMapParams: {
                IsAllow: targetApiSetting.IsAllow,
                IsShowOnlyBySearchCode: targetApiSetting.IsShowOnlyBySearchCode,
                SearchCode: targetApiSetting.SearchCode,
                IsShowImageLabel: targetApiSetting.IsShowImageLabel,
                ImageUrl: !!targetApiSetting.ImageUrl ? targetApiSetting.ImageUrl : undefined,
                ImageBase64: !!targetApiSetting.ImageBase64 ? targetApiSetting.ImageBase64.split(',')[1] : undefined,
                IsShowTextLabel: targetApiSetting.IsShowTextLabel,
                TextLabel: targetApiSetting.TextLabel,
                Description: targetApiSetting.Description,
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
            this.showToast('Запрос отправлен', 'success');
        else
            this.showToast(errorMessage, 'error');
    }

}


$(document).ready(async () => {
    const mainPage = new MainPage();
    mainPage.init();

});