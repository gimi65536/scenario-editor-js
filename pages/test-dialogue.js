import { useRef, useEffect } from "react";
import {useImmerReducer} from 'use-immer';
import DialogueEditor from "@/components/dialogue-editor";
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';
import { editFunctions } from "@/lib/scenario";

function reducer(draft, action){
	switch(action.type){
		case 'edit_dialogue':
			editFunctions.editDialogue(draft, action.uuid, action.components);
			break;
		case 'moveon_dialogue':
			editFunctions.moveonDialogue(draft, action.uuid);
			break;
		case 'movedown_dialogue':
			editFunctions.movedownDialogue(draft, action.uuid);
			break;
		case 'add_dialogue_below':
			editFunctions.addDialogueBelow(draft, action.uuid);
			break;
		case 'delete_dialogue':
			editFunctions.deleteDialogue(draft, action.uuid);
			break;
		default:
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