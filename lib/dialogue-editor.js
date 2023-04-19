import React, { useMemo, useState, useCallback } from "react";
import { createEditor, Editor, Transforms, Range, Text, Element, Node } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from 'slate-history'
import {
	Button
} from "@mui/material";
import { isKeyHotkey } from 'is-hotkey';

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
const InlineChromiumBugfix = () => (
	<span
		contentEditable={false}
		style={{ fontSize: 0 }}
	>
		{String.fromCodePoint(160) /* Non-breaking space */}
	</span>
)

const macros = new Map([
	["separate_line", {
		macroName: "separate",
		displayName: "分隔線",
		childrenNumber: 0,
		canSub: []
	}],
	["separate_text", {
		macroName: "separate",
		displayName: "有字分隔線",
		childrenNumber: 1,
		canSub: [true]
	}],
	["ruby", {
		macroName: "ruby",
		displayName: "假名",
		childrenNumber: 2,
		canSub: [false, false]
	}],
]);

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

const insertMacro = (editor, macroNameInSlate) => {
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

const slateToComponents = (value, outmost = true) => {
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

const componentsToSlate = (components, outmost = true) => {
	if (outmost) {
		return [
			{
				type: "paragraph",
				children: componentsToSlate(components, false)
			}
		];
	}
	// We don't do normalization here: it is the responsibility to the normalizer
	return components.map(component => {
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
};

/*
const testSlate = [
	{
		type: "paragraph",
		children: [
			{ text: "123" },
			{
				type: "macro",
				macroName: "separate_text",
				children: [
					{
						type: "macroslot",
						index: 0,
						children: [
							{ text: "OP ユメヲカケル" }
						]
					},
				]
			},
			{ text: "789" },
			{
				type: "macro",
				macroName: "ruby",
				children: [
					{
						type: "macroslot",
						index: 0,
						children: [
							{ text: "私" }
						]
					},
					{
						type: "macroslot",
						index: 1,
						children: [
							{ text: "わたし" }
						]
					},
				]
			},
			{ text: "012" },
			{
				type: "macro",
				macroName: "separate_text",
				children: [
					{
						type: "macroslot",
						index: 0,
						children: [
							{ text: "OP ユメヲカケル" }
						]
					},
				]
			},
			{ text: "345" },
		],
	},
];
*/

const testComponents = [
	"123",
	{
		"identifier": "separate",
		"children": [
			["OP ユメヲカケル"]
		]
	},
	"789",
	{
		"identifier": "ruby",
		"children": [
			["私"],
			["わたし"]
		]
	},
	"012",
	{
		"identifier": "separate",
		"children": [
			["OP ユメヲカケル"]
		]
	},
	"345"
];

const TextEditor = ({components, test}) => {
	const editor = useMemo(() => withMacro(withSingleLine(withHistory(withReact(createEditor())))), []);

	const [value, setValue] = useState(componentsToSlate(components));

	if(test){
		console.log(value);
	}

	const renderElement = useCallback(({ attributes, children, element }) => {
		switch (element.type) {
			case "paragraph":
				return <p {...attributes}>{children}</p>;
			case "macro":
				// Note that the onClick should get the path dynamically instead of evaluating here
				// const path = ReactEditor.findPath(editor, element); <<< It cannot handle changed path
				return <span {...attributes}
					style={{ padding: "0 6px", backgroundColor: "grey", color: "white" }}
				>
					<span contentEditable={false}>({macros.get(element.macroName).displayName}</span>
					{children}
					<span contentEditable={false}>)</span>
					<button contentEditable={false} onClick={() => Transforms.removeNodes(editor, { at: ReactEditor.findPath(editor, element) })}>刪除</button>
					<button contentEditable={false} onClick={() => Transforms.unwrapNodes(editor, { at: ReactEditor.findPath(editor, element) })}>解除</button>
				</span>;
			// TODO Add button to delete a macro
			// But how to get path here?
			case "macroslot":
				return <span {...attributes}
					style={{ margin: "0 3px" }}
				>
					<InlineChromiumBugfix />{children}<InlineChromiumBugfix />
				</span>;
			default:
				return <span {...attributes}>{children}</span>;
		}
	}, [editor]);

	const renderLeaf = useCallback(({ attributes, children, leaf }) => {
		// This ensures the text nodes in macro could not be editable (front-end control)
		if (children.props.parent.type !== 'macro') {
			// Normal
			return <span {...attributes}>{children}</span>;
		} else {
			return <span {...attributes} contentEditable={false} >{children}</span>;
		}
	}, []);

	const onKeyDown = event => {
		const { selection } = editor;

		// Default left/right behavior is unit:'character'.
		// This fails to distinguish between two cursor positions, such as
		// <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
		// Here we modify the behavior to unit:'offset'.
		// This lets the user step into and out of the inline without stepping over characters.
		// You may wish to customize this further to only use unit:'offset' in specific cases.
		if (selection && Range.isCollapsed(selection)) {
			const { nativeEvent } = event
			if (isKeyHotkey('left', nativeEvent)) {
				event.preventDefault();
				do {
					Transforms.move(editor, { unit: 'offset', reverse: true });
				} while (Editor.parent(editor, editor.selection)[0].type === 'macro');
				return;
			}
			if (isKeyHotkey('right', nativeEvent)) {
				event.preventDefault();
				do {
					Transforms.move(editor, { unit: 'offset' });
				} while (Editor.parent(editor, editor.selection)[0].type === 'macro');
				return;
			}
		}
	}

	const testNode = test ? (
		<>
			<div>
				<Button onClick={() => console.log(editor)}>Inspect</Button>
				<Button onClick={() => editor.selection && console.log(Editor.parent(editor, editor.selection))}>Inspect Node</Button>
				<Button onClick={() => editor.selection && console.log(...Editor.levels(editor, { at: editor.selection, reverse: true }))}>Inspect Ancestors</Button>
			</div>
			<div>
				<pre style={{ whiteSpace: "pre-wrap" }}>
					{JSON.stringify(slateToComponents(value))}
				</pre>
			</div>
		</>
	) : "";

	return (
		<Slate editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
			<div>
				{Array.from(macros).map(([macroNameInSlate, spec]) => {
					return <Button key={macroNameInSlate} onClick={() => insertMacro(editor, macroNameInSlate)}>{spec.displayName}</Button>;
				})}
			</div>
			<Editable renderElement={renderElement} renderLeaf={renderLeaf} onKeyDown={onKeyDown} />
			{testNode}
		</Slate>
	);
};

export default function DialogueEditor({components}){
	return <TextEditor components={components} />;
}

export function TestEditor({components}){
	if(components === undefined){
		return <TextEditor components={testComponents} test />;
	}else{
		return <TextEditor components={components} test />;
	}
}
