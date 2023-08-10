import { useRef, useEffect } from "react";
import {useImmerReducer} from 'use-immer';
import { DataGrid } from "@mui/x-data-grid";
import DialogueEditor from "@/components/dialogue-editor";
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';

function reducer(draft, action){
	if(action.type === 'edit_dialogue'){
		const uuid = action.uuid;
		const newComponents = action.components;
		draft.dialogues.reference[uuid].components = newComponents;
	}
}

export default function TestDialogueEditor(){
	const [scenario, dispatch] = useImmerReducer(reducer, json);

	const textareaRef = useRef(null);
	useEffect(() => {
		if(scenario){
			textareaRef.current.value = JSON.stringify(scenario);
		}
	});

	return (
		<div style={{ height: 800, width: "100%" }}>
			<DialogueEditor
				scenario={scenario}
				dispatch={dispatch}
			/>
			<textarea style={{ width: "100%", height: "50%" }} ref={textareaRef} />
		</div>
	);
}