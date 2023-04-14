import { useRef } from 'react';
import { parseDialogue } from '@/lib/scenario'

export default function TestPage(){
	const inputRef = useRef(null);
	return (
		<>
			<input ref={inputRef} />
			<button onClick={() => {
				console.log(parseDialogue(inputRef.current.value));
			}}>
				Test
			</button>
		</>
	);
}