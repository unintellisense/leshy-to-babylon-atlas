#!/usr/bin/env node
import * as fs from 'fs';
interface Size {
  w: number,
  h: number
}

interface FrameMap {
  [frame_name: string]: { frame: AtlasPos }
}

interface AtlasPos {
  x: number,
  y: number,
  w: number,
  h: number
}

interface LeshyJsonTPArray {
  frames: [
    {
      filename: string,
      frame: AtlasPos,
      rotated: boolean,
      trimmed: boolean,
      spriteSourceSize: AtlasPos,
      sourceSize: Size
    }
  ],
  meta: {
    app: string,
    version: string,
    image: string,
    size: Size,
    scale: number
  }

}

interface BabylonAtlas {
  meta: {
    size: {
      w: number,
      h: number
    }
  }
  frames: FrameMap
}

/**
 * expected usage: 'ltba leshy-exported.json new-file.json'
 * where "leshy-exported.json" is the sprite sheet map you got from https://www.leshylabs.com/apps/sstool/
 * when exporting with the 'JSON-TP-ARRAY' option
 */
let args = process.argv.slice(2);
if (args.length != 2) exitWithError(`expected usage: 'ltba leshy-exported.json new-file.json' `);

let targetFileName = args[0], newFileName = args[1];
if (targetFileName.toLowerCase() === newFileName.toLowerCase()) exitWithError('overwriting source file is not allowed');

fs.exists(targetFileName, exists => {
  if (!exists) return exitWithError(`couldn't find file ${targetFileName}`);
  fs.readFile(targetFileName, (err, data) => {
    if (err) return exitWithError(err.message);
    try {

      let jsonBody = JSON.parse(data.toString()) as LeshyJsonTPArray;

      console.log(`frame count ${jsonBody.frames.length}`)

      let frameAtlas: FrameMap = {};
      jsonBody.frames.forEach(frame => {
        frameAtlas[frame.filename] = {
          frame: {
            h: frame.spriteSourceSize.h,
            w: frame.spriteSourceSize.w,
            x: frame.spriteSourceSize.x,
            y: frame.spriteSourceSize.y
          }
        }
      })

      let babAtlas: BabylonAtlas = {
        meta: {
          size: {
            h: jsonBody.meta.size.h,
            w: jsonBody.meta.size.w
          }
        },
        frames: frameAtlas
      }
      fs.writeFile(newFileName, JSON.stringify(babAtlas), err => {
        if (err) return exitWithError(`couldn't write file: ${err.message}`);
        console.log(`contents written to ${newFileName}`)
      })
    } catch (e) {
      return exitWithError(e);
    }
  })
})

function exitWithError(errorMsg: string) {
  console.log(errorMsg);
  process.exit(1);
}