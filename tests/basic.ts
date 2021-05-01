import {createHash} from "crypto";
import * as test from "tape";
import {SlothPermutation} from "../src";

test('Basic test: 64 bytes per block', async (t) => {
    const blockSize = 64;
    const rounds = 1000;
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock, dataBlock, dataBlock]);

    const encoderDecoder = await SlothPermutation.instantiate(blockSize);

    for (let i = 0; i < 5; ++i) {
        const startEncoding = process.hrtime.bigint();
        const encodedData = encoderDecoder.encode(rounds, data);
        const encodingTime = process.hrtime.bigint() - startEncoding;
        console.log('encoding time = ', Number(encodingTime)/1000000000)

        const startDecoding = process.hrtime.bigint();
        const decodedData = encoderDecoder.decode(rounds, encodedData);
        t.equal(decodedData.join(','), data.join(','), `Decoded correctly, iteration ${i + 1}`);
        const decodingTime = process.hrtime.bigint() - startDecoding;
        t.equal(encoderDecoder.verifyProofVDF(rounds, data, encodedData), true, `Decoded correctly, iteration ${i + 1}`);
        console.log('decoding time = ', Number(decodingTime)/1000000000)

        t.ok(encodingTime / decodingTime > 400n, 'Encoding takes at least 400x amount of time');
    }

    encoderDecoder.destroy();

    t.end();
});

test('Basic test: 128 bytes per block', async (t) => {
    const blockSize = 128;
    const rounds = 500;
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock]);

    const encoderDecoder = await SlothPermutation.instantiate(blockSize);

    for (let i = 0; i < 5; ++i) {
        const startEncoding = process.hrtime.bigint();
        const encodedData = encoderDecoder.encode(rounds, data);
        const encodingTime = process.hrtime.bigint() - startEncoding;
        console.log('encoding time = ', Number(encodingTime)/1000000000)

        const startDecoding = process.hrtime.bigint();
        const decodedData = encoderDecoder.decode(rounds, encodedData);
        t.equal(decodedData.join(','), data.join(','), `Decoded correctly, iteration ${i + 1}`);
        const decodingTime = process.hrtime.bigint() - startDecoding;
        t.equal(encoderDecoder.verifyProofVDF(rounds, data, encodedData), true, `Decoded correctly, iteration ${i + 1}`);
        console.log('decoding time = ', Number(decodingTime)/1000000000)

        t.ok(encodingTime / decodingTime > 400n, 'Encoding takes at least 400x amount of time');
    }

    encoderDecoder.destroy();

    t.end();
});

test('Basic test: 256 bytes per block', async (t) => {
    const blockSize = 256;
    const rounds = 100;
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock, dataBlock, dataBlock]);

    const encoderDecoder = await SlothPermutation.instantiate(blockSize);

    for (let i = 0; i < 5; ++i) {
        const startEncoding = process.hrtime.bigint();
        const encodedData = encoderDecoder.encode(rounds, data);
        const encodingTime = process.hrtime.bigint() - startEncoding;
        console.log('encoding time = ', Number(encodingTime)/1000000000)

        const startDecoding = process.hrtime.bigint();
        const decodedData = encoderDecoder.decode(rounds, encodedData);
        t.equal(decodedData.join(','), data.join(','), `Decoded correctly, iteration ${i + 1}`);
        const decodingTime = process.hrtime.bigint() - startDecoding;
        t.equal(encoderDecoder.verifyProofVDF(rounds, data, encodedData), true, `Decoded correctly, iteration ${i + 1}`);
        console.log('decoding time = ', Number(decodingTime)/1000000000)

        t.ok(encodingTime / decodingTime > 500n, 'Encoding takes at least 500x amount of time');
    }

    encoderDecoder.destroy();

    t.end();
});
