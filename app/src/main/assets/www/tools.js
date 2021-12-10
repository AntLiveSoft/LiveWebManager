class Tools {
    constructor() {
    }

    saveInLocalStorage(name, obj) {
        localStorage.setItem(name, JSON.stringify(obj));
    }

    loadFromLocalStorage(name, defaultRes) {
        var item = localStorage.getItem(name);
        if (!item)
            return defaultRes || null;
        return JSON.parse(item);
    }

    deleteInLocalStorage(name) {
        localStorage.removeItem(name);
    }

    randomString(length, chars) {
        let mask = '';

        if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
        if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (chars.indexOf('#') > -1) mask += '0123456789';
        if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
        let result = '';

        for (let i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
        return result;
    }

    randomStr(length) {
        return this.randomString(length, "a#");
    }
    getFileUrl(file) {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e)=>{
                resolve(e.target.result);
            }
        });

    }
}