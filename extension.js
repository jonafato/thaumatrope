var username = window.location.pathname.split('/')[1];
var publicKey;
var privateKey;
var encryptedPrivateKey;

var importPrivateKey = function importPrivateKey() {
    kbpgp.KeyManager.import_from_armored_pgp({armored: encryptedPrivateKey}, function(err, result) {
        if (err) {
            console.log(err);
        }
        else {
            if (result.is_pgp_locked()) {
                var passphrase = prompt('Enter your pgp key passphrase:');
                if (passphrase !== '' && passphrase !== null) {
                    result.unlock_pgp({passphrase: passphrase}, function(unlockError) {
                        if (unlockError) {
                            console.log(unlockError);
                        }
                        else {
                            console.log('imported');
                            privateKey = result;
                        }
                    });
                }
                else {
                    alert('No passphrase provided');
                }
            }
            else {
                privateKey = result;
            }
        }
    });
};

var lookupUser = function lookupUser() {
    superagent
        .get('https://keybase.io/_/api/1.0/user/lookup.json')
        .query({twitter: username})
        .end(function(response) {
            // TODO: handle responses with more than one item in `them`
            kbpgp.KeyManager.import_from_armored_pgp({
                armored: response.body.them[0].public_keys.primary.bundle,
            }, function(err, result) {
                if (err) {
                    console.log(err);
                }
                else {
                    publicKey = result;
                    var tweetButton = document.querySelector('#dm_dialog_conversation button.tweet-btn');
                    var encryptButton = document.createElement('button');
                    encryptButton.classList.add('btn');
                    encryptButton.textContent = 'Encrypt';
                    encryptButton.addEventListener('click', encryptMessage);
                    tweetButton.parentNode.insertBefore(encryptButton, tweetButton);
                }
            });
        });
    
};

var encryptMessage = function encryptMessage() {
    var messageBox = document.querySelector('#tweet-box-dm-conversation');
    var cleartext = messageBox.textContent;
    kbpgp.box({msg: cleartext, encrypt_for: publicKey}, function(err, result, resultBuffer) {
        if (err) {
            console.log(err);
        }
        else {
            superagent
                .post('https://api.github.com/gists')
                .send(JSON.stringify({files: {message: {content: result}}}))
                .end(function(response) {
                    var rawUrl = response.body.files.message.raw_url;
                    var thaumatropeUrl = rawUrl.replace(/^https/, 'thaumatrope');
                    messageBox.textContent = thaumatropeUrl;
                });
        }
    });
};

var decryptMessage = function decryptMessage(url, element) {
    if (privateKey === undefined) {
        importPrivateKey();
    }
    superagent
        .get(url)
        .end(function(response) {
            var ring = new kbpgp.keyring.PgpKeyRing();
            ring.add_key_manager(privateKey);
            kbpgp.unbox(
                {keyfetch: ring, armored: response.text},
                function(err, literals) {
                    if (err !== null) {
                        console.log('error: ' + err);
                        element.textContent = 'Unable to decrypt message';
                    }
                    else {
                        var cleartext = literals[0].toString();
                        element.textContent = cleartext;
                    }
                }
            );
        });
};

var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            Array.prototype.slice.call(mutation.addedNodes)
                .filter(function(node) { return node.querySelector !== undefined; })
                .map(function(node) {
                    var childTweets = node.querySelectorAll('.tweet-text');
                    if (childTweets !== null) {
                        Array.prototype.map.call(childTweets, function(message) {
                            if (message.textContent.trim().indexOf('thaumatrope://', 0) === 0) {
                                // TODO: there must be a better way...
                                var container = message.parentNode.parentNode.parentNode;
                                var timestamp = container.lastChild.previousSibling;
                                var button = document.createElement('button');
                                button.textContent = 'Decrypt';
                                button.addEventListener('click', function() {
                                    decryptMessage(message.textContent.trim().replace('thaumatrope', 'https'), message);
                                    container.removeChild(button);
                                });
                                container.insertBefore(button, timestamp);
                            }
                        });
                    }
                });
        }
    });
});


var messages = document.querySelector('#dm_dialog_conversation .twttr-dialog-content');
observer.observe(messages, {childList: true});


chrome.storage.local.get('privateKey', function(items) {
    encryptedPrivateKey = items.privateKey;
});
lookupUser();
//    decryptMessage('https://gist.githubusercontent.com/anonymous/2593276de140bd78e10b/raw/070c76c8f512f6437f6997da97261cd84032b433/message');

