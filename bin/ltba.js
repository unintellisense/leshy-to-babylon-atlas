#!/usr/bin/env node
"use strict";
var fs = require('fs');
/**
 * expected usage: 'ltba leshy-exported.json new-file.json'
 * where "leshy-exported.json" is the sprite sheet map you got from https://www.leshylabs.com/apps/sstool/
 * when exporting with the 'JSON-TP-ARRAY' option
 */
var args = process.argv.slice(2);
if (args.length != 2)
    exitWithError("expected usage: 'ltba leshy-exported.json new-file.json' ");
var targetFileName = args[0], newFileName = args[1];
if (targetFileName.toLowerCase() === newFileName.toLowerCase())
    exitWithError('overwriting source file is not allowed');
fs.exists(targetFileName, function (exists) {
    if (!exists)
        return exitWithError("couldn't find file " + targetFileName);
    fs.readFile(targetFileName, function (err, data) {
        if (err)
            return exitWithError(err.message);
        try {
            var jsonBody = JSON.parse(data.toString());
            console.log("frame count " + jsonBody.frames.length);
            var frameAtlas_1 = {};
            jsonBody.frames.forEach(function (frame) {
                frameAtlas_1[frame.filename] = {
                    frame: {
                        h: frame.spriteSourceSize.h,
                        w: frame.spriteSourceSize.w,
                        x: frame.spriteSourceSize.x,
                        y: frame.spriteSourceSize.y
                    }
                };
            });
            var babAtlas = {
                meta: {
                    size: {
                        h: jsonBody.meta.size.h,
                        w: jsonBody.meta.size.w
                    }
                },
                frames: frameAtlas_1
            };
            fs.writeFile(newFileName, JSON.stringify(babAtlas), function (err) {
                if (err)
                    return exitWithError("couldn't write file: " + err.message);
                console.log("contents written to " + newFileName);
            });
        }
        catch (e) {
            return exitWithError(e);
        }
    });
});
function exitWithError(errorMsg) {
    console.log(errorMsg);
    process.exit(1);
}
