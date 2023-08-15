import { useRef, useEffect } from "react";
import {useImmerReducer} from 'use-immer';
import DialogueEditor from "@/components/dialogue-editor";
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';
import reducer from "@/lib/reducer";
import { hydrateImmutable, dehydrateImmutable, normalizeImmutable, validate } from "@/lib/scenario";
import { enableMapSet } from "immer";
enableMapSet();

export default function TestDialogueEditor(){
	const [scenario, dispatch] = useImmerReducer(reducer, hydrateImmutable(normalizeImmutable(validate(json), 1)));

	const textareaRef = useRef(null);
	useEffect(() => {
		if(scenario){
			textareaRef.current.value = JSON.stringify(dehydrateImmutable(scenario));
		}
	});

	return (
		<div style={{ height: 800, width: "100%" }}>
			<DialogueEditor
				scenario={scenario}
				dispatch={dispatch}
				sx={{height: "100%"}}
			/>
			<textarea style={{ width: "100%", height: "50%" }} ref={textareaRef} />
		</div>
	);
}