
const vscode = require('vscode');
const os = require('./src/run.js')
const indent = require('./src/indent.js')


/** 
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {


	const disposable = vscode.commands.registerCommand('opensyntax.run', os.Run)
	
    const autoIndent = vscode.commands.registerTextEditorCommand('type',indent.autoIndent);
	
	context.subscriptions.push(disposable,autoIndent);
}




function deactivate() {}

module.exports = {
	activate,
	deactivate
}

