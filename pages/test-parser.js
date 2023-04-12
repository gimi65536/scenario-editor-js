import { useRef } from 'react';
import antlr4 from 'antlr4'
import Lexer from '@/lib/syntax/gscenarioLexer'
import Parser from '@/lib/syntax/gscenarioParser'

export default function TestPage(){
	const inputRef = useRef(null);
	return (
		<>
			<input ref={inputRef} />
			<button onClick={() => {
				const charStream = new antlr4.CharStream(inputRef.current.value);
				const lexer = new Lexer(charStream);
				const tokenStream = new antlr4.CommonTokenStream(lexer);
				const parser = new Parser(tokenStream);
				console.log(parser.text());
			}}>
				Test
			</button>
		</>
	);
}