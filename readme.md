# sloth-permutation
Sloth permutation (modular square root) for JavaScript (TypeScript) using WebAssembly, originally from https://github.com/randomchain/pysloth

### How to install
```bash
npm install @hyperhyperspace/sloth-permutation
```

### How to build

1. Install emcc:
```bash
git clone https://github.com/emscripten-core/emsdk.git 
cd emsdk
./emsdk install 1.39.0
./emsdk activate 1.39.0
source ./emsdk_env.sh
```

2. Install WjCryptLib (https://github.com/WaterJuice/WjCryptLib)

3. Build:
```bash
git clone git@github.com:hyperhyperspace/sloth-permutation.git
cd sloth-permutation
yarn build
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
