require('dotenv').config();
const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const _ = require('lodash');
const axios = require('axios');
const fs = require('fs-extra');
const recursive = require('recursive-fs');
const Bottleneck = require('bottleneck');
const FormData = require('form-data');
const basePathConverter = require('base-path-converter');
const pinataSDK = require('@pinata/sdk');
const Hash = require('ipfs-only-hash');

const { getArgs, getFileName } = require('../../src/utils');

async function main() {
  /**
   * Load any existing file CID mappings to avoid attempting to upload
   * a file that may have already been uploaded and the CID is known.
   */
  const pinataCIDs = fs.readJsonSync('./output/downloaded-cids.json') ?? {};
  const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

  /**
   * Set rate limiting close to the maximum of 180 requests / minute.
   * These values can be modified to fit your needs while staying
   * within the rate limit range to avoid HTTP 429 errors.
   *
   * Pinata Rate Limit: https://docs.pinata.cloud/rate-limits
   */
  const rateLimiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: 3000, // Once every 3 seconds
  });

  /**
   * Checks whether the provided file name has already been mapped
   * with a CID. If so, it does not need to be uploaded again.
   *
   * @param {string} fileName the file name to check for existing CIDs
   * @return {bool} returns true if the file has already been mapped; otherwise false
   */
  const cidExists = (fileName) => {
    return {
      exists: !!pinataCIDs[fileName],
      ipfsHash: pinataCIDs[fileName],
    };
  };

  /**
   * Upload a file's data to Pinata and provide a metadata name for the file.
   * This fileName can be either the name of the file being uploaded, or any
   * name sufficent enough to identify the contents.
   *
   * @param {string} fileName the file name to use for the uploaded data
   * @param {string} filePath the path to the file to upload and pin to Pinata
   * @return {string} returns the IPFS hash (CID) for the uploaded file
   */
  const uploadFile = async (fileName, filePath) => {
    const { exists, ipfsHash } = cidExists(fileName);
    if (exists) {
      return ipfsHash;
    }

    const { IpfsHash } = await pinata.pinFileToIPFS(
      fs.createReadStream(filePath),
      {
        pinataMetadata: {
          name: fileName,
        },
        pinataOptions: {
          cidVersion: 0,
        },
      },
    );
    return IpfsHash;
  };

  try {
    const { name, path } = getArgs();

    const cid = await uploadFile(name, path);

    console.log({ cid });

    return process.exit(0);
  } catch (error) {
    console.error({ error });
    return process.exit(1);
  }
}
main();
