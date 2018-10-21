'use strict'
function encrypt(word, key) {
    var ciphertext = CryptoJS.AES.encrypt(word, key);
    return ciphertext.toString();
}
function decrypt(word, key) {
    var decrypt = CryptoJS.AES.decrypt(word, key);
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}