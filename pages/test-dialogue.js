import { useState, useMemo, useRef, Fragment, useCallback, useEffect } from "react";
import {useImmerReducer} from 'use-immer';
import { DataGrid } from "@mui/x-data-grid";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
} from "@mui/material";
import {
	parseDialogue,
	componentsToText
} from '@/lib/scenario';
import Editor from '@/components/dialogue-editor';
import { componentsToSlate, slateToComponents } from '@/lib/slate-dialogue';
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';

function reducer(draft, action){
	if(action.type === 'edit_dialogue'){
		const uuid = action.uuid;
		const newComponents = action.components;
		draft.dialogues.reference[uuid].components = newComponents;
	}
}

function RenderText(props){
	return (<p>{render(props.row.components)}</p>);
}

function render(components){
	return components.map((component, i) => {
		if(typeof component === 'string'){
			return <span key={i}>{component}</span>
		}else{
			return <Macro key={i} {...component} />
		}
	});
}

function Macro({identifier, children}){
	if(children.length === 0){
		return <span>({identifier})</span>;
	}
	return (
		<span>(
			{identifier}/{
				children
				.map((child, i) => <Fragment key={i}>{render(child)}</Fragment>)
				.reduce((prev, curr) => [].concat(prev, '/', curr))
			}
		)</span>
	);
}

const columns = [
	{
		field: 'speaker',
		headerName: 'Speaker',
	},
	{
		field: 'text',
		headerName: 'Text',
		editable: true,
		flex: true,
		renderCell: RenderText
	}
];

export default function DialogueEditor(){
	const [scenario, dispatch] = useImmerReducer(reducer, json);
	const [selectedId, setSelectedId] = useState(null);
	const [slateElement, setSlateElement] = useState(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);

	const textareaRef = useRef(null);
	useEffect(() => {
		if(scenario){
			textareaRef.current.value = JSON.stringify(scenario);
		}
	});

	// This could be a performance neck
	const rows = useMemo(() => scenario.dialogues.order.map(uuid => {
		return {id: uuid, ...scenario.dialogues.reference[uuid]}
	}), [scenario]);

	const handleEditStart = (params, e) => {
		// Only call dialog when editing the text field
		if (params.field == 'text') {
			// To override the default behavior and let the dialog control the edit
			e.defaultMuiPrevented = true;
			setSelectedId(params.row.id);
			const element = componentsToSlate(params.row.components)
			setSlateElement(element);
			setEditDialogOpen(true);
		}
	};

	const handleEditDialogClose = useCallback(() => {
		setEditDialogOpen(false);
		setSelectedId(null);
		setSlateElement(null);
	}, []);

	const handleSave = useCallback(() => {
		dispatch({
			type: 'edit_dialogue',
			uuid: selectedId,
			components: slateToComponents(slateElement)
		});
		handleEditDialogClose();
	}, [dispatch, selectedId, slateElement, handleEditDialogClose]);

	const handleChange = useCallback((newValue) => {
		setSlateElement(newValue);
	}, []);

	return (
		<div style={{ height: 800, width: "100%" }}>
			<DataGrid
				rows={rows}
				columns={columns}
				onCellEditStart={handleEditStart}
				getRowHeight={() => 'auto'}
			/>
			<textarea style={{ width: "100%", height: "50%" }} ref={textareaRef} />
			<EditDialog
				open={editDialogOpen}
				onClose={handleEditDialogClose}
				onSave={handleSave}
				onChange={handleChange}
				element={slateElement}
			/>
		</div>
	);
}

const EditDialog = ({ open, onClose, onSave, onChange, element }) => {
	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>編輯台詞</DialogTitle>
			<DialogContent>
				{open ? <Editor element={element} onChange={onChange} /> : ""}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={onSave}>Save</Button>
			</DialogActions>
		</Dialog>
	);
};