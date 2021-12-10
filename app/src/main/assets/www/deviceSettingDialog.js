class DeviceSettingDialog {
    DEFAULT_DEVICE_SETTING_SELECT_OPTION = '<option disabled selected value="">Выберите устройство</option>';
    DEVICE_SETTINGS_NAME_FOR_LOCAL_STORAGE = 'deviceSettings';
    currentDeviceSettingId;
    deviceSettingDialog;
    tools;
    onRemoveDeviceSetting;
    onSaveDeviceSetting;
    showToast;
    constructor(onRemoveDeviceSetting, onSaveDeviceSetting, showToast) {
        this.tools = new Tools();
        this.onRemoveDeviceSetting = onRemoveDeviceSetting;
        this.onSaveDeviceSetting = onSaveDeviceSetting;
        this.showToast = showToast;
    }
    init() {
        this.deviceSettingDialog = new bootstrap.Modal(document.getElementById('deviceSettingDialog'), {
            keyboard: false
        });

        this.deviceSettingSelectRefresh();

        $('#addDeviceSetting').on('click', this.addNewDeviceSetting.bind(this));
        $('#editDeviceSetting').on('click', this.editDeviceSetting.bind(this));
        $('#removeDeviceSetting').on('click', this.removeDeviceSetting.bind(this));
        $('#saveDeviceSetting').on('click', this.saveDeviceSetting.bind(this));
    }
    getSelectedDeviceSettingId() {
        return document.getElementById('deviceSetting').value;
    }
    getDeviceSettingsFromLocalStorage() {
        return this.tools.loadFromLocalStorage(this.DEVICE_SETTINGS_NAME_FOR_LOCAL_STORAGE, []);
    }
    saveDeviceSettingsInLocalStorage(deviceSettings) {
        this.tools.saveInLocalStorage(this.DEVICE_SETTINGS_NAME_FOR_LOCAL_STORAGE, deviceSettings);
    }
    deviceSettingSelectRefresh() {
        const savedDeviceSettings = this.getDeviceSettingsFromLocalStorage();
        let options = [this.DEFAULT_DEVICE_SETTING_SELECT_OPTION];
        savedDeviceSettings.forEach((setting) => {
            const str = `<option value="${setting.deviceSettingId}">${setting.deviceSettingName}</option>`;
            options.push(str);
        })
       $('#deviceSetting').html(options.join(' '));
    }
    setDialogTitle(dialogTitle) {
        $('#deviceSettingDialogTitle').html(dialogTitle);
    }
    addNewDeviceSetting() {
        this.currentDeviceSettingId = null;
        this.setDialogTitle('Добавить новое устройство');
        this.openDeviceSettingDialog();
    }
    editDeviceSetting() {
        const deviceSettingId = this.getSelectedDeviceSettingId();

        if(!deviceSettingId) {
            this.showToast('Выберите устройство', 'error');
            return;
        }

        this.currentDeviceSettingId = deviceSettingId;
        this.setDialogTitle('Редактировать устройство');
        this.openDeviceSettingDialog(deviceSettingId);
    }
    openDeviceSettingDialog(deviceSettingId) {
        if(!deviceSettingId) {
            this.setValueDeviceSettingForm({
                apiCode: '',
                deviceSettingName: '',
            });
        }
        else {
            let savedDeviceSettings = this.getDeviceSettingsFromLocalStorage();
            const currentDeviceSetting = savedDeviceSettings.find((setting)=>{
                return setting.deviceSettingId === deviceSettingId;
            });
            this.setValueDeviceSettingForm({
                apiCode: currentDeviceSetting.apiCode,
                deviceSettingName: currentDeviceSetting.deviceSettingName
            });
        }
        this.deviceSettingDialog.show();
    }
    setValueDeviceSettingForm(formData) {
        let formElements = document.getElementById('deviceSettingForm').elements;
        formElements['apiCode'].value = formData.apiCode;
        formElements['deviceSettingName'].value = formData.deviceSettingName;
    }
    getValueDeviceSettingForm() {
        const formElements = document.getElementById('deviceSettingForm').elements;
        return  {
            apiCode: formElements['apiCode'].value,
            deviceSettingName: formElements['deviceSettingName'].value,
        }
    }
    removeDeviceSetting() {
        const deviceSettingId = this.getSelectedDeviceSettingId();

        if(!deviceSettingId) {
            this.showToast('Выберите устройство', 'error');
            return;
        }

        let savedDeviceSettings = this.getDeviceSettingsFromLocalStorage();

        const deviceSettingWithoutCurrentSettings = savedDeviceSettings.filter((setting, index) => {
            return deviceSettingId !== setting.deviceSettingId
        });

        this.saveDeviceSettingsInLocalStorage(deviceSettingWithoutCurrentSettings);

        this.deviceSettingSelectRefresh();
        this.onRemoveDeviceSetting(deviceSettingId);
    }
    saveDeviceSetting() {
        const deviceSettingId = this.currentDeviceSettingId ? this.currentDeviceSettingId : `device_setting_${this.tools.randomStr(5)}`
        const formData = {
            deviceSettingId: deviceSettingId,
            ...this.getValueDeviceSettingForm()
        }

        const savedDeviceSettings = this.getDeviceSettingsFromLocalStorage();
        let newDeviceSettings = [];
        savedDeviceSettings.forEach(savedDeviceSetting => {
            if(savedDeviceSetting.deviceSettingId === deviceSettingId)
                newDeviceSettings.push(formData);
            else
                newDeviceSettings.push(savedDeviceSetting);
        });
        if(!this.currentDeviceSettingId)
            newDeviceSettings.push(formData);

        this.saveDeviceSettingsInLocalStorage(newDeviceSettings);
        this.deviceSettingSelectRefresh();
        $('#deviceSetting').val(formData.deviceSettingId);
        this.deviceSettingDialog.hide();
        this.onSaveDeviceSetting();
    }
}