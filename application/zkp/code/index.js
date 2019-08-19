/**
 * @module
 * @author iAmMichaelConnor, William Entriken
 * @desc Run from within application/zkp
 * 
 * SYNOPSIS
 * npx babel-node code/index.js setup [--code-path=path] [--build-bir=dir] [--quiet] [--delete]
 * 
 *   Perform trusted setup, compile to BUILD-DIR. Looks for "gm17" or "pghr13"
 *   in code's path+filename to infer backend. File includes are not supported
 *   at this time.
 * 
 *   The built files will be called: (see https://github.com/Zokrates/ZoKrates/issues/456)
 *     - source.code The input source code, ready to compile
 *     - out.code The compiled code, human readible
 *     - out The compiled code, ZoKrates binary format
 *     - proving.key The key to generate proofs, binary format
 *     - proving.json The key to generate proofs, JSON format
 *     - verification.key The key to verify proofs, binary format
 *     - verification.json The key to verify proofs, JSON format
 *     - verifier.sol Example of a verifier Solidity contract (not compliant with ERC-1922)
 *     - variables.inf A list of the variables used in the R1CS
 * 
 * npx babel-node code/index.js witness --build-bir=dir --witness-args=args [--quiet] [--delete] 
 * 
 *   Compute witness for given witness arguments. This uses compiled.zcode and
 *   proving.key in the build folder.
 * 
 * Options
 * 
 *   --code-path (defaults to ./code) can be a specific file or a directory
 *   --build-dir (defaults to ./build) must be a directory
 *   --verbose Suppress console streams
 *   --delete Delete containers when finished
 *   --witness-args Arguments for compute-witness
 */

import { argv } from 'yargs';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

import codePreProp from './tools-code-preprop';
import keyExtractor from './tools-key-extractor';

import Config from '../src/config';

import zokrates from '../src/zokrates';

const config = Config.getProps();

let container;

// HANDLE COMMAND LINE ARGUMENTS ///////////////////////////////////////////////

// action must be setup or witness
const action = argv._[0];
if (!action) {
  throw new Error('Must use setup or witness action');
}  

// [--code-path path] (defaults to ./code) can be a specific file or a directory
const codePath = argv["code-path"]
  ? path.resolve(argv["code-path"])
  : path.join(process.cwd(), "code");

// [--build-dir dir] (defaults to ./build) must be a directory
console.log
const mainBuildDirectory = argv["build-dir"]
  ? path.resolve(argv["build-dir"])
  : path.join(process.cwd(), "build");

// [--quiet] Suppress console streams
const suppressLengthyOutput = typeof argv["verbose"] === undefined;

// [--delete] Delete finished containers
const deleteContainersWhenFinished = argv["delete"];

// [--witness-args args] Arguments for compute-witness
const argumentsForComputeWitness = (argv["witness-args"] !== undefined && argv["witness-args"] !== '')
  ? argv["witness-args"].split(' ')
  : null;

// FUNCTIONS ///////////////////////////////////////////////////////////////////

/** create a promise that resolves to the output of a stream when the stream
ends.  It also does some ZoKrates-specific error checking because not all 'errors'
are supported on 'stderr'
*/
const promisifyStream = stream =>
  new Promise((resolve, reject) => {
    const MAX_RETURN = 10000000;
    let chunk = '';
    stream.on('data', dat => {
      // chunk += d.toString("utf8").replace(/[^\x40-\x7F]/g, "").replace(/\0/g, '') //remove non-ascii, non alphanumeric
      chunk += dat.toString('utf8'); // remove any characters that aren't in the proof.
      if (chunk.length > MAX_RETURN) chunk = '...[truncacted]'; // don't send back too much stuff
    });
    stream.on('end', () => {
      if (chunk.includes('panicked')) {
        // errors thrown by the application are not always recognised
        reject(new Error(chunk.slice(chunk.indexOf('panicked'))));
      } else {
        resolve(chunk);
      }
    });
    stream.on('error', err => reject(err));
  });

/**
 * Ensures there are no imports for user code in the source
 * @param {String} codeFilePath
 */
async function checkForImportFiles(codeFilePath) {
  const sourceCode = await fs
    .readFileSync(codeFilePath)
    .toString('UTF8');
  const searchResult = sourceCode.search(/((import ")+(.+\.+code+)+("+))+?/);
  if (searchResult !== -1) {
    throw new Error("User includes are not supported");
  }
}

/**
 * Compiles the file "source.code" build directory
 * @param {String} buildDirectory Output directory path
 * @param {String} backend gm17
 */
async function setup(buildDirectory, backend) {
  if (backend !== "gm17") {
    throw new Exception("Only GM17 backend is supported");
  }
  const buildDirectoryBasename = path.basename(buildDirectory);

  console.group("Preparing for ZoKrates build");
  console.log(`Project:         ${buildDirectoryBasename}`);
  console.log(`Build directory: ${buildDirectory}`);
  console.log(`Backend:         ${backend}`);
  console.groupEnd();

  try {
    container = await zokrates.runContainerMounted(buildDirectory);
    await container;
    console.log(`\nContainer running for ${buildDirectoryBasename}`);
    console.log(`Container id for ${buildDirectoryBasename}`, `: ${container.id}`);
    console.log(
      `To connect to the ${buildDirectoryBasename}`,
      `container manually: 'docker exec -ti ${container.id} bash'`,
    );

    console.group('\nCompile', buildDirectoryBasename, '...');
    let output = await zokrates.compile(container, "source.code", null, true);
    if (!suppressLengthyOutput) console.log(output);
    console.log(buildDirectoryBasename, 'SETUP MESSAGE: COMPILATION COMPLETE');
    console.groupEnd();

    // trusted setup to produce proving key and verifying key
    console.group('\nSetup', buildDirectoryBasename, '...');
    output = await zokrates.setup(container);
    if (!suppressLengthyOutput) console.log(output);
    console.log('SETUP MESSAGE: SETUP COMPLETE');
    console.groupEnd();

    // create a verifier.sol
    console.group('\nExport Verifier', buildDirectoryBasename, '...');
    output = await zokrates.exportVerifier(container);
    if (!suppressLengthyOutput) console.log(output);
    console.log(buildDirectoryBasename, 'SETUP MESSAGE: EXPORT-VERIFIER COMPLETE');
    console.groupEnd();

    // move the newly created files into your 'code' folder within the zokrates container.
    const exec = await container.exec
      .create({
        Cmd: [
          '/bin/bash',
          '-c',
          `cp ${
            config.ZOKRATES_OUTPUTS_DIRPATH_ABS
          }{out,proving.key,verification.key,variables.inf,verifier.sol} ${
            config.ZOKRATES_CONTAINER_CODE_DIRPATH_ABS
          }`,
        ],
        AttachStdout: true,
        AttachStderr: true,
      })
      .catch(err => {
        console.error(err);
      });
    output = await promisifyStream(await exec.start());
    if (!suppressLengthyOutput) console.log(output);
    console.log(
      buildDirectoryBasename,
      `SETUP MESSAGE: FILES COPIED TO THE MOUNTED DIR WITHIN THE CONTAINER. THE FILES WILL NOW ALSO EXIST WITHIN YOUR LOCALHOST'S FOLDER: ${buildDirectory}`,
    );

    console.group('\nKey extraction', buildDirectoryBasename, '...');

    // extract a JSON representation of the vk from the exported Verifier.sol contract.
    const vkJSON = await keyExtractor.keyExtractor(`${buildDirectory}verifier.sol`, suppressLengthyOutput);

    if (vkJSON) {
      fs.writeFileSync(`${buildDirectory + buildDirectoryBasename}-vk.json`, vkJSON, function logErr(err) {
        if (err) {
          console.error(err);
        }
      });
      console.log(`File: ${buildDirectory}${buildDirectoryBasename}-vk.json created successfully`);
    }
    console.groupEnd();

    if (!deleteContainersWhenFinished) {
      console.log(
        `\nTo connect to the ${buildDirectoryBasename} container manually: 'docker exec -ti ${
          container.id
        } bash'`,
      );
    } else {
      await zokrates.killContainer(container);
      console.log(`container ${container.id} killed, because --delete specified`);
    }

    console.log(`${buildDirectoryBasename} SETUP COMPLETE`);
  } catch (err) {
    console.log(err);
    console.log(
      '\n******************************************************************************************************************',
      `\nTrusted setup has failed for ${codeFile}. Please see above for additional information relating to this error.`,
      '\nThe most common cause of errors when using this tool is insufficient allocation of resources to Docker.',
      "\nYou can go to Docker's settings and increase the RAM being allocated to Docker. See the README for more details.",
      '\n******************************************************************************************************************',
    );
    throw new Error(err);
  }
}

/**
 * Handle all preprocessing on file and save to buildDirectory/source.code
 * 
 * @param {String} codeFile A filename string of the form "my-code.code" or "my-code.pcode"
 * @param {String} buildDirectory The path to, but not including, the codeFile, for output.
 */
async function performPreprocessing(codeFilePath, buildDirectory) {
  const codeFileExt = path.extname(codeFilePath);
  if (codeFileExt === '.pcode') {
    console.log(`Processing .pcode to .code and saving to build folder`);
    // For .pcode files, create the .code file, so that we may use it in the container. The newly created codeFile is saved in buildDirectory dir by the codePreProp function.
    await codePreProp.preProp1(codeFilePath, path.join(buildDirectory, "source.code"), buildDirectory);
  } else if (codeFileExt === '.code') {
    console.log(`Copying .code to build folder`);
    // .code file has been specified, preprocessing is not required
    fs.copyFileSync(codeFilePath, path.join(buildDirectory, "source.code"));
  } else {
    return new Error("Invalid file extenstion. Expected .code or .pcode extension.");
  }

  await checkForImportFiles(codeFilePath);
}

/**
 * Throws if directory is not empty, used to prevent clobbering build files
 * 
 * @param {String} dir the directory path to inspect
 */
async function ensureBuildDirectoryIsEmpty(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  if (files.length === 0) return;
  console.log("ERROR: build directory is not empty, you must empty this directory before setup can proceed");
  console.log(dir);
  throw new Error("Build directory is not empty");
}

/**
 * Guess which backend is used based on filename
 * @param {String} codeFile 
 */
function inferBackendFromFilePath(codeFile) {
  const backend = codeFile.indexOf('gm17') !== -1
    ? "gm17"
    : codeFile.indexOf('pghr13') !== -1
      ? "pghr13" // NOTE: this tool supports PGHR13, but the wider Nightfall opensource repo does not
      : null;
  if (backend === null) {
    throw new Error("The code must have gm17 or pghr13 in the full path to indicated the backend to use");
  }
  return backend;
}

/**
 * Main entrypoint from command line
 */
async function run() {
  console.log("====");
  console.log("==== 🌃 NIGHTFALL ZKP");
  if (action === "setup") {
    console.log("==== Proof setup");
    console.log("==== Code path:       " + codePath);
    console.log("==== Build directory: " + mainBuildDirectory);
    console.log("==== This may take an hour or so.");
    console.log("====\n");
    
    let codeToBuildDir = {};
    if (codePath.endsWith(".pcode") || codePath.endsWith(".code")) {
      codeToBuildDir[codePath] = mainBuildDirectory;
    } else {
      const matches = glob.sync("**/*.@(code|pcode)", {cwd: path.resolve(codePath)});
      for (let index = 0; index < matches.length; index++) {
        const match = matches[index]
        codeToBuildDir[path.resolve(codePath, match)] = path.resolve(mainBuildDirectory, path.dirname(match)) + "/";
      }
    }
    for (const codeFile in codeToBuildDir) {
      const buildDir = codeToBuildDir[codeFile];
      await ensureBuildDirectoryIsEmpty(buildDir);
      console.log("==");
      console.log("== Performing setup: " + path.basename(codeFile));
      console.log("== " + codeFile);
      console.log("== " + buildDir);
      console.log("==");
      console.log();
      try {
        fs.mkdirSync(buildDir, {recursive: true});
        const backend = inferBackendFromFilePath(codeFile);
        await performPreprocessing(codeFile, buildDir);
        await setup(buildDir, backend);
      } catch (err) {
        throw err;
      } 
    }
    console.log("==");
    console.log("== 🌃 NIGHTFALL ZKP SETUP COMPLETE 🌃");
    console.log("==");
    } else if (action === "witness") {
    console.log("== Witness calculation");
    console.log("== Build directory: " + mainBuildDirectory);
    console.log("== Arguments: " + argumentsForComputeWitness);
    console.log("==\n");
    throw new Error("witness calculation not yet implemented");
  }
}

// RUN /////////////////////////////////////////////////////////////////////////
run().catch(err => {
  console.log("TRUSTED SETUP FAILED: " + err);
  throw err;
});