import { chat, eventSource, event_types, sendTextareaMessage } from '../../../script.js';
import { loadFileToDocument } from '../../utils.js';

const extensionName = 'media-jockey';
const extensionFolderPath = `scripts/extensions/${extensionName}/`;

const sendTextarea = document.querySelector('#send_textarea');

function log(...args) {
    console.log('[Media Jockey]', ...args);
}

// function postChat() {
//     window.parent.postMessage({
//         action: 'chat.all',
//         data: chat,
//     }, '*');
// }

// eventSource.on(event_types.CHAT_CHANGED, () => {
//     postChat();
// });

// eventSource.on(event_types.MESSAGE_RECEIVED, () => {
//     postChat();
//     speak(chat[chat.length - 1].mes);
// });

let status = 2;

eventSource.on(event_types.GENERATION_STARTED, () => {
    status = 0;
});

eventSource.on(event_types.STREAM_TOKEN_RECEIVED, (text) => {
    if(status === 0){
        status = 1;
        speakList.length = 0;
    }
    _.merge(speakList, splitText(text));
    log(speakList);
});

eventSource.on(event_types.GENERATION_ENDED, () => {
    status = 2;
});

let config = {
    showMenu: true,
    autoNext: false,
    speakVoiceover: true,
};

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
        case 'tts.build':
            break;
        case 'config.change':
            config = data.data;
            if (config.showMenu) {
                $('#top-bar').show();
                $('#top-settings-holder').show();
            } else {
                $('#top-bar').hide();
                $('#top-settings-holder').hide();
            }
            break;
    }
}, false);


// $(document).on('dblclick', (e) => {
//     const target = $(e.target)[0];
//     // console.log('target.localName', target, target.localName);
//     if (target.localName !== 'p') return;
//     // log('speak', target.textContent);
//     speak(target.textContent);
// });


let lastSpeakEl;
let lastSpeakMes;
let lastSpeakChat;
let speakingEl;

let t = 0,
    total = 0;
$(document).on('mousedown', event => {
    if (event.button === 2) {
        // $(event.target).css('opacity', 1);
        total += 1;
        if (total === 1) {
            t = new Date().valueOf();
        }
        if (total === 2) {
            let now = new Date().valueOf();
            if (now - t < 300) {
                const localName = event.target.localName;
                const isText = ['p', 'q'].includes(localName);
                if (!isText)
                    return;
                lastSpeakEl = $(event.target);
                lastSpeakMes = lastSpeakEl.closest('.mes');
                lastSpeakChat = chat[lastSpeakMes.attr('mesid')];
                speak(lastSpeakEl.text());
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

function splitText(text) {
    const regex = /(“[^”]*”|"[^"]*")|([^“”"\n]+)/g;

    const result = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
        if (match[1]) {
            // 匹配到双引号内的文本，包含双引号
            result.push({
                text: match[1],
                hasQuotes: true,
            });
        } else if (match[2]) {
            // 匹配到未在双引号中的文本
            result.push({
                text: match[2],
                hasQuotes: false,
            });
        }
    }
    return result;
}


function speak(text) {
    let lineList = splitText(text.replaceAll('*', ''));
    if (!config.speakVoiceover)
        lineList = lineList.filter((i) => i.hasQuotes);
    for (const line of lineList) {
        window.parent.postMessage({
            action: 'tts.build',
            data: line.text,
        }, '*');
    }
    // for (const str of textList) {
    //     const data = await soundService.tts({
    //         dir: chatList.value[0].name,
    //         text: str,
    //     });
    //     speakList.push(data);
    //     if (!playing.value) {
    //         audioRef.value!.onpause();
    //     }
    // }
}


const speakList = [];
let speaking = false;

const audioRef = document.createElement('audio');
audioRef.autoplay = true;
audioRef.onpause = () => {
    speaking = false;
    if (!speakList.length) return;
    const next = speakList.shift();
    audioRef.src = next.filePath;
};
audioRef.onplay = () => {
    speaking = true;
};
document.body.appendChild(audioRef);


(async () => {
    await loadFileToDocument(
        `${extensionFolderPath}lib/lodash.min.js`,
        'js',
    );
    // await loadFileToDocument(
    //     `${extensionFolderPath}lib/jQuery-contextMenu/jquery.contextMenu.css`,
    //     'css',
    // );
    //
    // await loadFileToDocument(
    //     `${extensionFolderPath}lib/jQuery-contextMenu/jquery.contextMenu.js`,
    //     'js',
    // );
    //
    // await loadFileToDocument(
    //     `${extensionFolderPath}lib/jQuery-contextMenu/jquery.ui.position.js`,
    //     'js',
    // );
    // $.contextMenu({
    //     selector: 'q',
    //     items: {
    //         foo: { name: 'q', callback: function(key, opt){ alert('q!'); } },
    //     },
    // });
    // $.contextMenu({
    //     selector: 'p',
    //     items: {
    //         foo: { name: 'p', callback: function(key, opt){ alert('p!'); } },
    //     },
    // });
    // $.contextMenu({
    //     selector: 'em',
    //     items: {
    //         foo: { name: 'em', callback: function(key, opt){ alert('em!'); } },
    //     },
    // });
})();
log('load');
