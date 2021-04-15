export function makeguid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function displayModal(id) {
    try {
        const el = document.getElementById(id);
        el.className = el.className.replace('enabled', '').replace('opacity-1', '') + ' enabled';
        setTimeout((() => {
            el.className += ' opacity-1';
        }).bind(this), 100);
    } catch (ex) {
        console.log(ex);
    }
}

export function hideModal(id) {
    try {
        const el = document.getElementById(id);
        el.className = el.className.replace('opacity-1', '');
        setTimeout((() => {
            el.className = el.className.replace('enabled', '').replace('opacity-1', '');
        }).bind(this), 250);
    } catch (ex) {
        console.log(ex);
    }
}

export function clone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (ex) {
        console.log(ex);
    }

    return obj;
}

export function refreshArrayPage(lastPage, pagination) {
    pagination.arrayPage = [];
    pagination.lastPage = lastPage;

    if (!lastPage) {
        return;
    }
    const counter = 2;
    const actual = pagination.page;
    for (let i = 1; i <= pagination.lastPage; i++) {
        let v = i - actual;
        if (v < 0) {
            v *= -1;
        }
        if (v <= counter) {
            pagination.arrayPage.push(i);
        }
    }
}

export function thread(f, t = 0) {
    setTimeout(f, t);
}

export var beforeInstall = null;
window.addEventListener('beforeinstallprompt', event => {
    console.log('beforeinstall');
    beforeInstall = event;
});

export function installApp() {
    beforeInstall.prompt();
}

export function notification({title, body, onclick}) {
    if(('Notification' in window) ) {
        Notification.requestPermission(function(permission) {
            var notification = new Notification(title, {body, icon: 'assets/img/logo.jpg', dir: 'auto'});
            setTimeout(function() {
                notification.close();
            }, 10000);
            notification.onclick = onclick;
        });
        return true;
    }
    
    return false;
}

export function dateToStr(d, horas = true) {
    return  horas ? d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + 
            ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ':' + ("0" + d.getSeconds()).slice(-2)
            : d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}