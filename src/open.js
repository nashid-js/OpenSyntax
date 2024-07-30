"use strict";
function range(i, ln) {
	if (!Number.isInteger(i)) { throw new Error(`Error: check line ${ln + 1} or above, maybe you used mixed indentions`) }
	return [...Array(i).keys()]
}
function firstWord(str) {
	return str.trim().split(" ")[0]
}
function indentionLevelOf(line, indention) {
	const whiteSpaces = line.slice(0, line.indexOf(firstWord(line)[0]));
	return whiteSpaces.length / indention;
}
function findIndention(lines) {
	let indention = 0
	for (let line of lines) {
		if (line.startsWith(" ") || line.startsWith("\t") && line.trim()) {
			const indentions = line.slice(0, line.indexOf(firstWord(line)));
			return indentions
		}
	}
}
function manageSemiColon(content, context, obstacle) {
	
	if (content.endsWith(";") || context > 0 ||
		!content || content.endsWith(",")) {
		return ""
	} else if (obstacle.length) {
		obstacle.pop()
		return ""
	} else {
		return ";"
	}
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




function jsips(js) {
	const lines = js.split("\n")
	const scriptIndention = findIndention(lines)

	let inside = 0
	let output = ""

	const contexts = getContexts(lines)
	const stack = []
	const comment = []
	const obstacle = []
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
		const ln = parseInt(index)	//line number
		const currentIndentions = line.slice(0, line.indexOf(firstWord(line))).length
		const diff = inside - currentIndentions
		const context = contexts[ln]
		const semiColon = manageSemiColon(content, context, obstacle)	//semiColon for this line

		//manage braces on indention difference
		if (diff > 0 && content) {
			const diffLevel = diff / scriptIndention.length
			for (let i in range(diffLevel, ln)) {

				if (stack[stack.length - 1] == ")" && output.endsWith(";")) {
					output = output.slice(0, -1)
				} else if (stack[stack.length - 1] == "}" && output.endsWith(",")) {
					output = output.slice(0, -1)
					output += stack.pop() + ","
				} else if (stack.length) {
					output += stack.pop()
				}

			}
			inside -= diff
		}


		// format lines that endswith ':','=>','->'
		 if (content.endsWith(":") || content.endsWith("=>") || content.endsWith("->")) {


			let statement = content.split(" ")[0].replace(":", "")

			if(context==3 && content.split(":").length-1 > 1){
				statement = content.slice(content.indexOf(":")+1,content.length)
					.trim().split(" ")[0].replace(":", "")
			}

			const newIndention = currentIndentions + scriptIndention.length
			if(newIndention-inside >1){
				for(let extraIndention in range(newIndention-1)){
					stack.push("")
				}
			}

			//	inside+=scriptIndention.length
			inside =newIndention
			
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
				
			}else if (content.endsWith("=>")) {
				output += content + "{"
				stack.push("}" + semiColon)
			} else if (content.endsWith("=:")) {
				output += content.slice(0,-1) + "{"
				stack.push("}" + semiColon)
				obstacle.push(null)
			} else if (content.endsWith("->")) {
				output += content.slice(0,-2)+ "("
				stack.push(")" + semiColon)
				obstacle.push(null)
			}else if (statement=="case" || statement == "default") {
				output += content
				stack.push("")
			}else {
				output+=content
			}

		} else {
			//add all other lines with semiColon
			output += content + semiColon
		}



		//add remining semiColon if last line
		if (ln == (lines.length - 1) && (inside > 0 || stack)) {
			stack.findLast((tag) => {
				if (tag.includes(")") && output.endsWith(";")) {
					output = output.slice(0, output.length - 1)
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