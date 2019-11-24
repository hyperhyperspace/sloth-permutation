import {createHash} from "crypto";
import {SlothPermutation} from "./src";

(async () => {
    const benchmarkIterations = 1000;

    const rounds = 5;
    const primeInputBlock = createHash('sha512')
        .update('subspace')
        .digest();
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock]);
    const primeInput = Buffer.concat([primeInputBlock, primeInputBlock]);

    for (const blockSize of [32, 64, 96, 128]) {
        const encoderDecoder = await SlothPermutation.instantiate(primeInput.slice(0, blockSize), blockSize, rounds);

        {
            const localData = data.slice(0, blockSize);

            const start = process.hrtime.bigint();
            for (let i = 0; i < benchmarkIterations; ++i) {
                encoderDecoder.encode(localData);
            }
            console.log(`Encoding time (block size ${blockSize}): ${(process.hrtime.bigint() - start) / 1000000n}ms`);
        }

        {
            const localData = data.slice(0, blockSize);
            const encodedData = encoderDecoder.encode(localData);

            const start = process.hrtime.bigint();
            for (let i = 0; i < benchmarkIterations; ++i) {
                encoderDecoder.decode(encodedData);
            }
            console.log(`Decoding time (block size ${blockSize}): ${(process.hrtime.bigint() - start) / 1000000n}ms`);
        }

        encoderDecoder.destroy();
    }
})();
