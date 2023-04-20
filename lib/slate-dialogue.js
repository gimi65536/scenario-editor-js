import { Editor, Transforms, Range, Text, Element, Node, createEditor as create } from "slate";
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { slateMacros as macros } from './macro';

const macrosReverse = new Map();
for (const [macroNameInSlate, info] of macros) {
	const macroName = info.macroName;
	if (!macrosReverse.has(macroName)) {
		macrosReverse.set(macroName, new Map());
	}
	macrosReverse.get(macroName).set(info.childrenNumber, macroNameInSlate);
}

const withMacro = (editor) => {
	const {
		insertData,
		insertText,
		isInline,
		isElementReadOnly,
		isSelectable,
		normalizeNode,
	} = editor;

	editor.isInline = (element) =>
		element.type === 'macro' || element.type === 'macroslot' || isInline(element);

	editor.normalizeNode = (entry) => {
		const [node, path] = entry;

		if (Element.isElement(node)) {
			if (node.type === 'macro') {
				const macroNameInSlate = node.macroName;
				// Check if the macro is sub and the place can put sub
				const levels = [...Editor.levels(editor, { at: path, reverse: true })];
				if (levels.length >= 3) {
					const [parentNode, parentPath] = levels[1];
					if (parentNode.type === 'macroslot') {
						const index = parentNode.index;
						const [grandNode, grandPath] = levels[2];
						if (grandNode.type === 'macro' && macros.has(grandNode.macroName)) {
							const parentMacroInfo = macros.get(grandNode.macroName);
							// Note that the incorrect index is not concered because it SHOULD NOT happen at all
							if (!parentMacroInfo.canSub[index]) {
								// Cannot put sub macro here...
								Transforms.unwrapNodes(editor, { at: path });
								return;
							}
						}
						// else? Nude slots are not processed here.
					}
				}
				// Check children
				let nextIndex = 0;
				for (const [child, childPath] of Node.children(editor, path)) {
					if (Text.isText(child) && child.text.length > 0) {
						// Every text child in macro should be empty
						// This ensures the text nodes in macro could not be editable (back-end control)
						Transforms.delete(editor, { at: childPath });
						return;
					}
					// Normalize slot number to prevent accidently removal
					// Since users cannot move slots (ensured by our insertData),
					// we only focus on the lack of the slots.
					if (Element.isElement(child)) {
						if (child.type !== 'macroslot') {
							// Although this cannot happened if our editor constraints well
							Transforms.delete(editor, { at: childPath });
							return;
						}
						if (child.index != nextIndex) {
							// Insert lacked nodes
							Transforms.insertNodes(editor, {
								type: "macroslot",
								index: nextIndex,
								children: [
									{ text: "" }
								]
							}, { at: childPath });
							return;
						} else {
							nextIndex++;
						}
					}
				}
			} else if (node.type === 'macroslot') {
				const [parentNode, parentPath] = Editor.parent(editor, path);
				if (parentNode.type !== 'macro') {
					// A nude slot should be unwrapped
					// This helps us to implement macro unwrap
					Transforms.unwrapNodes(editor, { at: path });
					return;
				}
			}
		}
		normalizeNode(entry);
	};

	editor.insertData = (data) => {
		// Never paste fragments to ensure the structures
		const text = data.getData('text/plain');
		insertText(text);
	}

	return editor;
};

// https://github.com/ianstormtaylor/slate/issues/419#issuecomment-590135015
// This prevents multiple paragraphs.
function withSingleLine(editor) {
	const { normalizeNode } = editor;

	editor.normalizeNode = ([node, path]) => {
		if (path.length === 0) {
			if (editor.children.length > 1) {
				Transforms.mergeNodes(editor);
			}
		}
		return normalizeNode([node, path]);
	};

	return editor;
}

export function createEditor(){
	return withMacro(withSingleLine(withHistory(withReact(create()))));
}

export const insertMacro = (editor, macroNameInSlate) => {
	const { selection } = editor;
	const isCollapsed = selection && Range.isCollapsed(selection);
	const macroInfo = macros.get(macroNameInSlate);
	let element = {
		type: 'macro',
		macroName: macroNameInSlate,
		children: [
			{ text: "" },
			...[...Array(macroInfo.childrenNumber).keys()].map(index => {
				return {
					type: "macroslot",
					index,
					children: [
						{ text: "" }
					]
				};
			}),
			{ text: "" }
		]
	};
	if (selection && !isCollapsed && macroInfo.childrenNumber > 0) {
		element.children[1].children[0].text = Editor.string(editor, selection);
	}
	Transforms.insertNodes(editor, element);
	Transforms.collapse(editor, { edge: 'end' })
	// Now if the cursor is in the un-editable part
	if (editor.selection) {
		const [node, path] = Editor.node(editor, editor.selection);
		console.assert(Text.isText(node), "Not a text");
		if (editor.selection.anchor.path.length % 2 === 1) {
			const [parent, parentPath] = Editor.parent(editor, path);
			if (Element.isElement(parent) && parent.type === 'macro') {
				// Change the cursor
				Transforms.select(editor, Editor.after(editor, parentPath));
			}
		}
	}
};

export const slateToComponents = (value, outmost = true) => {
	if (outmost) {
		return slateToComponents(value[0].children, false);
	}
	const result = value.map(node => {
		if (Text.isText(node)) {
			return node.text;
		} else if (Element.isElement(node) && node.type === 'macro') {
			const macroNameInSlate = node.macroName;
			if (!macros.has(macroNameInSlate)) {
				return '';
			}
			const info = macros.get(macroNameInSlate);
			const macroName = info.macroName;
			return {
				identifier: macroName,
				children: node.children
					.filter(child => Element.isElement(child) && child.type === 'macroslot')
					.map(slot => {
						return slateToComponents(slot.children, false);
					})
			}
		}
	});
	return result.filter(child => child !== '');
};

export const componentsToSlate = (components, outmost = true) => {
	if (outmost) {
		return [
			{
				type: "paragraph",
				children: componentsToSlate(components, false)
			}
		];
	}
	// We don't do complex normalization here: it is the responsibility to the normalizer
	const result = components.map(component => {
		if (typeof component === 'string') {
			return { text: component };
		}
		const macroName = component.identifier;
		const numberOfSlots = component.children.length;
		// Find name in slate
		const macroNameInSlate = macrosReverse.get(macroName)?.get(numberOfSlots);
		if (macroNameInSlate !== undefined) {
			return {
				type: "macro",
				macroName: macroNameInSlate,
				children: component.children.map((child, index) => {
					return {
						type: "macroslot",
						index,
						children: componentsToSlate(child, false)
					}
				})
			}
		} else {
			// Unknown macro
			return { text: "Unknown macro" };
		}
	});
	if(result.length === 0){
		// Although we say we don't do complex normalization, this is needed
		// WHY? Shouldn't this done by normalization?
		return [{ text: "" }];
	}
	return result;
};
