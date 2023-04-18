import React, { useMemo, useState, useCallback } from "react";
import { createEditor, Editor, Transforms, Range } from "slate";
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

const TextEditor = () => {
	const editor = useMemo(() => withReact(createEditor()), []);

	const [value, setValue] = useState([
		{
			type: "paragraph",
			children: [{ text: "123" }],
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
				return <span {...attributes} style={{ padding: "2px 6px" }}><InlineChromiumBugfix />{children}<InlineChromiumBugfix /></span>;
			case "blockquote":
				return <blockquote {...attributes}>{children}</blockquote>;
			case "list-item":
				return <li {...attributes}>{children}</li>;
			case "bulleted-list":
				return <ul {...attributes}>{children}</ul>;
			case "numbered-list":
				return <ol {...attributes}>{children}</ol>;
			default:
				return <span {...attributes}>{children}</span>;
		}
	}, []);

	return (
		<Slate editor={editor} value={value} onChange={(newValue) => setValue(newValue)}>
			<div>
				<Button onClick={() => insertBlock("paragraph")}>Add Paragraph</Button>
				<Button onClick={() => insertBlock("blockquote")}>Add Quote</Button>
				<Button onClick={() => insertBlock("list-item")}>Add List Item</Button>
				<Button onClick={() => insertBlock("bulleted-list")}>Add Bullet List</Button>
				<Button onClick={() => insertBlock("numbered-list")}>Add Numbered List</Button>
				<Button onClick={() => console.log(editor)}>Inspect</Button>
			</div>
			<Editable renderElement={renderElement} />
		</Slate>
	);
};

export default TextEditor;
