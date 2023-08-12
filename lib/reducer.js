import { editFunctions } from "@/lib/scenario";

export default function reducer(draft, action){
	switch (action.type) {
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
		case 'merge_to_above':
			editFunctions.mergeToAbove(draft, action.uuid);
			break;
		case 'delete_dialogue':
			editFunctions.deleteDialogue(draft, action.uuid);
			break;
		default:
			console.log(`Unknown type ${action.type}`);
			console.log(action)
	}
}