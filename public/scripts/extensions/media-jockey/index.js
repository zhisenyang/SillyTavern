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
        case 'common.hover':
            break;
        case 'common.menuVisible':
            if (data.data) {
                $('#top-bar').show();
                $('#top-settings-holder').show();
            } else {
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

let t = 0,
    total = 0;
$(document).on('mousedown', event => {
    if (event.button === 2) {
        total += 1;
        if (total === 1) {
            t = new Date().valueOf();
        }
        if (total === 2) {
            let now = new Date().valueOf();
            if (now - t < 300) {
                speak(event.target.textContent);
                total = 0;
                t = 0;
            } else {
                total = 1;
                t = now;
            }
        }
    } else if (event.button > 2) {
        const chatElement = $('#chat');
        const isNext = event.button === 3;
        const userMesList = $('div[is_user="true"]');
        let index = userMesList.length - 1;
        for (let i = 0; i < userMesList.length; i++) {
            if (userMesList[i].offsetTop >= chatElement.scrollTop()) {
                index = i;
                break;
            }
        }
        let nextIndex = index + (isNext ? 1 : -1);
        if (nextIndex <= 0) {
            nextIndex = 0;
        } else if (nextIndex >= userMesList.length) {
            nextIndex = userMesList.length - 1;
        }
        chatElement.scrollTop(userMesList[nextIndex].offsetTop);
    }
});
