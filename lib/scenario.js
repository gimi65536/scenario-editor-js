import { addSchema, validate as schemaValidate } from "@hyperjump/json-schema/draft-2020-12";
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
import lodash from "lodash";
import { Set as ImmutableSet } from "immutable";

/**
 * @typedef {Object} Scenario
 * @property {String} base
 * @property {String} version
 * @property {String} [macro_start]
 * @property {String} [macro_end]
 * @property {String} [macro_split]
 * @property {String} title
 * @property {Object} info
 * @property {Object} characters
 * @property {Array<String>} characters.order
 * @property {Object.<String, {name: String, color?: String, abbreviated?: String, gender?: String, cast?: String}>} characters.reference
 * @property {Object} dialogues
 * @property {Array<String>} dialogues.order
 * @property {Object.<String, {components: Array<MacroComponent>, speakers_list: String, speaker?: String}>} dialogues.reference
 */

/**
 * @typedef {Object} Macro
 * @property {String} identifier
 * @property {Array<MacroComponent>} children
 */

/**
 * @typedef {String | Macro} MacroComponent
 */

export { uuidv4 };

addSchema(g010);
addSchema(g003);
addSchema(g002);
addSchema(g001);

export async function processObject2Scenario(obj){
	let success = false;
	let newObj = {...obj};
	success = (await schemaValidate(g010.$id, obj)).valid;
	if (success) {
		// If 0.1.0
		return validate(newObj);
	}
	success = (await schemaValidate(g003.$id, obj)).valid;
	if(success){
		// If 0.0.3
		return migrateTo010(newObj);
	}
	success = (await schemaValidate(g002.$id, obj)).valid;
	if (success) {
		// If 0.0.2
		delete newObj.MacroSignal;
		newObj.MacroStart = '-(';
		newObj.MacroStop = ')-';
		newObj.version = '0.0.3';
		return migrateTo010(newObj);
	}
	success = (await schemaValidate(g001.$id, obj)).valid;
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

/**
 * @returns {Scenario}
 */
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
	return validate(result);
}

/**
 * @pre The input should follow the JSON schema.
 * @param {Scenario} scenario 
 * @returns validated scenario
 */
export function validate(scenario){
	// Something that cannot be detected by JSON schema

	// Each character uuid in order should be valid
	const newc = [];
	for (const cuuid of scenario.characters.order) {
		if (Object.hasOwn(scenario.characters.reference, cuuid)) {
			newc.push(cuuid);
		}
	}
	scenario.characters.order = newc;

	// Each dialogue uuid in order should be valid
	const newd = [];
	for (const duuid of scenario.dialogues.order) {
		if (Object.hasOwn(scenario.dialogues.reference, duuid)) {
			newd.push(duuid);
		}
	}
	scenario.dialogues.order = newd;

	// Each character uuid in speakers_list should be valid
	for(const dialogue of Object.values(scenario.dialogues.reference)){
		const news = [];
		for(const cuuid of dialogue.speakers_list){
			if (Object.hasOwn(scenario.characters.reference, cuuid)) {
				news.push(cuuid);
			}
		}
		dialogue.speakers_list = news;
	}

	return scenario;
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

/**
 * Old-style macro allows omitted spaces in macro to improve readability
 * For example, -( separate / 123 )- and -(separate/123)- were same macro
 * I still allow the strip for macro name, but the arguments should be
 * aware of the spaces now.
 * For example, -( separate / 123 )- should be interpreted as: separate(" 123 ")
 * instead of separate("123").
 */
function stripOldMacro(components, inMacro = false){
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

export function hydratedLevel(scenario){
	if (!isHydrated(scenario)) {
		return 0;
	}
	return scenario.__hydration.level;
}
/**
 * Make the scenario easy to process by additional information
 * If a UUID has no instance in this point, nothing will happen
 * because this function should not modify the origin part of the
 * scenario.
 * 
 * @param {Scenario} scenario
 */
export function hydrate(scenario, level = 1){
	if (level <= 0) {
		return;
	}
	if (isHydrated(scenario) && scenario.__hydration.level >= level) {
		return;
	}
	if (!isHydrated(scenario)) {
		scenario.__hydration = {}
		scenario.__hydration.level = 0;
	}

	// LEVEL 1 HYDRATION
	if(scenario.__hydration.level < 1) {
		// Dialogue in set
		scenario.__hydration.dialogueSet = new Set(Object.keys(scenario.dialogues.reference));

		// Character in set
		scenario.__hydration.characterSet = new Set(Object.keys(scenario.characters.reference));

		const c2d = new Map(); // Map[UUID, Set[UUID]]
		for (const cuuid of scenario.__hydration.characterSet) {
			c2d.set(cuuid, new Set());
		}
		for (const duuid of scenario.__hydration.dialogueSet) {
			const dialogue = scenario.dialogues.reference[duuid];
			for (const cuuid of dialogue.speakers_list) {
				c2d.get(cuuid).add(duuid);
			}
		}
		scenario.__hydration.characterToDialogue = c2d;

		const doccur = new Map(); // Map[UUID, int]
		for (const uuid of scenario.__hydration.dialogueSet) {
			doccur.set(uuid, 0);
		}
		for (const index in scenario.dialogues.order) {
			const uuid = scenario.dialogues.order[index];
			doccur.set(uuid, doccur.get(uuid) + 1);
		}
		scenario.__hydration.dialogueOccurrence = doccur;

		scenario.__hydration.level = 1;
	}

	if (level <= 1) {
		return;
	}

	// LEVEL 2 HYDRATION
	if (scenario.__hydration.level < 2) {
		// Dialogue to index
		const d2i = new Map(); // Map[UUID, Set[int]]
		for (const uuid of scenario.__hydration.dialogueSet) {
			d2i.set(uuid, new Set());
		}
		for (const index in scenario.dialogues.order) {
			const uuid = scenario.dialogues.order[index];
			d2i.get(uuid).add(index);
		}
		scenario.__hydration.dialogueToIndex = d2i;

		const c2i = new Map(); // Map[UUID, int|null]
		for (const uuid of scenario.__hydration.characterSet) {
			c2i.set(uuid, null);
		}
		for (const index in scenario.characters.order) {
			const uuid = scenario.characters.order[index];
			c2i.set(uuid, index);
		}
		scenario.__hydration.characterToIndex = c2i;

		scenario.__hydration.level = 2;
	}

	if (level <= 2) {
		return;
	}

	// ...
}

/**
 * An immutable version of {@link hydrate}.
 * @param {Scenario} scenario
 */
export function hydrateImmutable(scenario, level = 1) {
	if (isHydrated(scenario)) {
		return scenario;
	}
	/** @type {Scenario} */
	const result = {...scenario};
	hydrate(result, level);
	return result;
}

/** 
 * Drop the hydration information
 * @param {Scenario} scenario
 */
export function dehydrate(scenario) {
	if (!isHydrated(scenario)) {
		return;
	}
	delete scenario.__hydration;
}

/**
 * An immutable version of {@link dehydrate}.
 * @param {Scenario} scenario
 */
export function dehydrateImmutable(scenario){
	if (!isHydrated(scenario)){
		return scenario;
	}
	/** @type {Scenario} */
	const result = {...scenario};
	dehydrate(result);
	return result;
}

/**
 * code >= 0: Do AM1 (At-Most-1) normalization
 * 
 * code <= 0: Do AL1 (At-Least-1) normalization
 * * atleastFlag 0b10: Character AL1 (CAL1)
 * * atleastFlag 0b01: Dialogue AL1 (DAL1)
 * 
 * Somehow you should only call this function once or never.
 * If you need normalized scenario, call it at beginning and maintain normalization BY YOUR SELF
 * INSTEAD OF CALLING THIS FUNCTION EVERYTIME when the scenario gets modified.
 * For convenience, normalization will "re-generate" hydration if given hydrated scenario
 * instead of adjust hydation.
 * @param {Scenario} scenario
 */
export function normalize(scenario, code = 0, atleastFlag = 0b11){
	// Code >= 0: At most 1 occurrence
	// AM1 (At-Most-1) normalization is only meaningful for dialogues
	if(code >= 0){
		// Character order is unique (RULED by the JSON schema)
		// Dialogue order
		const dset = new Set();
		for (const [i, duuid] of scenario.dialogues.order.entries()) {
			if (!dset.has(duuid)) {
				dset.add(duuid);
				continue;
			}
			// Divide
			if (isHydrated(scenario)) {
				newUUID = generateUUIDWithCollection(scenario.__hydration.dialogueSet);
			} else {
				newUUID = generateUUIDWithArray(Object.keys(scenario.dialogues.reference));
			}
			const newInfo = lodash.cloneDeep(scenario.dialogues.reference[duuid]);
			scenario.dialogues.reference[newUUID] = newInfo;
			scenario.dialogues.order[i] = newUUID;
			// Temporarily hydration (collision prevent)
			if (isHydrated(scenario)) {
				scenario.__hydration.dialogueSet.add(newUUID);
			}
		}
	}

	// Code <= 0: At least 1 occurrence
	// AL1 (At-Least-1) normalization can be applied on characters and dialogues
	// CAL1 for characters, DAL1 for dialogues.
	// Flag 0x10 for characters, 0x01 for dialogues
	if(code <= 0){
		if(atleastFlag & 0b10){
			// Character, CAL1
			const characterSet = ImmutableSet((isHydrated(scenario)) ? scenario.__hydration.characterSet : Object.keys(scenario.characters.reference));
			for (const isolatedCharacter of characterSet.subtract(scenario.characters.order)) {
				delete scenario.characters.reference[isolatedCharacter];
			}
		}

		if(atleastFlag & 0b01){
			// Dialogue, DAL1
			const dialogueSet = ImmutableSet((isHydrated(scenario)) ? scenario.__hydration.dialogueSet : Object.keys(scenario.dialogues.reference));
			for (const isolatedDialogue of dialogueSet.subtract(scenario.dialogues.order)) {
				delete scenario.dialogues.reference[isolatedDialogue];
			}
		}
	}

	// Re-hydate
	if(isHydrated(scenario)){
		hydrate(dehydrate(scenario), scenario.__hydration.level);
	}
}

/**
 * An immutable version of {@link normalize}.
 * @param {Scenario} scenario
 */
export function normalizeImmutable(scenario, code = 0, atleastFlag = 0b11){
	const result = lodash.cloneDeep(scenario);
	normalize(result, code, atleastFlag);
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

/**
 * Soft-need (level): Function doesn't need hydration to work, but should infor hydrated scenario
 * Hard-need level (level): Function need hydration to work efficiently.
 * No-need: Function doesn't need hydration to work, and doesn't have to infor hydrated scenario.
 * These library-providing functions should be normalization-consistent.
 */
export const editFunctions = {
	/**
	 * No-need
	 * @param {Scenario} s
	 */
	editDialogue: (s, uuid, newComponents) => {
		// No-need
		s.dialogues.reference[uuid].components = newComponents;
	},
	/**
	 * Soft-need (2)
	 * @param {Scenario} s
	 * @param {number} i
	 */
	moveonDialogue: (s, i) => {
		// Soft-need (2)
		if(i === 0){
			return;
		}
		arrayMoveMutable(s.dialogues.order, i, i - 1);
		if (hydratedLevel(s) >= 2) {
			const uuid_i_i1 = s.dialogues.order[i - 1];
			const uuid_i1_i = s.dialogues.order[i];

			let set = s.__hydration.dialogueToIndex.get(uuid_i_i1);
			set.delete(i);
			set.add(i - 1);

			set = s.__hydration.dialogueToIndex.get(uuid_i1_i);
			set.delete(i - 1);
			set.add(i);
		}
	},
	/**
	 * Soft-need (2)
	 * @param {Scenario} s
	 * @param {number} i
	 */
	movedownDialogue: (s, i) => {
		arrayMoveMutable(s.dialogues.order, i, i + 1);
		if (hydratedLevel(s) >= 2) {
			const uuid_i_i1 = s.dialogues.order[i + 1];
			const uuid_i1_i = s.dialogues.order[i];

			let set = s.__hydration.dialogueToIndex.get(uuid_i_i1);
			set.delete(i);
			set.add(i + 1);

			set = s.__hydration.dialogueToIndex.get(uuid_i1_i);
			set.delete(i + 1);
			set.add(i);
		}
	},
	/**
	 * Hard-need 1 (2)
	 * @param {Scenario} s
	 * @param {number} i
	 */
	addDialogueBelow: (s, i) => {
		// Hard-need 1 (2)
		hydrate(s, 1);
		const newUUID = generateUUIDWithCollection(s.__hydration.dialogueSet);
		s.dialogues.order.push(newUUID);
		arrayMoveMutable(s.dialogues.order, -1, i + 1);
		s.dialogues.reference[newUUID] = emptyDialogue();
		// Hydration
		s.__hydration.dialogueSet.add(newUUID);
		s.__hydration.dialogueOccurrence.set(newUUID, 1);
		if (hydratedLevel(s) >= 2) {
			for(let j = s.dialogues.order.length - 1; j > i; j--){
				const uuid = s.dialogues.order[j];
				const set = s.__hydration.dialogueToIndex.get(uuid);
				set.delete(j - 1);
				set.add(j);
			}
		}
	},
	/**
	 * Hard-need 1 (2)
	 * @param {Scenario} s
	 * @param {number} i
	 */
	mergeToAbove: (s, i) => {
		if (i === 0) {
			return;
		}
		hydrate(s, 1);
		const uuid = s.dialogues.order[i];
		const mainUUID = s.dialogues.order[i - 1];
		const components = s.dialogues.reference[uuid].components;
		if (s.__hydration.dialogueOccurrence.get(mainUUID) >= 2) {
			// If the mainUUID is shared... generate new UUID
			const newUUID = generateUUIDWithCollection(s.__hydration.dialogueSet);
			s.dialogues.order[i - 1] = newUUID;
			s.dialogues.reference[newUUID] = lodash.cloneDeep(s.dialogues.reference[mainUUID]);
			// Hydration
			s.__hydration.dialogueSet.add(newUUID);
			s.__hydration.dialogueOccurrence.set(newUUID, 1);
			s.__hydration.dialogueOccurrence.set(mainUUID, s.__hydration.dialogueOccurrence.get(mainUUID) - 1);
			for (const cuuid of s.dialogues.reference[newUUID].speakers_list) {
				s.__hydration.characterToDialogue.get(cuuid).add(newUUID);
			}
			if (hydratedLevel(s) >= 2) {
				s.__hydration.dialogueToIndex.get(mainUUID).delete(i - 1);
				s.__hydration.dialogueToIndex.set(newUUID, new Set([i - 1]));
			}
			s.dialogues.reference[newUUID].components.push(...components);
		}else{
			s.dialogues.reference[mainUUID].components.push(...components);
		}
		editFunctions.deleteDialogue(s, i);
	},
	/**
	 * Hard-need 1 (2)
	 * @param {Scenario} s
	 * @param {number} i
	 */
	deleteDialogue: (s, i) => {
		hydrate(s, 1);
		const uuid = s.dialogues.order[i];
		arrayMoveMutable(s.dialogues.order, i, -1);
		s.dialogues.order.pop();
		// If the uuid has more instances, do not delete in reference...
		if (s.__hydration.dialogueOccurrence.get(uuid) === 1) {
			// Normal delete
			// Delete the reference to achieve DAL1-consistent
			const speakers_list = s.dialogues.reference[uuid].speakers_list;
			delete s.dialogues.reference[uuid];
			// Hydration
			s.__hydration.dialogueSet.delete(uuid);
			s.__hydration.dialogueOccurrence.delete(uuid);
			for (const cuuid of speakers_list) {
				s.__hydration.characterToDialogue.get(cuuid).delete(uuid);
			}
			if (hydratedLevel(s) >= 2) {
				s.__hydration.dialogueToIndex.delete(uuid);
			}
		}else{
			// Drop instance
			// Hydration
			s.__hydration.dialogueOccurrence.set(uuid, s.__hydration.dialogueOccurrence.get(uuid) - 1);
			if (hydratedLevel(s) >= 2) {
				s.__hydration.dialogueToIndex.get(uuid).delete(i);
			}
		}
		// Hydration
		if (hydratedLevel(s) >= 2) {
			for (let j = s.dialogues.order.length - 1; j >= i; j--) {
				const uuid = s.dialogues.order[j];
				const set = s.__hydration.dialogueToIndex.get(uuid);
				set.delete(j + 1);
				set.add(j);
			}
		}
	},
}