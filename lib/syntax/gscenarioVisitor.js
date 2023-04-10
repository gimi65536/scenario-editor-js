// Generated from gscenario.g4 by ANTLR 4.12.0
// jshint ignore: start
import antlr4 from 'antlr4';

// This class defines a complete generic visitor for a parse tree produced by gscenarioParser.

export default class gscenarioVisitor extends antlr4.tree.ParseTreeVisitor {

	// Visit a parse tree produced by gscenarioParser#text.
	visitText(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by gscenarioParser#text_in_macro.
	visitText_in_macro(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by gscenarioParser#macro.
	visitMacro(ctx) {
	  return this.visitChildren(ctx);
	}


	// Visit a parse tree produced by gscenarioParser#plaintext.
	visitPlaintext(ctx) {
	  return this.visitChildren(ctx);
	}



}