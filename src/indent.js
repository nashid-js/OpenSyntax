const vscode = require('vscode');


function indent(textEditor, edit, args) {
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
}

module.exports={
    autoIndent: indent
}

