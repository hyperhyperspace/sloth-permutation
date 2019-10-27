import {Sloth} from "./src";

(async () => {
    const sloth = await Sloth.instantiate();
    const inputString = '123';
    const bits = 1024;
    const iterations = 100;

    {
        const [witness, hash] = sloth.compute(inputString, bits, iterations);
        console.log('Witness:', Buffer.from(witness).toString('hex'));
        console.log('Final hash:', Buffer.from(hash).toString('hex'));
        console.log('Is verified correctly:', sloth.verify(witness, hash, inputString, bits, iterations));
        console.log('Is verified correctly with other data:', sloth.verify(witness, hash, '1234', bits, iterations));
    }
    {
        const [witness, hash] = sloth.compute(inputString, bits, iterations);
        console.log('Witness:', Buffer.from(witness).toString('hex'));
        console.log('Final hash:', Buffer.from(hash).toString('hex'));
        console.log('Is verified correctly:', sloth.verify(witness, hash, inputString, bits, iterations));
        console.log('Is verified correctly with other data:', sloth.verify(witness, hash, '1234', bits, iterations));
    }
})();
