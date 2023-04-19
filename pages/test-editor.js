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
		style={{fontSize: 0}}
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
])

const controls = new Map([
	[
		"delete", {
			displayName: "刪除"
		}
	],
]);

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
		element.type === 'macro' || element.type === 'macroslot' || element.type === 'control_button' || isInline(element);

	editor.isSelectable = (element) => {
		if(element.type === 'control_button'){
			return false;
		}
		return isSelectable(element);
	};

	editor.isElementReadOnly = (element) => element.type === 'control_button' || isElementReadOnly(element);

	editor.normalizeNode = (entry) => {
		const [node, path] = entry;

		if (Element.isElement(node)) {
			if (node.type === 'macro'){
				const macroName = node.macroName;
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
					if(Element.isElement(child)){
						if(child.type !== 'macroslot'){
							// Although this cannot happened if our editor constraints well
							Transforms.delete(editor, { at: childPath });
							return;
						}
						if(child.index != nextIndex){
							// Insert lacked nodes
							Transforms.insertNodes(editor, {
								type: "macroslot",
								index: nextIndex,
								children: [
									{ text: "" }
								]
							}, { at: childPath });
							return;
						}else{
							nextIndex++;
						}
					}
				}
			}else if(node.type === 'macroslot'){
				const [parentNode, parentPath] = Editor.parent(editor, path);
				if(parentNode.type !== 'macro'){
					// A nude slot should be unwrapped
					// This helps us to implement macro unwrap
					Transforms.unwrapNodes(editor, { at: path });
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

const insertMacro = (editor, macroName) => {
	/*if(editor.selection){
		wrapMacro(editor, macroName);
	}*/
	wrapMacro(editor, macroName);
};

const wrapMacro = (editor, macroName) => {
	/*if(isMacroActive(editor, macroName)){
		unwrapMacro(editor, macroName);
	}*/
	//
	const { selection } = editor;
	const isCollapsed = selection && Range.isCollapsed(selection);
	const macroInfo = macros.get(macroName);
	let element = {
		type: 'macro',
		macroName,
		children: [
			{ text: "" },
			...[...Array(macroInfo.childrenNumber).keys()].map(index => {return {
				type: "macroslot",
				index,
				children: [
					{ text: "" }
				]
			};
			}),
			{ text: "" },
			{
				type: "control_button",
				effect: "delete",
				children: [
					{ text: "刪除" }
				]
			}
		]
	};
	if (selection && !isCollapsed && macroInfo.childrenNumber > 0){
		element.children[1].children[0].text = Editor.string(editor, selection);
	}
	Transforms.insertNodes(editor, element);
	Transforms.collapse(editor, { edge: 'end' })
	// Now if the cursor is in the un-editable part
	if(editor.selection){
		const [node, path] = Editor.node(editor, editor.selection);
		console.assert(Text.isText(node), "Not a text");
		if (editor.selection.anchor.path.length % 2 === 1){
			const [parent, parentPath] = Editor.parent(editor, path);
			if(Element.isElement(parent) && parent.type === 'macro'){
				// Change the cursor
				Transforms.select(editor, Editor.after(editor, parentPath));
			}
		}
	}
};

const unwrapMacro = (editor, macroName) => {
	//
};

const isMacroActive = (editor, macroName) => {
	const [nodes] = Editor.nodes(editor, {
		match: n =>
			!Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'macro' && n.macroName === 'macroName',
	})
	return !!nodes
};

const TextEditor = () => {
	const editor = useMemo(() => withMacro(withSingleLine(withHistory(withReact(createEditor())))), []);

	const [value, setValue] = useState([
		{
			type: "paragraph",
			children: [
				{ text: "123" },
				{
					type: "macro",
					macroName: "separate_text",
					children: [
						{ text: "" },
						{
							type: "macroslot",
							index: 0,
							children: [
								{ text: "OP ユメヲカケル" }
							]
						},
						{ text: "" },
					]
				},
				{ text: "789" },
				{
					type: "macro",
					macroName: "ruby",
					children: [
						{ text: "" },
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
						{ text: "" },
					]
				},
				{ text: "012" },
				{
					type: "macro",
					macroName: "separate_text",
					children: [
						{ text: "" },
						{
							type: "macroslot",
							index: 0,
							children: [
								{ text: "OP ユメヲカケル" }
							]
						},
						{ text: "" },
					]
				},
				{ text: "345" },
			],
		},
	]);

	console.log(value);

	const insertBlock = useCallback((blockType) => {
		const { selection } = editor;
		const isCollapsed = selection && Range.isCollapsed(selection);

		const newBlock = {
			type: blockType,
			children: isCollapsed ? [{ text: "" }] : [],
		};

		if (isCollapsed) {
			Transforms.insertNodes(editor, newBlock)
		} else {
			Transforms.wrapNodes(editor, newBlock, { split: true })
			Transforms.collapse(editor, { edge: 'end' })
		}
	}, [editor]);

	const renderElement = useCallback(({ attributes, children, element }) => {
		switch (element.type) {
			case "paragraph":
				return <p {...attributes}>{children}</p>;
			case "macro":
				// Note that the onClick should get the path dynamically instead of evaluating here
				// const path = ReactEditor.findPath(editor, element); <<< It cannot handle changed path
				return <span {...attributes}
					style={{padding: "0 6px", backgroundColor: "grey", color: "white"}}
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
					style={{margin: "0 3px"}}
				>
					<InlineChromiumBugfix />{children}<InlineChromiumBugfix />
				</span>;
			default:
				return <span {...attributes}>{children}</span>;
		}
	}, [editor]);

	const renderLeaf = useCallback(({ attributes, children, leaf }) => {
		// This ensures the text nodes in macro could not be editable (front-end control)
		if (children.props.parent.type !== 'macro'){
			// Normal
			return <span {...attributes}>{children}</span>;
		}else{
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
				do{
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

	return (
		<Slate editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
			<div>
				{Array.from(macros).map(([macroName, spec]) => {
					return <Button key={macroName} onClick={() => insertMacro(editor, macroName)}>{spec.displayName}</Button>;
				})}
			</div>
			<div>
				<Button onClick={() => console.log(editor)}>Inspect</Button>
				<Button onClick={() => editor.selection && console.log(Editor.parent(editor, editor.selection))}>Inspect Node</Button>
			</div>
			<Editable renderElement={renderElement} renderLeaf={renderLeaf} onKeyDown={onKeyDown} />
		</Slate>
	);
};

export default TextEditor;
