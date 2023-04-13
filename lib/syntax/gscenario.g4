grammar gscenario;

options {
	tokenVocab = gscenarioLexer ;
}

text: ( plaintext | macro )* ;
text_in_macro: plaintext ( Split text )* ;
macro: Macro_start Space* text_in_macro Space* Macro_end ;
plaintext: (Any | Space)+ ;