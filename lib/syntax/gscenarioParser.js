// Generated from gscenario.g4 by ANTLR 4.12.0
// jshint ignore: start
import antlr4 from 'antlr4';
import gscenarioVisitor from './gscenarioVisitor.js';

const serializedATN = [4,1,5,45,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,1,0,1,0,
5,0,11,8,0,10,0,12,0,14,9,0,1,1,1,1,1,1,5,1,19,8,1,10,1,12,1,22,9,1,1,2,
1,2,5,2,26,8,2,10,2,12,2,29,9,2,1,2,1,2,5,2,33,8,2,10,2,12,2,36,9,2,1,2,
1,2,1,3,4,3,41,8,3,11,3,12,3,42,1,3,0,0,4,0,2,4,6,0,1,2,0,2,2,5,5,46,0,12,
1,0,0,0,2,15,1,0,0,0,4,23,1,0,0,0,6,40,1,0,0,0,8,11,3,6,3,0,9,11,3,4,2,0,
10,8,1,0,0,0,10,9,1,0,0,0,11,14,1,0,0,0,12,10,1,0,0,0,12,13,1,0,0,0,13,1,
1,0,0,0,14,12,1,0,0,0,15,20,3,6,3,0,16,17,5,4,0,0,17,19,3,0,0,0,18,16,1,
0,0,0,19,22,1,0,0,0,20,18,1,0,0,0,20,21,1,0,0,0,21,3,1,0,0,0,22,20,1,0,0,
0,23,27,5,1,0,0,24,26,5,5,0,0,25,24,1,0,0,0,26,29,1,0,0,0,27,25,1,0,0,0,
27,28,1,0,0,0,28,30,1,0,0,0,29,27,1,0,0,0,30,34,3,2,1,0,31,33,5,5,0,0,32,
31,1,0,0,0,33,36,1,0,0,0,34,32,1,0,0,0,34,35,1,0,0,0,35,37,1,0,0,0,36,34,
1,0,0,0,37,38,5,3,0,0,38,5,1,0,0,0,39,41,7,0,0,0,40,39,1,0,0,0,41,42,1,0,
0,0,42,40,1,0,0,0,42,43,1,0,0,0,43,7,1,0,0,0,6,10,12,20,27,34,42];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class gscenarioParser extends antlr4.Parser {

    static grammarFileName = "gscenario.g4";
    static literalNames = [ null, "'-('", null, "')-'", "'/'" ];
    static symbolicNames = [ null, "Macro_start", "Any", "Macro_end", "Split", 
                             "Space" ];
    static ruleNames = [ "text", "text_in_macro", "macro", "plaintext" ];

    constructor(input) {
        super(input);
        this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
        this.ruleNames = gscenarioParser.ruleNames;
        this.literalNames = gscenarioParser.literalNames;
        this.symbolicNames = gscenarioParser.symbolicNames;
    }



	text() {
	    let localctx = new TextContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 0, gscenarioParser.RULE_text);
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 12;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,1,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 10;
	                this._errHandler.sync(this);
	                switch(this._input.LA(1)) {
	                case 2:
	                case 5:
	                    this.state = 8;
	                    this.plaintext();
	                    break;
	                case 1:
	                    this.state = 9;
	                    this.macro();
	                    break;
	                default:
	                    throw new antlr4.error.NoViableAltException(this);
	                } 
	            }
	            this.state = 14;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,1,this._ctx);
	        }

	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	text_in_macro() {
	    let localctx = new Text_in_macroContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 2, gscenarioParser.RULE_text_in_macro);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 15;
	        this.plaintext();
	        this.state = 20;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===4) {
	            this.state = 16;
	            this.match(gscenarioParser.Split);
	            this.state = 17;
	            this.text();
	            this.state = 22;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	macro() {
	    let localctx = new MacroContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 4, gscenarioParser.RULE_macro);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 23;
	        this.match(gscenarioParser.Macro_start);
	        this.state = 27;
	        this._errHandler.sync(this);
	        var _alt = this._interp.adaptivePredict(this._input,3,this._ctx)
	        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
	            if(_alt===1) {
	                this.state = 24;
	                this.match(gscenarioParser.Space); 
	            }
	            this.state = 29;
	            this._errHandler.sync(this);
	            _alt = this._interp.adaptivePredict(this._input,3,this._ctx);
	        }

	        this.state = 30;
	        this.text_in_macro();
	        this.state = 34;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===5) {
	            this.state = 31;
	            this.match(gscenarioParser.Space);
	            this.state = 36;
	            this._errHandler.sync(this);
	            _la = this._input.LA(1);
	        }
	        this.state = 37;
	        this.match(gscenarioParser.Macro_end);
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}



	plaintext() {
	    let localctx = new PlaintextContext(this, this._ctx, this.state);
	    this.enterRule(localctx, 6, gscenarioParser.RULE_plaintext);
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 40; 
	        this._errHandler.sync(this);
	        var _alt = 1;
	        do {
	        	switch (_alt) {
	        	case 1:
	        		this.state = 39;
	        		_la = this._input.LA(1);
	        		if(!(_la===2 || _la===5)) {
	        		this._errHandler.recoverInline(this);
	        		}
	        		else {
	        			this._errHandler.reportMatch(this);
	        		    this.consume();
	        		}
	        		break;
	        	default:
	        		throw new antlr4.error.NoViableAltException(this);
	        	}
	        	this.state = 42; 
	        	this._errHandler.sync(this);
	        	_alt = this._interp.adaptivePredict(this._input,5, this._ctx);
	        } while ( _alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER );
	    } catch (re) {
	    	if(re instanceof antlr4.error.RecognitionException) {
		        localctx.exception = re;
		        this._errHandler.reportError(this, re);
		        this._errHandler.recover(this, re);
		    } else {
		    	throw re;
		    }
	    } finally {
	        this.exitRule();
	    }
	    return localctx;
	}


}

gscenarioParser.EOF = antlr4.Token.EOF;
gscenarioParser.Macro_start = 1;
gscenarioParser.Any = 2;
gscenarioParser.Macro_end = 3;
gscenarioParser.Split = 4;
gscenarioParser.Space = 5;

gscenarioParser.RULE_text = 0;
gscenarioParser.RULE_text_in_macro = 1;
gscenarioParser.RULE_macro = 2;
gscenarioParser.RULE_plaintext = 3;

class TextContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = gscenarioParser.RULE_text;
    }

	plaintext = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(PlaintextContext);
	    } else {
	        return this.getTypedRuleContext(PlaintextContext,i);
	    }
	};

	macro = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(MacroContext);
	    } else {
	        return this.getTypedRuleContext(MacroContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof gscenarioVisitor ) {
	        return visitor.visitText(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class Text_in_macroContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = gscenarioParser.RULE_text_in_macro;
    }

	plaintext() {
	    return this.getTypedRuleContext(PlaintextContext,0);
	};

	Split = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(gscenarioParser.Split);
	    } else {
	        return this.getToken(gscenarioParser.Split, i);
	    }
	};


	text = function(i) {
	    if(i===undefined) {
	        i = null;
	    }
	    if(i===null) {
	        return this.getTypedRuleContexts(TextContext);
	    } else {
	        return this.getTypedRuleContext(TextContext,i);
	    }
	};

	accept(visitor) {
	    if ( visitor instanceof gscenarioVisitor ) {
	        return visitor.visitText_in_macro(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class MacroContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = gscenarioParser.RULE_macro;
    }

	Macro_start() {
	    return this.getToken(gscenarioParser.Macro_start, 0);
	};

	text_in_macro() {
	    return this.getTypedRuleContext(Text_in_macroContext,0);
	};

	Macro_end() {
	    return this.getToken(gscenarioParser.Macro_end, 0);
	};

	Space = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(gscenarioParser.Space);
	    } else {
	        return this.getToken(gscenarioParser.Space, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof gscenarioVisitor ) {
	        return visitor.visitMacro(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}



class PlaintextContext extends antlr4.ParserRuleContext {

    constructor(parser, parent, invokingState) {
        if(parent===undefined) {
            parent = null;
        }
        if(invokingState===undefined || invokingState===null) {
            invokingState = -1;
        }
        super(parent, invokingState);
        this.parser = parser;
        this.ruleIndex = gscenarioParser.RULE_plaintext;
    }

	Any = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(gscenarioParser.Any);
	    } else {
	        return this.getToken(gscenarioParser.Any, i);
	    }
	};


	Space = function(i) {
		if(i===undefined) {
			i = null;
		}
	    if(i===null) {
	        return this.getTokens(gscenarioParser.Space);
	    } else {
	        return this.getToken(gscenarioParser.Space, i);
	    }
	};


	accept(visitor) {
	    if ( visitor instanceof gscenarioVisitor ) {
	        return visitor.visitPlaintext(this);
	    } else {
	        return visitor.visitChildren(this);
	    }
	}


}




gscenarioParser.TextContext = TextContext; 
gscenarioParser.Text_in_macroContext = Text_in_macroContext; 
gscenarioParser.MacroContext = MacroContext; 
gscenarioParser.PlaintextContext = PlaintextContext; 
