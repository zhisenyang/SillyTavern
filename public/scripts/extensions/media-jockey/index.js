import { chat, eventSource, event_types, sendTextareaMessage } from '../../../script.js';

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

eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, () => {
    postChat();
    speak(chat[chat.length - 1].mes);
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
            }else {
                $('#top-bar').hide();
                $('#top-settings-holder').hide();
            }
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
