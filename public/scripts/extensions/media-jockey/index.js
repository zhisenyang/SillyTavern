import { chat, eventSource, event_types, sendTextareaMessage } from '../../../script.js';

const sendTextarea = document.querySelector('#send_textarea');

function log(...args) {
    console.log('[Media Jockey]', ...args);
}

function postAllChat(){
    const data = {
        action: 'chat.all',
        data: chat,
    };
    window.parent.postMessage(data, '*');
    log(data);
}

// eventSource.on(event_types.CHAT_CHANGED, postAllChat);

eventSource.on(event_types.GENERATE_AFTER_DATA, postAllChat);


window.addEventListener('message', async (event) => {
    const { data } = event;
    log('parent message', data);
    switch (data.action) {
        case 'send.text':
            sendTextarea.value = data.data;
            await sendTextareaMessage();
            break;
    }
}, false);

log('load');
