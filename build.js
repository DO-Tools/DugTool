var fs = require('fs');
var spawn = require("child_process").spawn;
var userscript = require('./src/js/Userscript.js');
var output = "./dist/DugTool.user.js";
var fos = fs.createWriteStream(output);
var i, k;
fos.write("// ==UserScript==\n");
for (k in userscript) {
    var values = userscript[k];
    for (i = 0; i < values.length; i++) {
        fos.write("// @" + k + "\t" + values[i] + "\n");
    }
}
fos.write("// ==/UserScript==\n\n");
var dugToolHelper = fs.readFileSync('./src/js/Helper.js', 'utf8');
/*
 * Remove exports from dist file
 */
dugToolHelper = dugToolHelper.split("\n");
i = 0;
while (i < dugToolHelper.length) {
    if (dugToolHelper[i].match(/\/\/\s*Exports/)) {
        break;
    }
    fos.write(dugToolHelper[i] + "\n");
    ++i;
}
var dugToolMain = fs.readFileSync('./src/js/DugTool.js', 'utf8');
fos.write(dugToolMain + "\n");