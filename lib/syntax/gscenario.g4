grammar gscenario;

options {
	tokenVocab = gscenarioLexer ;
}

text : ( plaintext | macro )* ;
text_in_macro : text ( Split text )* ;
macro : Macro_start Space* text_in_macro Space* Macro_end ;
plaintext : (Any | Space)+ ;