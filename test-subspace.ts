import {createHash} from "crypto";
import {Subspace} from "./src/Subspace";

(async () => {
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

    console.log('Data:', data.toString('hex'));

    for (let i = 0; i < 5; ++i) {
        const encodedData = encoderDecoder.encode(data);
        console.log('Encoded data:', Buffer.from(encodedData).toString('hex'));

        const decodedData = encoderDecoder.decode(encodedData);
        console.log('Decoded data:', Buffer.from(decodedData).toString('hex'));
        console.log('Decoded correctly: ', data.join(',') === decodedData.join(','));
    }

    encoderDecoder.destroy();
})();
