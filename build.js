var fs = require('fs');
var spawn = require("child_process").spawn;
var config = require('./src/js/userscript.js');
var output = "./dist/dugtool.js";
var fos = fs.createWriteStream(output);
var i, k;
fos.write("// ==UserScript==\n");
for (k in config) {
    var values = config[k];
    for (i = 0; i < values.length; i++) {
        fos.write("// @" + k + "\t" + values[i] + "\n");
    }
}
fos.write("// ==/UserScript==\n\n");
var dugtool = fs.readFileSync('./src/js/DugTool.js', 'utf8');
fos.write(dugtool);