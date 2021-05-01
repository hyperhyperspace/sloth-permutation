import {createHash} from "crypto";

/* tslint:disable:no-var-requires */
const slothWasm = require('./sloth');

type Pointer = number;

interface IWasm {
    then: (callback: () => void) => void;

    HEAPU8: Uint8Array;

    _sloth_permutation_create_prime(input: Pointer, blockSize: number): Pointer;

    _sloth_permutation_encode(data: Pointer, blockSize: number, prime: Pointer, rounds: number, encodedData: Pointer, encodedDataSize: Pointer): number;

    _sloth_permutation_decode(encodedData: Pointer, blockSize: number, prime: Pointer, rounds: number, data: Pointer, dataSize: Pointer): number;

    _sloth_permutation_destroy_prime(prime: Pointer): number;

    _malloc(length: number): Pointer;

    _free(pointer: Pointer, length: number): void;
}

const POINTER_SIZE = 4;

export class SlothPermutation {
    /**
     * @param primeInput Input for generating a prime, must be of `blockSize`
     * @param blockSize
     * @param rounds     Encoding/decoding rounds to be used
     * @param options    Options that will be given to Emscripten's Module
     */
    public static async instantiate(blockSize: number, options: any = {}): Promise<SlothPermutation> {
        if (blockSize % 64 !== 0) {
            throw new Error("Input blockSize is incorrect, blockSize must be a power of 2 times 64: 64, 128, 256, etc..");
        }
        const primeInput64 = createHash('sha512')
            .update('@hyperhyperspace/sloth-permutation')
            .digest();
        let primeInput = primeInput64;
        while (primeInput.length < blockSize) {
            primeInput = Buffer.concat([primeInput, primeInput64]);
        }
        const instance: IWasm = slothWasm(options);
        await new Promise((resolve) => {
            instance.then(() => {
                resolve();
            });
        });
        return new SlothPermutation(instance, primeInput, blockSize);
    }

    private readonly prime: Pointer;
    private destroyed = false;

    private constructor(
        private readonly instance: IWasm,
        primeInput: Uint8Array,
        private readonly blockSize: number,
    ) {
        const inputLength = primeInput.length;
        const inputPointer = instance._malloc(inputLength);
        instance.HEAPU8.set(primeInput, inputPointer);
        this.prime = instance._sloth_permutation_create_prime(inputPointer, blockSize);
        instance._free(inputPointer, inputLength);
    }

    public encode(
        rounds: number,
        data: Uint8Array,
        ): Uint8Array {
        if (this.destroyed) {
            throw new Error('Already destroyed');
        }

        const blockSize = this.blockSize;

        const dataLength = data.length;
        if (dataLength % blockSize !== 0) {
            throw new Error('Data must be a multiple of block size');
        }

        const encodedData = new Uint8Array(dataLength);
        for (let offset = 0; offset < dataLength; offset += blockSize) {
            this.encodeBlock(
                rounds,
                data.subarray(offset, offset + blockSize),
                encodedData.subarray(offset, offset + blockSize),
            );
        }

        return encodedData;
    }

    public decode(
        rounds: number,
        encodedData: Uint8Array,
    ): Uint8Array {
        if (this.destroyed) {
            throw new Error('Already destroyed');
        }

        const blockSize = this.blockSize;

        const dataLength = encodedData.length;
        if (dataLength % blockSize !== 0) {
            throw new Error('Encoded data must be a multiple of block size');
        }

        const decodedData = new Uint8Array(dataLength);
        for (let offset = 0; offset < dataLength; offset += blockSize) {
            this.decodedBlock(
                rounds,
                encodedData.subarray(offset, offset + blockSize),
                decodedData.subarray(offset, offset + blockSize),
            );
        }

        return decodedData;
    }

    public destroy(): void {
        if (this.destroyed) {
            throw new Error('Already destroyed');
        }
        this.destroyed = true;
        this.instance._sloth_permutation_destroy_prime(this.prime);
    }

    private encodeBlock(
        rounds: number,
        block: Uint8Array,
        encodedBlock: Uint8Array,
    ): void {
        const instance = this.instance;
        const blockSize = this.blockSize;

        const dataPointer = instance._malloc(blockSize);
        instance.HEAPU8.set(block, dataPointer);

        const encodedDataPointer = instance._malloc(blockSize);
        const encodedDataSizePointer = instance._malloc(POINTER_SIZE);

        instance._sloth_permutation_encode(dataPointer, blockSize, this.prime, rounds, encodedDataPointer, encodedDataSizePointer);

        const view = new DataView(instance.HEAPU8.buffer);
        encodedBlock.set(
            instance.HEAPU8.subarray(
                encodedDataPointer,
                encodedDataPointer + view.getUint32(encodedDataSizePointer, true),
            ),
        );

        instance._free(dataPointer, blockSize);
        instance._free(encodedDataPointer, blockSize);
        instance._free(encodedDataSizePointer, POINTER_SIZE);
    }

    private decodedBlock(
        rounds: number,
        encodedBlock: Uint8Array,
        block: Uint8Array,
    ): void {
        const instance = this.instance;
        const blockSize = this.blockSize;

        const encodedDataPointer = instance._malloc(blockSize);
        instance.HEAPU8.set(encodedBlock, encodedDataPointer);

        const dataPointer = instance._malloc(blockSize);
        const dataSizePointer = instance._malloc(POINTER_SIZE);

        instance._sloth_permutation_decode(encodedDataPointer, blockSize, this.prime, rounds, dataPointer, dataSizePointer);

        const view = new DataView(instance.HEAPU8.buffer);
        block.set(
            instance.HEAPU8.subarray(
                dataPointer,
                dataPointer + view.getUint32(dataSizePointer, true),
            ),
        );

        instance._free(encodedDataPointer, blockSize);
        instance._free(dataPointer, blockSize);
        instance._free(dataSizePointer, POINTER_SIZE);
    }
}
