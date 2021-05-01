# sloth-permutation
Sloth permutation (modular square root) for JavaScript (TypeScript) using WebAssembly, originally from https://github.com/randomchain/pysloth

### Rationale

From Subspace blockchain [whitepaper](https://drive.google.com/file/d/1v847u_XeVf0SBz7Y7LEMXi72QfqirstL/view):
```
Choice of Permutation. While any cryptographically secure
PRP will suffice for the codec, an ideal candidate would be
both ASIC resistant and time-asymmetric, without imposing
any new security assumptions. It turns out that we may

construct such a permutation from the difficulty of comput-
ing modular square roots, using the permutation underlying

SLOTH (slow-time hash function) as a guide [14]. This has
the advantage of a near-optimal encoding time on x86-64
architecture, when using a 64-bit prime, while reducing the
decoding time by at least one order of magnitude, significantly
lowering the aggregate verification work done across the
network for each new block.
```

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
