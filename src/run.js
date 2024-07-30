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

function Run() {

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
};

module.exports = {Run};

