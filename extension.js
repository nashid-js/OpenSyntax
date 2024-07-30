const vscode = require('vscode');
const path = require('path');
const open = require('./open.js')

function runTerminal(command) {
    // Get the active terminal or create a new one if it doesn't exist
    let terminal = vscode.window.activeTerminal;
    if (!terminal) {
        terminal = vscode.window.createTerminal('powershell');
    }
    terminal.show();
    terminal.sendText(command);
}
function newFile(fileName, content) {
    return new Promise((resolve, reject) => {
        // Get the current workspace folder
        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            reject(new Error('No workspace folder open'));
            return;
        }

        // Create the full file path
        const filePath = vscode.Uri.file(path.join(workspaceFolder.uri.fsPath, fileName));

        // Create the file with content
        vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'))
            // .then(() => {
            //     // Open the newly created file
            //     vscode.workspace.openTextDocument(filePath)
            //         .then(document => vscode.window.showTextDocument(document))
            //         .then(() => {
            //             vscode.window.showInformationMessage(`Success!`);
            //             resolve();
            //         });
            // })
            // .catch(error => {
            //     vscode.window.showErrorMessage(`Error creating file: ${error.message}`);
            //     reject(error);
            // });
    });
}

/** 
 * @param {vscode.ExtensionContext} context
 */


function activate(context) {


	const disposable = vscode.commands.registerCommand('opensyntax.run', function () {

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from openSyntax!');
        
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {

            vscode.window.showErrorMessage('No active editor found');
			return null;
		}
		let content = activeEditor.document.getText()
        const name = activeEditor.document.fileName
        const newName = '.' + path.parse(name).name + ".ojs"
        

		newFile(newName, open(content))
            .then(() => {
                vscode.window.showInformationMessage(`Success!`);
            })
            .catch(error => {
                vscode.window.showInformationMessage
                (error);
            });

		runTerminal(`node ${newName}`)
	});

    let autoIndent = vscode.commands.registerTextEditorCommand('type', (textEditor, edit, args) => {
        // Check if the pressed key is 'Enter' and the file is JavaScript
        if (args.text === '\n' && textEditor.document.languageId === 'javascript' && textEditor.document.lineAt(0).text.includes("open")) {


            const position = textEditor.selection.active;
            const lineNumber = position.line;
            const currentLine = textEditor.document.lineAt(lineNumber);
            const currentLineText = currentLine.text;

            if (currentLineText.trim().endsWith(':') || 
                currentLineText.trim().endsWith('>')) {
                
                // Calculate the new indentation
                const currentIndentation = currentLine.firstNonWhitespaceCharacterIndex;
                const newIndentation = ' '.repeat(currentIndentation + 4);
                edit.insert(position, '\n' + newIndentation);

                // Prevent the default 'Enter' behavior
                return;
            }
        }

        // If conditions are not met, allow the default behavior
        vscode.commands.executeCommand('default:type', { text: args.text });
    });

	context.subscriptions.push(disposable,autoIndent);
}




function deactivate() {}

module.exports = {
	activate,
	deactivate
}
