grammar gscenario;

options {
	tokenVocab = gscenarioLexer ;
}

text: ( plaintext | macro )* ;
text_in_macro: plaintext ( Split text )* ;
macro: Macro_start text_in_macro Macro_end ;
plaintext: Any+ ;