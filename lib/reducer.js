import { editFunctions } from "@/lib/scenario";

export default function reducer(draft, action){
	switch (action.type) {
		case 'edit_dialogue':
			editFunctions.editDialogue(draft, action.uuid, action.components);
			break;
		case 'moveon_dialogue':
			editFunctions.moveonDialogue(draft, action.index);
			break;
		case 'movedown_dialogue':
			editFunctions.movedownDialogue(draft, action.index);
			break;
		case 'add_dialogue_below':
			editFunctions.addDialogueBelow(draft, action.index);
			break;
		case 'merge_to_above':
			editFunctions.mergeToAbove(draft, action.index);
			break;
		case 'delete_dialogue':
			editFunctions.deleteDialogue(draft, action.index);
			break;
		case 'edit_speaker_name':
			editFunctions.editSpeakerName(draft, action.uuids, action.name);
			break;
		case 'edit_speakers':
			editFunctions.editSpeakers(draft, action.uuids, action.characters);
			break;
		case 'move_character':
			editFunctions.moveCharacter(draft, action.from, action.to);
			break;
		case 'add_character':
			editFunctions.addCharacter(draft);
			break;
		case 'delete_character':
			editFunctions.deleteCharacter(draft, action.index);
			break;
		default:
			console.log(`Unknown type ${action.type}`);
			console.log(action)
	}
}