/* tslint:disable:no-var-requires */
const slothWasm = require('./sloth');

interface IWasm {
    then: (callback: () => void) => void;

    HEAPU8: Uint8Array;

    _sloth(witness: number, witnessSize: number, outputBuffer: number, inputString: number, bits: number, iterations: number): number;

    _sloth_verification(witness: number, witnessSize: number, finalHash: number, inputString: number, bits: number, iterations: number): number;

    _malloc(length: number): number;

    _free(pointer: number, length: number): void;
}

const POINTER_SIZE = 4;
const HASH_SIZE = 64;

export class Sloth {

    /**
     * @param options Options that will be given to Emscripten's Module
     */
    public static async instantiate(options: any = {}): Promise<Sloth> {
        const instance: IWasm = slothWasm(options);
        await new Promise((resolve) => {
            instance.then(() => {
                resolve();
            });
        });
        return new Sloth(instance);
    }

    private constructor(private readonly instance: IWasm) {
    }

    /**
     * @param data
     * @param bits
     * @param iterations
     *
     * @return [witnessBytes, hash]
     */
    public compute(data: string, bits: number, iterations: number): [Uint8Array, Uint8Array] {
        const instance = this.instance;

        const witnessMaxSize = bits / 8;
        const witness = instance._malloc(witnessMaxSize);
        const witnessSize = instance._malloc(POINTER_SIZE);

        const outputBuffer = instance._malloc(HASH_SIZE);

        const dataBuffer = Buffer.from(data);
        // Null-terminated string for C
        const inputStringSize = dataBuffer.length + 1;
        const inputString = instance._malloc(inputStringSize);
        instance.HEAPU8.set(dataBuffer, inputString);

        instance._sloth(witness, witnessSize, outputBuffer, inputString, bits, iterations);

        const view = new DataView(instance.HEAPU8.buffer);
        const witnessBytes = instance.HEAPU8.slice(
            witness,
            witness + view.getUint32(witnessSize, true),
        );
        const hash = instance.HEAPU8.slice(outputBuffer, outputBuffer + HASH_SIZE);

        instance._free(witness, witnessMaxSize);
        instance._free(witnessSize, POINTER_SIZE);
        instance._free(outputBuffer, HASH_SIZE);
        instance._free(inputString, inputStringSize);

        return [witnessBytes, hash];
    }

    public verify(witnessBytes: Uint8Array, hash: Uint8Array, data: string, bits: number, iterations: number): boolean {
        const instance = this.instance;

        const witnessLength = witnessBytes.length;

        const witness = instance._malloc(witnessLength);
        instance.HEAPU8.set(witnessBytes, witness);

        const finalHash = instance._malloc(HASH_SIZE);
        instance.HEAPU8.set(hash, finalHash);

        const dataBuffer = Buffer.from(data);
        // Null-terminated string for C
        const inputStringSize = dataBuffer.length + 1;
        const inputString = instance._malloc(inputStringSize);
        instance.HEAPU8.set(dataBuffer, inputString);

        const result = instance._sloth_verification(witness, witnessLength, finalHash, inputString, bits, iterations);

        instance._free(witness, witnessLength);
        instance._free(finalHash, HASH_SIZE);
        instance._free(inputString, inputStringSize);

        return result === 1;
    }
}
