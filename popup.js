var textarea = document.querySelector('#private-key');

chrome.storage.local.get('privateKey', function(results) {
    textarea.value = results.privateKey;
});

document.querySelector('button').addEventListener('click', function(e) {
    chrome.storage.local.set({privateKey: textarea.value});
});
