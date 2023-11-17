require('ts-node').register({lazy: true, esm: false, moduleTypes: {
  'src/**/*.ts': 'cjs'
}});
const {existsSync, mkdirSync} = require('fs');
const path = require('path');
const {readdir, readFile, writeFile} = require('fs/promises');
const fm = require('front-matter');
const { createCanvas, loadImage } = require('canvas');

const { CanvasRenderer } = require('../src/game/renderer/canvas-renderer.ts');
const { Level } = require('../src/game/utils/level.ts');

async function generateLevelPreviews() {
  const outputDir = 'dist/images/level-preview/';
  const levelDir = 'src/level/';
  const sprites = await loadImage('src/gfx/sprites.png');

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  const files = await readdir(levelDir);
  for (const file of files) {

    if (!file.endsWith('.txt')) {
      continue;
    }
    const filePath = path.join(levelDir, file);
    const { body } = fm(await readFile(filePath, 'utf-8'));
    const level = Level.parse(body);
    const width = level.dimensions.width * 16;
    const height = level.dimensions.height * 16;
    const canvas = createCanvas(width, level.dimensions.height * 16);

    const renderer = new CanvasRenderer(canvas, sprites, level);

    await renderer.setup();
    renderer.tileSize = 16;
    renderer.spriteSize = 16;
    renderer.dimensions = { width, height };
    renderer.pixelRatio = 1;
    renderer.frame({x:0, y:0}, {x:0, y: 0}, {width: level.dimensions.width, height: level.dimensions.height});
    const buffer = canvas.toBuffer();
    await writeFile(`${outputDir}/${file.replace(/\.txt$/, '.png')}`, buffer, 'utf-8');
  }
}


module.exports = (eleventyConfig) => {
  // build events
  eleventyConfig.on('afterBuild', async () => {
    await generateLevelPreviews();
  });
};
