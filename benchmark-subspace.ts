import {createHash} from "crypto";
import {Subspace} from "./src/Subspace";

(async () => {
    const benchmarkIterations = 1000;

    const blockSize = 64;
    const rounds = 5;
    const primeInput = createHash('sha512')
        .update('subspace')
        .digest();
    const dataBlock = createHash('sha512')
        .update('subspace-data')
        .digest();

    const data = Buffer.concat([dataBlock, dataBlock]);

    const encoderDecoder = await Subspace.instantiate(primeInput, blockSize, rounds);

    const encodedData = encoderDecoder.encode(data);

    {
        const start = process.hrtime.bigint();
        for (let i = 0; i < benchmarkIterations; ++i) {
            encoderDecoder.encode(data);
        }
        console.log(`Encoding time: ${(process.hrtime.bigint() - start) / 1000000n}ms`);
    }

    {
        const start = process.hrtime.bigint();
        for (let i = 0; i < benchmarkIterations; ++i) {
            encoderDecoder.decode(encodedData);
        }
        console.log(`Decoding time: ${(process.hrtime.bigint() - start) / 1000000n}ms`);
    }

    encoderDecoder.destroy();
})();
