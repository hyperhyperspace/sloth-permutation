#!/usr/bin/env bash
set -e

if [[ ! -f $(which emconfigure) ]]; then
    echo emconfigure is not available
    exit 1
fi
if [[ ! -f $(which emcc) ]]; then
    echo emcc is not available
    exit 1
fi

cd `dirname "${BASH_SOURCE[0]}"`

CACHE_DIR=$(pwd)/.cache
GMP_RELEASE=gmp-6.1.2

mkdir -p $CACHE_DIR/lib

if [[ ! -f $CACHE_DIR/lib/libgmp.a ]]; then
    echo libgmp.a is not built yet, compiling it

    pushd $CACHE_DIR
        curl https://gmplib.org/download/gmp/$GMP_RELEASE.tar.bz2 -O
        tar xf $GMP_RELEASE.tar.bz2
        pushd $GMP_RELEASE
            CC_FOR_BUILD=$(which gcc) emconfigure ./configure --build i386-linux-gnu --host none --disable-assembly --disable-shared --prefix=$(pwd)/build
            patch < ../../src/gmp/config.h.patch
            make -j $(getconf _NPROCESSORS_ONLN)
            cp .libs/libgmp.a $CACHE_DIR/lib/
        popd
        rm -rf $GMP_RELEASE.tar.bz2
    popd

fi

echo Compiling to WebAssembly

OPTIMIZE='-Oz --llvm-lto 1 --closure 1 -s NO_EXIT_RUNTIME=1 -s NO_FILESYSTEM=1 -s EXPORTED_RUNTIME_METHODS=[] -s DEFAULT_LIBRARY_FUNCS_TO_INCLUDE=[]'

EMMAKEN_CFLAGS="-I .cache/$GMP_RELEASE -I vendor" emcc src/sloth.c .cache/lib/libgmp.a src/subspace.c -o src/sloth.js -s MODULARIZE=1 -s EXPORTED_FUNCTIONS='["_malloc","_free", "_sloth_permutation_create_prime", "_sloth_permutation_encode", "_sloth_permutation_decode", "_sloth_permutation_destroy_prime"]' -s WASM=1 $OPTIMIZE;

echo Done
