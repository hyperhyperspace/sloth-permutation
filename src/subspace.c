#include <stdlib.h>
#include <stdint.h>
#include <gmp.h>

// These are in `sloth.c` file
void next_prime(mpz_t p, const mpz_t n);
void sqrt_permutation(mpz_t result, const mpz_t input, const mpz_t p, const mpz_t e);
void invert_sqrt(mpz_t result, const mpz_t input, const mpz_t p);
void xor_mod(mpz_t result, const mpz_t input1, const mpz_t flip, const mpz_t mod);

// Takes `input` of a `block_size` and returns a pointer to a prime
mpz_t *sloth_permutation_create_prime(
    const uint8_t *input,
    const int block_size
) {
    mpz_t *prime = malloc(sizeof(mpz_t));
    mpz_init(*prime);

    int bits = block_size * 8;
    mpz_t tmp;
    mpz_init(tmp);

    mpz_import(*prime, block_size, 1, 1, 0, 0, input);

    if (!mpz_tstbit(*prime, bits - 1)) {
        mpz_combit(*prime, bits - 1);
    }

    do next_prime(*prime, *prime);
    while (mpz_mod_ui(tmp, *prime, 4) != 3);

    mpz_clear(tmp);

    return prime;
}

void sloth_permutation_encode(
    const uint8_t *data,
    const int block_size,
    const mpz_t *prime,
    const int rounds,
    uint8_t *encoded_data,
    size_t *encoded_data_size
) {
    mpz_t data_mpz, ones, exponent;

    mpz_init(data_mpz);
    mpz_import(data_mpz, block_size, 1, 1, 0, 0, data);

    mpz_init_set_ui(ones, 1);
    mpz_mul_2exp(ones, ones, mpz_sizeinbase(*prime, 2) >> 1); // flip half the bits (least significant)
    mpz_sub_ui(ones, ones, 1);

    // compute the exponent for sqrt extraction

    mpz_init_set(exponent, *prime);
    mpz_add_ui(exponent, exponent, 1);
    mpz_tdiv_q_ui(exponent, exponent, 4);

    for (int round = 1; round <= rounds; ++round) {
        xor_mod(data_mpz, data_mpz, ones, *prime);
        sqrt_permutation(data_mpz, data_mpz, *prime, exponent);
    }

    mpz_export(encoded_data, encoded_data_size, 1, 1, 0, 0, data_mpz);

    mpz_clear(data_mpz);
    mpz_clear(ones);
    mpz_clear(exponent);
}

void sloth_permutation_decode(
    const uint8_t *encoded_data,
    const int block_size,
    const mpz_t *prime,
    const int rounds,
    uint8_t *data,
    size_t *data_size
) {
    mpz_t data_mpz, ones;

    mpz_init(data_mpz);
    mpz_import(data_mpz, block_size, 1, 1, 0, 0, encoded_data);

    mpz_init_set_ui(ones, 1);
    mpz_mul_2exp(ones, ones, mpz_sizeinbase(*prime, 2) >> 1); // flip half the bits (least significant)
    mpz_sub_ui(ones, ones, 1);

    for (int round = 1; round <= rounds; ++round) {
        invert_sqrt(data_mpz, data_mpz, *prime);
        xor_mod(data_mpz, data_mpz, ones, *prime);
    }

    mpz_export(data, data_size, 1, 1, 0, 0, data_mpz);

    mpz_clear(data_mpz);
    mpz_clear(ones);
}

// Takes a pointer to a prime, clears it and frees allocated memory
void sloth_permutation_destroy_prime(mpz_t *prime) {
    mpz_clear(*prime);
    free(*prime);
}
