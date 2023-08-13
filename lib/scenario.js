import { addSchema, validate } from "@hyperjump/json-schema/draft-2020-12";
import g010 from './scenario-schema/gimi65536.0.1.0.schema.json';
import g003 from './scenario-schema/gimi65536.0.0.3.schema.json';
import g002 from './scenario-schema/gimi65536.0.0.2.schema.json';
import g001 from './scenario-schema/gimi65536.0.0.1.schema.json';
import { v4 as uuidv4 } from 'uuid';
import antlr4 from 'antlr4'
import Lexer from './syntax/gscenarioLexer';
import Parser from './syntax/gscenarioParser';
import Visitor from './syntax/gscenarioVisitor';
import { arrayMoveMutable } from "array-move";

export { uuidv4 };

addSchema(g010);
addSchema(g003);
addSchema(g002);
addSchema(g001);

export async function processObject2Scenario(obj){
	let success = false;
	let newObj = {...obj};
	success = (await validate(g010.$id, obj)).valid;
	if (success) {
		// If 0.1.0
		return newObj;
	}
	success = (await validate(g003.$id, obj)).valid;
	if(success){
		// If 0.0.3
		return migrateTo010(newObj);
	}
	success = (await validate(g002.$id, obj)).valid;
	if (success) {
		// If 0.0.2
		delete newObj.MacroSignal;
		newObj.MacroStart = '-(';
		newObj.MacroStop = ')-';
		newObj.version = '0.0.3';
		return migrateTo010(newObj);
	}
	success = (await validate(g001.$id, obj)).valid;
	if (success) {
		// If 0.0.1
		newObj.MacroStart = '-(';
		newObj.MacroStop = ')-';
		newObj.MacroSplit = '/';
		newObj.version = '0.0.3';
		return migrateTo010(newObj);
	}
	return emptyScenario();
}

export function emptyScenario(){
	return {
		base: "gimi65536",
		version: "0.1.0",
		macro_start: "-(", // optional
		macro_end: ")-", // optional
		macro_split: "/", // optional
		title: "",
		info: {},
		characters: {
			order: [],
			reference: {}
		},
		dialogues: {
			order: [],
			reference: {}
		}
	}
}

export function emptyDialogue(){
	return {
		components: [],
		speakers_list: []
	}
}

function migrateTo010(newObj){
	const result = {
		base: "gimi65536",
		version: "0.1.0",
		macro_start: newObj.MacroStart,
		macro_end: newObj.MacroStop,
		macro_split: newObj.MacroSplit,
		title: newObj.Title,
		info: newObj.ScenarioInfo,
		characters: {
			order: [],
			reference: {}
		},
		dialogues: {
			order: [],
			reference: {}
		}
	};
	const uuids = new Set();
	let uuid;
	// Process characters
	// Because the old format restricts character names to be unique, we can use Map.
	const name_id_map = new Map();
	for (const name of Object.keys(newObj.Character)){
		// To prevent collision (extremely rare though)
		do {
			uuid = uuidv4();
		} while (uuids.has(uuid));
		uuids.add(uuid);
		name_id_map.set(name, uuid);
		const info = {...newObj.Character[name]};
		delete info.order; // We don't need the order info
		const singleCharacter = {
			name,
			...info
		};
		result.characters.reference[uuid] = singleCharacter;
	}
	// Maintain the order
	let order = [...name_id_map.keys()]; // Now store names
	order.sort((a, b) => newObj.Character[a].order - newObj.Character[b].order); // Maintain the order now
	order = order.map((name) => name_id_map.get(name)); // Now store ids
	result.characters.order = order;
	// Process dialogues
	uuids.clear();
	order = [];
	for (const oldDialogue of newObj.Dialogue) {
		// To prevent collision (extremely rare though)
		do {
			uuid = uuidv4();
		} while (uuids.has(uuid));
		uuids.add(uuid);
		order.push(uuid);
		const text = oldDialogue.Text;
		// Parse text with macro into components
		const components = stripOldMacro(parseDialogue(text));
		const dialogue = {
			...oldDialogue.Info,
			components
		};
		// Rename "speaker_list" to "speakers_list" and change to uuid
		dialogue.speakers_list = dialogue.speaker_list.map((name) => name_id_map.get(name));
		delete dialogue.speaker_list;

		result.dialogues.reference[uuid] = dialogue;
	}
	result.dialogues.order = order;
	return result;
}

export function parseDialogue(input){
	const charStream = new antlr4.CharStream(input);
	const lexer = new Lexer(charStream);
	const tokenStream = new antlr4.CommonTokenStream(lexer);
	const parser = new Parser(tokenStream);
	const context = parser.text();
	const visitor = new Visitor();
	const result = visitor.visitText(context);
	return result;
}

export function componentsToText(components){
	return components.map(component => componentToText(component)).join('');
}

function componentToText(component){
	if(typeof component === 'string'){
		return component;
	}
	const identifier = component.identifier;
	const children = component.map((child) => componentsToText(child));
	if(children.length === 0){
		return `-(${identifier})-`;
	}else{
		return `-(${identifier}/${children.join('/')})-`
	}
}

function stripOldMacro(components, inMacro = false){
	// Old-style macro allows omitted spaces in macro to improve readability
	// For example, -( separate / 123 )- and -(separate/123)- were same macro
	// I still allow the strip for macro name, but the arguments should be
	// aware of the spaces now.
	// For example, -( separate / 123 )- should be interpreted as: separate(" 123 ")
	// instead of separate("123").
	const newComponents = components.map((component, i) => {
		if(typeof component === 'string'){
			if(!inMacro){
				// No need to strip an outmost plaintext
				return component;
			}
			// In macro plaintext
			let trimmed = component;
			if(i == 0){
				// lstrip
				trimmed = trimmed.replace(/^\s+/, '');
			}
			if(i == components.length - 1){
				// rstrip
				trimmed = trimmed.replace(/\s+$/, '');
			}
			return trimmed;
		}
		// Macro
		return {
			identifier: component.identifier,
			children: component.children.map(child => stripOldMacro(child, true))
		};
	});
	return newComponents.filter(component => component !== '');
}

export function isHydrated(scenario){
	return scenario.__hydration !== undefined;
}

export function hydrate(scenario){
	// Make the scenario easy to process by additional information
	// If a UUID has no instance in this point, nothing will happen
	// because this function should not modify the origin part of the
	// scenario.
	if (isHydrated(scenario)){
		return;
	}
	scenario.__hydration = {}
	// ...
}

export function hydrateImmutable(scenario) {
	if (isHydrated(scenario)) {
		return scenario;
	}
	const result = {...scenario};
	hydrate(result);
	return result;
}

export function dehydrate(scenario) {
	// Drop the hydration information
	if (!isHydrated(scenario)) {
		return;
	}
	delete result.__hydration;
}

export function dehydrateImmutable(scenario){
	if (!isHydrated(scenario)){
		return scenario;
	}
	const result = {...scenario};
	dehydrate(result);
	return result;
}

// With has(): boolean
export function generateUUIDWithCollection(collection){
	let u;
	do {
		u = uuidv4();
	} while (collection.has(u));
	return u;
}

// With includes(): 
export function generateUUIDWithArray(array) {
	let u;
	do {
		u = uuidv4();
	} while (array.includes(u));
	return u;
}

// TODO Adapt for hydration
// Soft-need: Function doesn't need hydration to work, but should infor hydrated scenario
// Hard-need: Function need hydration to work efficiently.
// No-need: Function doesn't need hydration to work, and doesn't have to infor hydrated scenario.
export const editFunctions = {
	editDialogue: (s, uuid, newComponents) => {
		// No-need
		s.dialogues.reference[uuid].components = newComponents;
	},
	moveonDialogue: (s, i) => {
		// Soft-need
		if(i === 0){
			return;
		}
		arrayMoveMutable(s.dialogues.order, i, i - 1);
		if (isHydrated(scenario)) {
			// ...
		}
	},
	movedownDialogue: (s, i) => {
		// Soft-need
		arrayMoveMutable(s.dialogues.order, i, i + 1);
		if (isHydrated(scenario)) {
			// ...
		}
	},
	addDialogueBelow: (s, i) => {
		// Hard-need
		hydrate(s);
		// ...
		const newUUID = generateUUIDWithArray(s.dialogues.order);
		s.dialogues.order.push(newUUID);
		arrayMoveMutable(s.dialogues.order, -1, i + 1);
		s.dialogues.reference[newUUID] = emptyDialogue();
	},
	mergeToAbove: (s, i) => {
		// Hard-need
		if (i === 0) {
			return;
		}
		hydrate(s);
		const uuid = s.dialogues.order[i];
		const mainUUID = s.dialogues.order[i - 1];
		const components = s.dialogues.reference[uuid].components;
		// TODO If the mainUUID is shared... generate new UUID
		s.dialogues.reference[mainUUID].components.push(...components);
		editFunctions.deleteDialogue(s, i);
	},
	deleteDialogue: (s, i) => {
		// Hard-need
		hydrate(s);
		const uuid = s.dialogues.order[i];
		arrayMoveMutable(s.dialogues.order, i, -1);
		s.dialogues.order.pop();
		// TODO
		// If the uuid has more instances, do not delete in reference...
		delete s.dialogues.reference[uuid];
	},
}