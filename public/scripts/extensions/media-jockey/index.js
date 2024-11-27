import { chat, eventSource, event_types, sendTextareaMessage, saveSettingsDebounced } from '../../../script.js';
import { power_user, applyCustomCSS } from '../../power-user.js';

const sendTextarea = document.querySelector('#send_textarea');

function log(...args) {
    console.log('[Media Jockey]', ...args);
}

function speak(text) {
    window.parent.postMessage({
        action: 'chat.speak',
        data: text.replaceAll('*', ''),
    }, '*');
}

function postChat() {
    window.parent.postMessage({
        action: 'chat.all',
        data: chat,
    }, '*');
}

eventSource.on(event_types.CHAT_CHANGED, () => {
    postChat();
});

eventSource.on(event_types.MESSAGE_RECEIVED, () => {
    postChat();
    speak(chat[chat.length - 1].mes);
});

eventSource.on(event_types.STREAM_TOKEN_RECEIVED, (text) => {
    log(text);
    // postChat();
});

window.addEventListener('message', async (event) => {
    const { data } = event;
    log('parent message', data);
    switch (data.action) {
        case 'send.text':
            sendTextarea.value = data.data;
            await sendTextareaMessage();
            break;
        case 'common.display':
            if (data.data) {
                $('#top-bar').show();
                $('#top-settings-holder').show();
            } else {
                $('#top-bar').hide();
                $('#top-settings-holder').hide();
            }
            break;
        case '':
            power_user.custom_css = String($('#customCSS').val());
            saveSettingsDebounced();
            applyCustomCSS();
            break;
    }
}, false);

log('load');

$(document).on('dblclick', (e) => {
    const target = $(e.target)[0];
    // console.log('target.localName', target, target.localName);
    if (target.localName !== 'p') return;
    // log('speak', target.textContent);
    speak(target.textContent);
});

let t = 0,
    total = 0;
$(document).on('mousedown', event => {
    if (event.button != 2) return;
    total += 1;
    if (total === 1) {
        t = new Date().valueOf();
    }
    if (total === 2) {
        let now = new Date().valueOf();
        if (now - t < 300) {
            console.log('右侧双击', event.target.textContent);
            total = 0;
            t = 0;
        } else {
            total = 1;
            t = now;
        }
    }
});
