# trusted setup tools

Command line tool for performing a zk-SNARK trusted setup - i.e. creation of a verification key and
a proving key from a .pcode file using ZoKrates.

## Warnings

### Non-deterministic randomness

This tool is intended for quickly generating a (proving key, verification key) pair. The 'trusted
setup' of this pair includes a source of randomness, which would change each time you repeat a
trusted setup for a particular set of logic gates. Therefore, if you wish to generate 'proofs'
(zk-SNARKs) to be verified against a verification key which has already been stored on the Ethereum
mainnet **then you should not use this tool!** Why? Because for each verification key stored
on-chain, there is a corresponding and unique proving key which was generated at the same time, from
the same randomness. It is this proving key which you must use to generate proofs; otherwise your
proofs will not verify against the verification key which has already been stored on-chain. If you
wish to generate a proof against an existing, already-deployed verification key, you will need to
request the corresponding proving key from the creator of the verification key. Note: proving keys
can be gigabytes in size.

### ZoKrates

Note: `npm run setup` pulls an image of zokrates from dockerhub (see src/config.js for the current
zokrates image being used). Since ZoKrates is still a fast-changing project (with many breaking
changes being pushed to its repo), it is likely that this opensource Nightfall repo will lag behind
the latest zokrates images and DSL syntax. This tool will need to updated alongside any new versions
of zokrates.

## Requirements

### Docker

Install docker.

You will need to allocate _significant_ computer resources to Docker Engine.

**Minimum specification** (known to work for testers): 2 CPUs, 8GiB Memory, 4 GiB Swap _Note: The
tool has been known to fail if less Swap is allocated. Using swap allows the container to write
excess memory requirements to disk when the container has exhausted all the RAM that is available to
it._

**Recommended**: 8 CPUs, 16 GiB Memory, 4 GiB Swap.

If insufficient resources are allocated to Docker, then ZoKrates might silently 'fall over' within
its container - **this is the most common problem encountered by those who are new to the project**.

### .pcode syntax

ZoKrates uses a Domain Specific Language (DSL) which enables constraints to be written in a
human-readable language. These DSL files have a '.code' file extension. '.code' syntax can become
quite large and unwieldy quite quickly (thousands of lines, if working with binary).

'.pcode' syntax is a further abbreviation of '.code' syntax (the 'p' stands for preprocessor) to
make things easier to read and write.

tools-trusted-setup.js is written to interpret only .pcode syntax.

## Quick start

Always run from within nightfall/zkp/:

```sh
npm install
cd path/to/nightfall/zkp/
```

Then run the tool:

`npm run setup -- -i gm17/parent-dir-of-pcode/`

## Arguments: `-i` `-a` `-s`

### `-i`

Alternatively you can process _all_ of the folders under `/gm17` in one go by using:

`npm run setup-all`

Note that this will take about 1hr to complete.

Recommended initial filing structure:

```sh
zkp
  |
  code
    |
    gm17
      |
      ft-mint
        |
        ft-mint.pcode

      ft-transfer
        |
        ft-transfer.pcode

    pghr13 // note: pghr13 is not supported in the Nightfall repo - but tools-trusted-setup.js only supports it to mirror zokrates.
      |
      ft-mint
        |
        ft-mint.pcode

      ft-transfer
        |
        ft-transfer.pcode

    safe-dump   // required folder, in case of accidental overwriting from mounting of containers from the host.
      |
```

Example to compile and generate a new (proving key, verification key) pair for a 'fungible token
mint' in this context: `npm run setup -- -i gm17/ft-mint/`

New files following the use of `npm run setup -- -i gm17/ft-mint/`:

```sh
zkp
  |
  code
    |
    gm17
      |
      ft-mint
        |
        ft-mint-vk.json   // verification key in json format
        ft-mint.code   // transpiled '.code' file from the '.pcode' file
        ft-mint.pcode
        out   // machine-readable file
        out.code   // flattening of the '.code' into a R1CS (rank-1 constraint system)
        proving.key   // proving key, used for generating proofs
        variables.inf   // a list of the variables used in the R1CS
        verification.key   // verification key
        verifier.sol   // example of a Verifier solidity contract (not compliant with EIP1922)

      ft-transfer
        |
        ft-transfer.pcode

    pghr13 // note: pghr13 is not supported in the Nightfall repo - but tools-trusted-setup.js only supports it to mirror zokrates.
      |
      ft-mint
        |
        ft-mint.pcode

      ft-transfer
        |
        ft-transfer.pcode

    safe-dump
      |
```

If `-i` is not specified, the code will loop through every single folder within `gm17` and perform a
trusted setup but will ask you before doing each one (unlike `npm run setup-all`, which won't ask).
This is done sequentially, because each setup requires a significant amount of computing resources.

### `-a`

`-a "<argument list>"` OPTIONAL

Provide arguments and this tool will compute-witness using those arguments.

e.g.  
`node src/tools-tar-creator.js -i gm17/parent-dir-of-pcode/ -a "1 0 0 1 1 1 1 0 0"` <--- **notice
the "quotes"!!** The above `-a` will run, within the zokrates container, the following:
`./zokrates compute-witness -a 1 0 0 1 1 1 1 0 0`

**Important Note:** _Multiple arguments must be specified "within quotes" with spaces in between._

#### console output of `-a` - useful for testing .code file variables

If -a is specified, 'compute-witness' is run.

E.g. the example output below is the 256bit output of the sha256() hash, as computed within a .code
file.

```sh
Output from compute-witness:

 bin:  1100110011100001100001110100010001011010111101111001001010011011000100000110010101001010110011101111101001001110010100101111001110011011101111001000101000100001000100111011000010001110000010011010111010001011010111010010110000100000000110110001111111001111
 dec:  92670295279174621537561163145043938646856290957242631959181838212798520958927
 hex:  0xcce187445af7929b10654acefa4e52f39bbc8a2113b08e09ae8b5d2c201b1fcf
```

This tool tries to interpret the output as either binary or decimal, and then does a conversion
based on this interpretation, to output equivalent bin, dec, and hex values.

### `-s`

`-s` OPTIONAL `-s` is for **suppression** of lengthy console outputs from the zokrates container. If
`-s` is included, then lengthy console outputs will be suppressed. If `-s` is not included, all of
the zokrates console outputs will be streamed to your console.

## Mounting

`npm run setup` will bind-mount from your local machine to a containerized image of zokrates.

## Outputs

`npm run setup` will:

- Precompile your .pcode into a .code file
- Run the following zokrates commands within a mounted container:
  - compile
  - setup
  - compute-witness (if the optional -a argument is given)
  - export-verifier
- Save any newly created files in path/to/nightfall/zkp/code/gm17/parent-dir-of-pcode/
