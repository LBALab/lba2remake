const port = chrome.runtime.connect();

window.addEventListener('lba_ext_event_out', function(event) {
    port.postMessage(event.detail);
});

port.onMessage.addListener(function(message) {
    window.dispatchEvent(new CustomEvent('lba_ext_event_in', {detail: message}));
});
