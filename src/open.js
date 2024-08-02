"use strict";
function range(i, ln) {
	if (!Number.isInteger(i)) { throw new Error(`Error: check line ${ln + 1} or above, maybe you used mixed indentions (range:${i})`) }
	return [...Array(i).keys()]
}
function firstWord(str) {
	return str.trim().split(" ")[0]
}
function findIndention(lines) {
	for (let line of lines) {
		if ((line.startsWith(" ") || line.startsWith("\t")) && line.trim()) {
			return line.slice(0, line.indexOf(firstWord(line)))
                .replace(/\t/g,"    ").length	// replacing tab to make a tab equals to 4 spaces
		}
	}
}
function manageSemiColon(content, lastCharacter, context, obstacle) {

	if(content){
		switch (lastCharacter) {
			// when this character found at end, we sholdn't add semicolon
			case ';':	
			case ',':
			case '=':
			case '{':
			case '[':
			case '(':
			  return "";
		}
		if (obstacle.length) {	// check obstacle
			obstacle.pop()
			return ""
		}

		return ";"	
	}
	return ""	// no code found on this line
	
}
function getContexts(lines) {
	let stack = [];
	let contexts = [];

	for (let line of lines) {
		line = line.trim();


		// Process each character in the line
		for (let char of line) {
			if (char === '(' || char === '[' || char === '{') {
				stack.push(char);
			} else if (char === ')' && stack[stack.length - 1] === '(') {
				stack.pop();
			} else if (char === ']' && stack[stack.length - 1] === '[') {
				stack.pop();
			} else if (char === '}' && stack[stack.length - 1] === '{') {
				stack.pop();
			}
		}
		// Determine the context for this line
		if (stack.length === 0) {
			contexts.push(0);
		} else {
			switch (stack[stack.length - 1]) {
				case '(': contexts.push(1); break;
				case '[': contexts.push(2); break;
				case '{': contexts.push(3); break;
				default: contexts.push(0);
			}
		}

	}

	return contexts;
}
function indentionOf(line){
    return line.slice(0, line.indexOf(firstWord(line)))
        .replace(/\t/g,"    ").length	// replacing tab to make a tab equals to 4 spaces
}
function findlastCharacter(content){
	let lastCharacter = content.slice(content.length-2,content.length)
	switch(lastCharacter){
		case "->":
		case "=>":
		case "=:":
			return lastCharacter
		default:
			return lastCharacter[1]
	}
}



function jsips(js) {
	
	let insideLevel = 0
	let output = ""
	
	const lines = js.split("\n")
	const scriptIndentionLength = findIndention(lines)
	const contexts = getContexts(lines)
	const stack = []	// to store closing braces
	const comment = []
	const obstacle = []		// obstacles for semiColons
	const statements = [
		"if","else","function","try","catch",
		"switch",	//no 'case' and 'default', they don't need brackets
		"for","while","finally"
	]

	for (let [index, line] of Object.entries(lines)) {

		//change comment from '//' to '/**/'
		if (line.search(/(?<!['"`])\/\/(?!['"`])/) != -1) {
			//add comment to Array
			comment.push( "/*" + line.slice(line.search(/(?<!['"`])\/\/(?!['"`])/) + 2, line.length-1) + "*/")
			line = line.slice(0, line.indexOf("//"))
		}


		const content = line.trim()
		const lastCharacter = findlastCharacter(content)
		const firstCharacter = content[0]
		const ln = parseInt(index)	//line number
		const currentIndentionsLength = indentionOf(line)
		const diffLevel = insideLevel - (currentIndentionsLength/scriptIndentionLength)  // this is the level of difference 
		const context = contexts[ln]
		const semiColon = manageSemiColon(content,lastCharacter, context, obstacle)	//semiColon for this line

		
		
		//manage braces on indention diffLevelerence
		if (diffLevel > 0 && content) {

			for (let i in range(diffLevel, ln)) {

				if (stack[stack.length - 1].includes(')') && output.endsWith(";")) {
					output = output.slice(0, -1)
					output += stack.pop()
				} else if (stack[stack.length - 1].includes('}') && output.endsWith(",")) {
					// needed to work ',' after functions in objescts
					output = output.slice(0, -1)
					output += stack.pop() + ","
				} else if (stack.length) {
					output += stack.pop()
				}
			}
			insideLevel -= diffLevel
		}


		if (output.endsWith(";")){
			switch(firstCharacter){
				case ".":
				case "(":
				case "[":
				case "{":
					output= output.slice(0,-1)
			}
		}

		// format lines that endswith ':','=>','->'
		switch (lastCharacter){
			case ":" :
			case "=>":
			case ">":
				let statement = content.split(" ")[0].replace(":", "")
			
				if(context==3 && content.split(":").length-1 > 1){	// if there is multiple ':' 
					statement = content.slice(content.indexOf(":")+1,content.length)
						.trim().split(" ")[0].replace(":", "")
				}
				// make new indention to update insideLevel which currentIndention + one indention 
				const newIndentionLevel = (currentIndentionsLength + scriptIndentionLength)/scriptIndentionLength

				if(newIndentionLevel-insideLevel >1){
					for(let extraIndention in range(newIndentionLevel-1,ln)){
						stack.push("")
					}
				}

				// we're only updating insideLevel here
				//	insideLevel+=scriptIndentionLength
				insideLevel =newIndentionLevel
				
				if(statements.includes(statement)){

					const indexofStatement = content.indexOf(statement);
					const args = content.slice(  //from if to ':'
						indexofStatement + statement.length + 1,
						content.lastIndexOf(":")).trim()
					//elif to else if
					if (statement === "elif") { statement = "else if" }
					//needed for 'catch' to work normally
					if (output.endsWith(";") && statement.includes("catch")) {
						output = output.slice(0, -1)
					}


					// add '{' after functions
					if (statement == "function") {
						output += content.slice(0, -1) + "{";
					} else {
						//						check args present 
						output += `${statement}${args ? '(' + args + ')' : ''}{`
					}

					
					//Manage indentions
					if (statement == "if" || statement == "else if") {
						//if and elseif not need semiColon
						stack.push("}");
					} else {
						stack.push("}" + semiColon);
					}
					
				}else if (lastCharacter == "=>") {
					output += content + "{"
					stack.push("}" + semiColon)
				} else if (lastCharacter == "=:") {
					output += content.slice(0,-1) + "{"
					stack.push("}" + semiColon)
					obstacle.push(null)
				} else if (lastCharacter == "->") {
					output += content.slice(0,-2)+ "("
					stack.push(")" + semiColon)
					obstacle.push(null)
				}else if (statement=="case" || statement == "default") {
					output += content
					stack.push("")
				}else {
					output+=content
				}

				break;

			case "(" :
			case "[":
			case "{":
				//object or arry or function parameter etc declartion
				obstacle.push(null)
				output += content + semiColon

				break;
			
			default:
				//add all other lines with semiColon
				output += content + semiColon
			
		}



		//add remining semiColon if last line
		if (ln == (lines.length - 1) && (insideLevel > 0 || stack)) {
			stack.findLast((tag) => {
				if (tag.includes(")") && output.endsWith(";")) {
					output = output.slice(0, output.length - 1)
				} else if (stack[stack.length - 1].includes('}') && output.endsWith(",")) {
					// needed to work ',' after functions in objescts
					output = output.slice(0, -1)
					output += + ","
				}
				output += tag
			})
		}
		if (comment.length) {
			output += comment.pop()
		}
	}
    return output
}

module.exports = jsips