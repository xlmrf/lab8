function aes_encrypt_block(block, key) {
    const Nb = 4;
    const Nr = 10; 

    function subBytes(state) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < Nb; j++) {
                state[i][j] = sBox[state[i][j]];
            }
        }
        return state;
    }

    function shiftRows(state) {
        const newState = [];
        for (let i = 0; i < 4; i++) {
            newState.push([]);
            for (let j = 0; j < Nb; j++) {
                newState[i][j] = state[i][(j + i) % Nb];
            }
        }
        return newState;
    }

    function mixColumns(state) {
        for (let j = 0; j < Nb; j++) {
            const s0 = state[0][j];
            const s1 = state[1][j];
            const s2 = state[2][j];
            const s3 = state[3][j];

            state[0][j] = multiply(0x02, s0) ^ multiply(0x03, s1) ^ s2 ^ s3;
            state[1][j] = s0 ^ multiply(0x02, s1) ^ multiply(0x03, s2) ^ s3;
            state[2][j] = s0 ^ s1 ^ multiply(0x02, s2) ^ multiply(0x03, s3);
            state[3][j] = multiply(0x03, s0) ^ s1 ^ s2 ^ multiply(0x02, s3);
        }
        return state;
    }

    function addRoundKey(state, roundKey) {
        for (let j = 0; j < Nb; j++) {
            for (let i = 0; i < 4; i++) {
                state[i][j] ^= roundKey[i][j];
            }
        }
        return state;
    }

    // Допоміжна функція для множення у полі Галуа
    function multiply(a, b) {
        let result = 0;
        while (b > 0) {
            if (b & 1) {
                result ^= a;
            }
            a = (a << 1) ^ (a & 0x80 ? 0x1b : 0);
            b >>>= 1;
        }
        return result;
    }

    const roundKeys = keyExpansion(key);

    block = addRoundKey(block, roundKeys.slice(0, Nb));

    for (let round = 1; round < Nr; round++) {
        block = subBytes(block);
        block = shiftRows(block);
        block = mixColumns(block);
        block = addRoundKey(block, roundKeys.slice(round * Nb, (round + 1) * Nb));
    }

    block = subBytes(block);
    block = shiftRows(block);
    block = addRoundKey(block, roundKeys.slice(Nr * Nb, (Nr + 1) * Nb));

    return block;
}

function keyExpansion(key) {
    const Nb = 4;
    const Nk = key.length / 4;
    const Nr = Nk + 6;

    const roundKeys = [];

    for (let i = 0; i < Nk; i++) {
        roundKeys[i] = [
            key[4 * i],
            key[4 * i + 1],
            key[4 * i + 2],
            key[4 * i + 3],
        ];
    }

    for (let i = Nk; i < Nb * (Nr + 1); i++) {
        let temp = roundKeys[i - 1];
        if (i % Nk === 0) {
            temp = subWord(rotWord(temp));
            temp[0] ^= rCon[i / Nk];
        } else if (Nk > 6 && i % Nk === 4) {
            temp = subWord(temp);
        }

        roundKeys[i] = [];
        for (let j = 0; j < 4; j++) {
            roundKeys[i][j] = roundKeys[i - Nk][j] ^ temp[j];
        }
    }

    return roundKeys;
}

function subWord(word) {
    return word.map(byte => sBox[byte]);
}

function rotWord(word) {
    const temp = word.shift();
    word.push(temp);
    return word;
}
