# sloth-permutation
Sloth permutation (modular square root) for JavaScript (TypeScript) using WebAssembly, originally from https://github.com/randomchain/pysloth

### How to install
```bash
npm install @subspace/sloth-permutation
```

### How to use
```typescript
import {createHash} from "crypto";
import {SlothPermutation} from "@subspace/sloth-permutation";

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

    const encoderDecoder = await SlothPermutation.instantiate(primeInput, blockSize, rounds);

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
```

### License
MIT, see license.txt
