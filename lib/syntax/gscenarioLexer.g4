lexer grammar gscenarioLexer;

Macro_start : '-(' -> pushMode(IN_MACRO) ;
Any : . ;

mode IN_MACRO;
Macro_start_recursive : '-(' -> type(Macro_start), pushMode(IN_MACRO) ;
Macro_end : ')-' -> popMode ;
Split : '/' ;
Space : [ \t] ;
IN_MACRO_Any : . -> type(Any) ;