import("./aes_enc_block.js")
function aes_ctr_encrypt(plaintext, key, nonce) {
    function incCounter(counter) {
        for (let i = counter.length - 1; i >= 0; i--) {
            if (counter[i] === 255) {
                counter[i] = 0;
            } else {
                counter[i]++;
                break;
            }
        }
    }

    function blockXOR(block1, block2) {
        const result = new Array(block1.length);
        for (let i = 0; i < block1.length; i++) {
            result[i] = block1[i] ^ block2[i];
        }
        return result;
    }

    const blockSize = 16;
    const numBlocks = Math.ceil(plaintext.length / blockSize);
    let counter = nonce.slice();
    let ciphertext = '';

    for (let i = 0; i < numBlocks; i++) {
        const blockStart = i * blockSize;
        const blockEnd = Math.min((i + 1) * blockSize, plaintext.length);
        const block = plaintext.slice(blockStart, blockEnd);
        const keyStream = aes_encrypt_block(counter, key);
        const encryptedBlock = blockXOR(keyStream, block.split('').map(char => char.charCodeAt(0)));

        ciphertext += String.fromCharCode.apply(null, encryptedBlock);
        incCounter(counter);
    }

    return ciphertext;
}
