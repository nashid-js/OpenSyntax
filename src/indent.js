const vscode = require('vscode');


function indent(editor, edit, args) {
    // Check if the pressed key is 'Enter' and the file is JavaScript
    if (args.text === '\n' && editor.document.languageId === 'javascript' && editor.document.lineAt(0).text.includes("open")) {

        const position = editor.selection.active;
        const lineNumber = position.line;
        const currentLine = editor.document.lineAt(lineNumber);
        const currentLineText = currentLine.text;
        
        if (currentLineText.trim().endsWith(':') || 
        currentLineText.trim().endsWith('>')) {
            
            const tabSize = editor.options.tabSize;     // the number of spaces or tabs of user settings

            // Calculate the new indentation
            const currentIndentation = currentLineText.slice(0,currentLine.firstNonWhitespaceCharacterIndex)
            let newIndentation = ''
            
            if(editor.options.insertSpaces){    //if using spaces to indent
                newIndentation = currentIndentation + ' '.repeat(tabSize)
            } else {
                newIndentation = currentIndentation + '\t'
            }





            
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