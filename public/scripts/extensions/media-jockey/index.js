import {chat, eventSource, event_types, sendTextareaMessage} from '../../../script.js';

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

function postChat(){
    const textContent = $('.mes_text');
    textContent.unbind('dblclick');
    textContent.on('dblclick', (e) => {
        speak($(e.target).text());
    });
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
    const {data} = event;
    log('parent message', data);
    switch (data.action) {
        case 'send.text':
            sendTextarea.value = data.data;
            await sendTextareaMessage();
            break;
    }
}, false);

log('load');
