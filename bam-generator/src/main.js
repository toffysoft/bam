const basePath = process.cwd();
const _ = require('lodash');
const { NETWORK } = require(`${basePath}/constants/network.js`);
const fs = require('fs');
const sha1 = require(`${basePath}/node_modules/sha1`);
const { createCanvas, loadImage } = require(`${basePath}/node_modules/canvas`);
const buildDir = `${basePath}/build`;
const layersDir = `${basePath}/layers`;
const {
  format,
  baseUri,
  baseAnimationUri,
  description,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  namePrefix,
  network,
  solanaMetadata,
  gif,
} = require(`${basePath}/src/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = '-';
const HashlipsGiffer = require(`${basePath}/modules/HashlipsGiffer.js`);

let hashlipsGiffer = null;

let one = 0;
let two = 0;
let three = 0;

const buildSetup = () => {
  if (fs.existsSync(buildDir)) {
    fs.rmdirSync(buildDir, { recursive: true });
  }
  fs.mkdirSync(buildDir);
  fs.mkdirSync(`${buildDir}/json`);
  fs.mkdirSync(`${buildDir}/images`);
  fs.mkdirSync(`${buildDir}/animation`);
  fs.mkdirSync(`${buildDir}/special`);
  fs.mkdirSync(`${buildDir}/special/Lighting`);
  fs.mkdirSync(`${buildDir}/special/Water`);
  fs.mkdirSync(`${buildDir}/special/Earth`);
  fs.mkdirSync(`${buildDir}/special/Fire`);
  fs.mkdirSync(`${buildDir}/special/Sakura`);
  fs.mkdirSync(`${buildDir}/special/Smoke`);
  fs.mkdirSync(`${buildDir}/special/Fox Fire`);
  fs.mkdirSync(`${buildDir}/special/Butterfly`);
  fs.mkdirSync(`${buildDir}/special/Fireflies`);
  if (gif.export) {
    fs.mkdirSync(`${buildDir}/gifs`);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop(),
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(':').shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes('-')) {
        throw new Error(`layer name can not contain dashes, please fix: ${i}`);
      }
      return {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => {
    return {
      id: index,
      elements: getElements(`${layersDir}/${layerObj.name}/`),
      name:
        layerObj.options?.['displayName'] != undefined
          ? layerObj.options?.['displayName']
          : layerObj.name,
      blend:
        layerObj.options?.['blend'] != undefined
          ? layerObj.options?.['blend']
          : 'source-over',
      opacity:
        layerObj.options?.['opacity'] != undefined
          ? layerObj.options?.['opacity']
          : 1,
      bypassDNA:
        layerObj.options?.['bypassDNA'] !== undefined
          ? layerObj.options?.['bypassDNA']
          : false,
      chance: layerObj.chance,
    };
  });
  return layers;
};

const saveImage = (_editionCount) => {
  fs.writeFileSync(
    `${buildDir}/images/${_editionCount}.png`,
    canvas.toBuffer('image/png'),
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, _edition) => {
  const sp = _.find(attributesList, (o) => o.trait_type === 'Special');

  let dateTime = Date.now();
  let tempMetadata = {
    name: `${namePrefix} #${_edition}`,
    description: description,
    image: `${baseUri}/${_edition}.png`,
    // dna: sha1(_dna),
    edition: _edition,
    // date: dateTime,
    ...extraMetadata,
    attributes: attributesList,
    // compiler: "HashLips Art Engine",
  };

  if (sp) {
    tempMetadata.animation_url = `${baseAnimationUri}/${_edition}.mp4`;
  }

  if (_edition === one || _edition === two || _edition === three) {
    tempMetadata.animation_url = `${baseAnimationUri}/${_edition}.mp4`;
  }

  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  attributesList.push({
    trait_type: _element.layer.name,
    value: selectedElement.name,
  });
};

const loadLayerImg = async (_layer) => {
  try {
    return new Promise(async (resolve) => {
      const image = await loadImage(`${_layer.selectedElement.path}`);
      resolve({ layer: _layer, loadedImage: image });
    });
  } catch (error) {
    console.error('Error loading image:', error);
  }
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;

  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size,
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height,
      );

  addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = '', _layers = []) => {
  let mappedDnaToLayers = [];

  _layers.forEach((layer, index) => {
    const dnaSplit = _dna.split(DNA_DELIMITER)[index];
    // console.log({ [layer.name]: dnaSplit, cleanDna: cleanDna(dnaSplit) });
    if (!dnaSplit) return;

    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(dnaSplit),
    );

    if (!selectedElement) return;

    mappedDnaToLayers.push({
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      selectedElement: selectedElement,
    });
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split('&').reduce((r, setting) => {
      const keyPairs = setting.split('=');
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, '');
};

const isDnaUnique = (_DnaList = new Set(), _dna = '') => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const createDna = (_layers) => {
  let fur;
  let randNum = [];
  _layers.forEach((layer) => {
    var totalWeight = 0;
    layer.elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < layer.elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= layer.elements[i].weight;
      if (random < 0) {
        if (layer.chance) {
          let randomChance = Math.floor(Math.random() * 100);

          if (randomChance > layer.chance) {
            // console.log(
            //   `Skip [${layer.name}] chance is ${layer.chance} but rand is ${randomChance}`,
            // );

            return randNum.push(`*:*`);
          }
        }

        if (
          layer.name === 'Fur' &&
          layer.elements[i].filename === 'Spirit.png'
        ) {
          fur = 'Spirit';
        }

        if (fur === 'Spirit') {
          if (layer.name === 'Eyes' || layer.name === 'Mouth') {
            return randNum.push(`*:*`);
          }
        } else {
          if (layer.name === 'Spirit Eyes' || layer.name === 'Spirit Mouth') {
            return randNum.push(`*:*`);
          }
        }

        return randNum.push(
          `${layer.elements[i].id}:${layer.elements[i].filename}${
            layer.bypassDNA ? '?bypassDNA=true' : ''
          }`,
        );
      }
    }
  });
  return randNum.join(DNA_DELIMITER);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${buildDir}/json/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (_editionCount) => {
  let metadata = metadataList.find((meta) => meta.edition == _editionCount);

  const sp = _.find(metadata.attributes, (o) => o.trait_type === 'Special');

  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`,
      )
    : null;

  delete metadata.edition;
  fs.writeFileSync(
    `${buildDir}/json/${_editionCount}`,
    JSON.stringify(metadata, null, 2),
  );

  if (sp) {
    fs.writeFileSync(
      `${buildDir}/special/${sp.value}/${_editionCount}.png`,
      canvas.toBuffer('image/png'),
    );

    fs.writeFileSync(
      `${buildDir}/animation/${_editionCount}.png`,
      canvas.toBuffer('image/png'),
    );
  }
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const startCreating = async () => {
  one = getRandomInt(
    0,
    layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo,
  );
  two = getRandomInt(
    0,
    layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo,
  );
  three = getRandomInt(
    0,
    layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo,
  );

  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  for (
    let i = network == NETWORK.sol ? 0 : 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo;
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log('Editions left to create: ', abstractedIndexes)
    : null;

  while (layerConfigIndex < layerConfigurations.length) {
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder,
    );

    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      if (
        editionCount === one ||
        editionCount === two ||
        editionCount === three
      ) {
        console.log({ one });
        console.log({ two });
        console.log({ three });
        attributesList.push({
          trait_type: '1/1',
          value: editionCount,
        });

        addMetadata('', editionCount);
        saveMetaDataSingleFile(editionCount);

        // File destination.txt will be created or overwritten by default.
        fs.copyFileSync(
          `${layersDir}/1-1/mfers.gif`,
          `${buildDir}/images/${editionCount}.gif`,
        );

        // File destination.txt will be created or overwritten by default.
        fs.copyFileSync(
          `${layersDir}/1-1/mfers.mp4`,
          `${buildDir}/animation/${editionCount}.mp4`,
        );

        editionCount++;
        abstractedIndexes.shift();
      } else {
        let newDna = createDna(layers);
        // console.log(`newDna => ${newDna}`);
        if (isDnaUnique(dnaList, newDna)) {
          let results = constructLayerToDna(newDna, layers);

          let loadedElements = [];
          results.forEach((layer) => {
            loadedElements.push(loadLayerImg(layer));
          });
          await Promise.all(loadedElements).then((renderObjectArray) => {
            debugLogs ? console.log('Clearing canvas') : null;
            ctx.clearRect(0, 0, format.width, format.height);
            if (gif.export) {
              hashlipsGiffer = new HashlipsGiffer(
                canvas,
                ctx,
                `${buildDir}/gifs/${abstractedIndexes[0]}.gif`,
                gif.repeat,
                gif.quality,
                gif.delay,
              );
              hashlipsGiffer.start();
            }
            if (background.generate) {
              drawBackground();
            }
            renderObjectArray.forEach((renderObject, index) => {
              drawElement(
                renderObject,
                index,
                layerConfigurations[layerConfigIndex].layersOrder.length,
              );
              if (gif.export) {
                hashlipsGiffer.add();
              }
            });
            if (gif.export) {
              hashlipsGiffer.stop();
            }
            debugLogs
              ? console.log('Editions left to create: ', abstractedIndexes)
              : null;
            saveImage(abstractedIndexes[0]);
            addMetadata(newDna, abstractedIndexes[0]);
            saveMetaDataSingleFile(abstractedIndexes[0]);
            console.log(
              `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
                newDna,
              )}`,
            );
          });
          dnaList.add(filterDNAOptions(newDna));
          editionCount++;
          abstractedIndexes.shift();
        } else {
          console.log('DNA exists!');
          failedCount++;
          if (failedCount >= uniqueDnaTorrance) {
            console.log(
              `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`,
            );
            process.exit();
          }
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
