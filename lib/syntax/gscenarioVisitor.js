import antlr4 from 'antlr4';

export default class gscenarioVisitor extends antlr4.tree.ParseTreeVisitor {
	// Visit a parse tree produced by gscenarioParser#text.
	visitText(ctx) {
		let children = [];
		if(ctx.children === null) {
			// No child
			return children;
		}
		for (const child of ctx.children) {
			switch (ctx.parser.ruleNames[child.ruleIndex]) {
				case 'plaintext':
					children.push(this.visitPlaintext(child));
					break;
				case 'macro':
					children.push(this.visitMacro(child));
					break;
				default:
					break;
			}
		}
		// Eliminate empty strings
		children = children.filter(child => child !== '');
		// Basic string merge
		if(children.length < 2){
			return children;
		}
		const result = [children[0]]
		for(let i = 1; i < children.length; i++){
			const child = children[i];
			if(typeof result[result.length - 1] === 'string' && typeof child === 'string'){
				// Merge
				result[result.length - 1] += child;
			}else{
				result.push(child);
			}
		}
		// Because we have eliminated empty strings before,
		// the result should not contain empty strings.
		return result;
	}

	// Visit a parse tree produced by gscenarioParser#text_in_macro.
	visitText_in_macro(ctx) {
		const children = [];
		let name = '';
		// Because the text_in_macro should starts from PlainText, ctx.children is never null
		for(const child of ctx.children){
			switch (ctx.parser.ruleNames[child.ruleIndex]) {
				case 'plaintext':
					// The macro name (identifier) should be trimmed (can be empty)
					name = this.visitPlaintext(child).trim();
					break;
				case 'text':
					children.push(this.visitText(child));
					break;
				default:
					break;
			}
		}
		return {
			identifier: name,
			children
		}
	}

	// Visit a parse tree produced by gscenarioParser#macro.
	visitMacro(ctx) {
		// Because the macro should starts from '-(', ctx.children is never null
		for(const child of ctx.children){
			if (ctx.parser.ruleNames[child.ruleIndex] === 'text_in_macro'){
				// Return a macro object
				return this.visitText_in_macro(child);
			}
		}
		// Should only happen in errorous condition
		// Return an empty string (like a plaintext)
		return "";
	}

	// Visit a parse tree produced by gscenarioParser#plaintext.
	visitPlaintext(ctx) {
		// Directly return the symbols
		// Because the plaintext should contains some symbols, ctx.children is never null
		return ctx.children.map((c) => c.symbol.text).join('');
	}
}