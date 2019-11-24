import {createHash} from "crypto";
import * as test from "tape";
import {SlothPermutation} from "../src";

const expectedEncodedData = Buffer.from('a96c35054ed689e59d598aacd8dbd5598c38c282288251cb50fb35adfa6b3807f9427eb51be207748cf24d663b357360bf71c1295cbedd8a8134caa912e73507a96c35054ed689e59d598aacd8dbd5598c38c282288251cb50fb35adfa6b3807f9427eb51be207748cf24d663b357360bf71c1295cbedd8a8134caa912e73507', 'hex');

test('Basic test', async (t) => {
    const blockSize = 64;
    const rounds = 100;
    const primeInput = createHash('sha512')
        .update('subspace')
        .digest();
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock]);

    const encoderDecoder = await SlothPermutation.instantiate(primeInput, blockSize, rounds);

    for (let i = 0; i < 5; ++i) {
        const startEncoding = process.hrtime.bigint();
        const encodedData = encoderDecoder.encode(data);
        t.equal(encodedData.join(','), expectedEncodedData.join(','), `Encoded correctly, iteration ${i + 1}`);
        const encodingTime = process.hrtime.bigint() - startEncoding;

        const startDecoding = process.hrtime.bigint();
        const decodedData = encoderDecoder.decode(encodedData);
        t.equal(decodedData.join(','), data.join(','), `Decoded correctly, iteration ${i + 1}`);
        const decodingTime = process.hrtime.bigint() - startDecoding;

        t.ok(encodingTime / decodingTime > 100n, 'Encoding takes at least 100x amount of time');
    }

    encoderDecoder.destroy();

    t.end();
});
