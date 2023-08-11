import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Editor, Transforms, Range } from "slate";
import { Slate, Editable, ReactEditor } from "slate-react";
import {
	Button,
	Stack
} from "@mui/material";
import { isKeyHotkey } from 'is-hotkey';
import { createEditor, insertMacro, slateToComponents, componentsToSlate } from '@/lib/slate-dialogue';
import { slateMacros as macros } from '@/lib/macro';

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

const TextEditor = ({ element, onChange, test }) => {
	const editor = useMemo(() => createEditor(), []);

	// Normalize the initial element
	// https://github.com/ianstormtaylor/slate/issues/3465#issuecomment-1055413090
	const value = useMemo(() => {
		editor.children = element;
		Editor.normalize(editor, { force: true });
		return editor.children;
	}, [editor, element]);

	if (test) {
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

	// 10px padding follows the grid cell style
	return (
		<Stack direction="column" alignItems="start" style={{ padding: "0 10px" }}>
			<div>
				{Array.from(macros).map(([macroNameInSlate, spec]) => {
					return <Button key={macroNameInSlate} onClick={() => insertMacro(editor, macroNameInSlate)}>{spec.displayName}</Button>;
				})}
			</div>
			<Slate editor={editor} value={value} onChange={onChange}>
				<Editable renderElement={renderElement} renderLeaf={renderLeaf} onKeyDown={onKeyDown} />
				{testNode}
			</Slate>
		</Stack>
	);
};

export default function SentenceEditor({ element, onChange }) {
	return <TextEditor element={element} onChange={onChange} />;
}

export function TestEditor({ components }) {
	const [element, setElement] = useState(componentsToSlate(components !== undefined ? components : testComponents));
	if (components === undefined) {
		return <TextEditor element={element} onChange={setElement} test />;
	} else {
		return <TextEditor components={element} onChange={setElement} test />;
	}
}
