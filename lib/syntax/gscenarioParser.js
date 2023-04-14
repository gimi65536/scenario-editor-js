// Generated from gscenario.g4 by ANTLR 4.12.0
// jshint ignore: start
import antlr4 from 'antlr4';
const serializedATN = [4,1,4,33,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,3,1,0,1,0,
5,0,11,8,0,10,0,12,0,14,9,0,1,1,1,1,1,1,5,1,19,8,1,10,1,12,1,22,9,1,1,2,
1,2,1,2,1,2,1,3,4,3,29,8,3,11,3,12,3,30,1,3,0,0,4,0,2,4,6,0,0,32,0,12,1,
0,0,0,2,15,1,0,0,0,4,23,1,0,0,0,6,28,1,0,0,0,8,11,3,6,3,0,9,11,3,4,2,0,10,
8,1,0,0,0,10,9,1,0,0,0,11,14,1,0,0,0,12,10,1,0,0,0,12,13,1,0,0,0,13,1,1,
0,0,0,14,12,1,0,0,0,15,20,3,6,3,0,16,17,5,4,0,0,17,19,3,0,0,0,18,16,1,0,
0,0,19,22,1,0,0,0,20,18,1,0,0,0,20,21,1,0,0,0,21,3,1,0,0,0,22,20,1,0,0,0,
23,24,5,1,0,0,24,25,3,2,1,0,25,26,5,3,0,0,26,5,1,0,0,0,27,29,5,2,0,0,28,
27,1,0,0,0,29,30,1,0,0,0,30,28,1,0,0,0,30,31,1,0,0,0,31,7,1,0,0,0,4,10,12,
20,30];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

const sharedContextCache = new antlr4.atn.PredictionContextCache();

export default class gscenarioParser extends antlr4.Parser {

    static grammarFileName = "gscenario.g4";
    static literalNames = [ null, "'-('", null, "')-'", "'/'" ];
    static symbolicNames = [ null, "Macro_start", "Any", "Macro_end", "Split" ];
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
	    var _la = 0;
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 12;
	        this._errHandler.sync(this);
	        _la = this._input.LA(1);
	        while(_la===1 || _la===2) {
	            this.state = 10;
	            this._errHandler.sync(this);
	            switch(this._input.LA(1)) {
	            case 2:
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
	            this.state = 14;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 23;
	        this.match(gscenarioParser.Macro_start);
	        this.state = 24;
	        this.text_in_macro();
	        this.state = 25;
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
	    try {
	        this.enterOuterAlt(localctx, 1);
	        this.state = 28; 
	        this._errHandler.sync(this);
	        var _alt = 1;
	        do {
	        	switch (_alt) {
	        	case 1:
	        		this.state = 27;
	        		this.match(gscenarioParser.Any);
	        		break;
	        	default:
	        		throw new antlr4.error.NoViableAltException(this);
	        	}
	        	this.state = 30; 
	        	this._errHandler.sync(this);
	        	_alt = this._interp.adaptivePredict(this._input,3, this._ctx);
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



}




gscenarioParser.TextContext = TextContext; 
gscenarioParser.Text_in_macroContext = Text_in_macroContext; 
gscenarioParser.MacroContext = MacroContext; 
gscenarioParser.PlaintextContext = PlaintextContext; 
