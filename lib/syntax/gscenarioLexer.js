// Generated from gscenarioLexer.g4 by ANTLR 4.12.0
// jshint ignore: start
import antlr4 from 'antlr4';


const serializedATN = [4,0,4,38,6,-1,6,-1,2,0,7,0,2,1,7,1,2,2,7,2,2,3,7,
3,2,4,7,4,2,5,7,5,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,2,1,2,1,2,1,2,1,2,1,2,1,
3,1,3,1,3,1,3,1,3,1,4,1,4,1,5,1,5,1,5,1,5,0,0,6,2,1,4,2,6,0,8,3,10,4,12,
0,2,0,1,0,36,0,2,1,0,0,0,0,4,1,0,0,0,1,6,1,0,0,0,1,8,1,0,0,0,1,10,1,0,0,
0,1,12,1,0,0,0,2,14,1,0,0,0,4,19,1,0,0,0,6,21,1,0,0,0,8,27,1,0,0,0,10,32,
1,0,0,0,12,34,1,0,0,0,14,15,5,45,0,0,15,16,5,40,0,0,16,17,1,0,0,0,17,18,
6,0,0,0,18,3,1,0,0,0,19,20,9,0,0,0,20,5,1,0,0,0,21,22,5,45,0,0,22,23,5,40,
0,0,23,24,1,0,0,0,24,25,6,2,1,0,25,26,6,2,0,0,26,7,1,0,0,0,27,28,5,41,0,
0,28,29,5,45,0,0,29,30,1,0,0,0,30,31,6,3,2,0,31,9,1,0,0,0,32,33,5,47,0,0,
33,11,1,0,0,0,34,35,9,0,0,0,35,36,1,0,0,0,36,37,6,5,3,0,37,13,1,0,0,0,2,
0,1,4,5,1,0,7,1,0,4,0,0,7,2,0];


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( (ds, index) => new antlr4.dfa.DFA(ds, index) );

export default class gscenarioLexer extends antlr4.Lexer {

    static grammarFileName = "gscenarioLexer.g4";
    static channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];
	static modeNames = [ "DEFAULT_MODE", "IN_MACRO" ];
	static literalNames = [ null, "'-('", null, "')-'", "'/'" ];
	static symbolicNames = [ null, "Macro_start", "Any", "Macro_end", "Split" ];
	static ruleNames = [ "Macro_start", "Any", "Macro_start_recursive", "Macro_end", 
                      "Split", "IN_MACRO_Any" ];

    constructor(input) {
        super(input)
        this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.atn.PredictionContextCache());
    }
}

gscenarioLexer.EOF = antlr4.Token.EOF;
gscenarioLexer.Macro_start = 1;
gscenarioLexer.Any = 2;
gscenarioLexer.Macro_end = 3;
gscenarioLexer.Split = 4;

gscenarioLexer.IN_MACRO = 1;




