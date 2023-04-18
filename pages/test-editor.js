import React, { useMemo, useState, useCallback } from "react";
import { createEditor, Editor, Transforms, Range, Text, Element, Node } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import {
	Button
} from "@mui/material";

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
			if (node.type === 'macro'){
				for (const [child, childPath] of Node.children(editor, path)) {
					if (Text.isText(child) && child.text.length > 0) {
						// Every text child in macro should be empty
						// This ensures the text nodes in macro could not be editable (back-end control)
						Transforms.delete(editor, { at: childPath });
						return;
					}
					// TODO Normalize slot number to prevent accidently removal
				}
			}
		}
		normalizeNode(entry);
	};

	return editor;
};

// https://github.com/ianstormtaylor/slate/issues/419#issuecomment-590135015
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
	if(editor.selection){
		wrapMacro(editor, macroName);
	}
};

const wrapMacro = (editor, macroName) => {
	if(isMacroActive(editor, macroName)){
		unwrapMacro(editor, macroName);
	}
	//
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
	const editor = useMemo(() => withMacro(withSingleLine(withReact(createEditor()))), []);

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
				return <span {...attributes}
					style={{padding: "0 6px", backgroundColor: "grey"}}
				>
					<span contentEditable={false}>{macros.get(element.macroName).displayName}</span>
					<InlineChromiumBugfix />{children}<InlineChromiumBugfix />
				</span>;
				// TODO Add button to delete a macro
			case "macroslot":
				return <span {...attributes}
					style={{margin: "0 3px"}}
				>
					<InlineChromiumBugfix />{children}<InlineChromiumBugfix />
				</span>;
			default:
				return <span {...attributes}>{children}</span>;
		}
	}, []);

	const renderLeaf = useCallback(({ attributes, children, leaf }) => {
		// This ensures the text nodes in macro could not be editable (front-end control)
		if (children.props.parent.type !== 'macro'){
			// Normal
			return <span {...attributes}>{children}</span>;
		}else{
			return <span {...attributes} contentEditable={false} >{children}</span>;
		}
	}, []);

	return (
		<Slate editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
			<div>
				{Array.from(macros).map(([macroName, spec]) => {
					return <Button key={macroName}>{spec.displayName}</Button>;
				})}
			</div>
			<div>
				<Button onClick={() => console.log(editor)}>Inspect</Button>
				<Button onClick={() => editor.selection && console.log(Editor.parent(editor, editor.selection))}>Inspect Node</Button>
			</div>
			<Editable renderElement={renderElement} renderLeaf={renderLeaf} />
		</Slate>
	);
};

export default TextEditor;
