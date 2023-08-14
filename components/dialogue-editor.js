import { useState, useMemo, Fragment, useCallback } from "react";
import { DataGrid, GridActionsCellItem, useGridApiContext, useGridApiRef } from "@mui/x-data-grid";
import { ArrowUpward, ArrowDownward, Add, Delete, Merge } from "@mui/icons-material";
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	DialogContentText,
	TextField,
	FormControl,
	FormLabel,
	FormHelperText,
	FormGroup,
	FormControlLabel,
	Checkbox
} from "@mui/material";
import { Element } from "slate";
import SentenceEditor from '@/components/sentence-editor';
import { renderMacro } from '@/lib/macro';
import { componentsToSlate, slateToComponents } from '@/lib/slate-dialogue';
import { Set as ImmutableSet, OrderedMap } from "immutable";

/**
 * @typedef {import('@/lib/scenario').Scenario} Scenario
 */

function convertTo(components_or_element, to) {
	if (components_or_element.length > 0 && Element.isElement(components_or_element[0])) {
		// Slate element
		if (to === 'element') {
			return components_or_element;
		} else if (to === 'components') {
			return slateToComponents(components_or_element);
		}
	} else {
		// Components
		if (to === 'element') {
			return componentsToSlate(components_or_element);
		} else if (to === 'components') {
			return components_or_element;
		}
	}
	throw "Unknown conversion.";
}

function renderText(params) {
	return (<p style={{width: "100%"}}>{renderComponents(convertTo(params.value, 'components'))}</p>);
}

function renderComponents(components) {
	if(components.length === 0){
		return String.fromCodePoint(160);
	}

	return components.map((component, i) => {
		if (typeof component === 'string') {
			return <span key={i}>{component}</span>
		} else {
			return <Macro key={i} {...component} />
		}
	});
}

function renderTextEditor(params) {
	return <TextEditor {...params} />;
}

function TextEditor(props) {
	// This is a wrapper
	const { id, value, field } = props;
	const apiRef = useGridApiContext();
	const slateElement = useMemo(() => convertTo(value, 'element'), [value]);
	const onChange = useCallback((newValue) => {
		apiRef.current.setEditCellValue({ id, field, value: newValue });
	}, [apiRef, id, field]);

	return <SentenceEditor element={slateElement} onChange={onChange} />;
}

function Macro({ identifier, children }) {
	// Special Cases
	if (renderMacro.has(identifier)){
		const f = renderMacro.get(identifier);
		const node = f(children, renderComponents);
		if(node !== null){
			return node;
		}
	}
	// General Cases
	if (children.length === 0) {
		return <span>({identifier})</span>;
	}
	return (
		<span>(
			{identifier}/{
				children
					.map((child, i) => <Fragment key={i}>{renderComponents(child)}</Fragment>)
					.reduce((prev, curr) => [].concat(prev, '/', curr))
			}
			)</span>
	);
}

/**
 * The scenario should be in AM1 normalization.
 * @param {Object} param
 * @param {Scenario} param.scenario
 */
export default function DialogueEditor({scenario, dispatch}) {
	const [selectedId, setSelectedId] = useState(/** @type {?String} */(null));
	const [selectedIdsEditSpeaker, setSelectedIdsEditSpeaker] =
		useState(/** @type {ImmutableSet<String>} */(ImmutableSet()));
	const apiRef = useGridApiRef();

	// This could be a performance neck
	const rows = useMemo(() => scenario.dialogues.order.map((uuid, index) => {
		return {
			index: index,
			lineno: index + 1,
			id: uuid,
			...scenario.dialogues.reference[uuid],
		}
	}), [scenario]);

	const columns = useMemo(() => [
		{
			field: 'lineno',
			headerName: '#',
			filterable: false,
		},
		{
			field: 'speaker',
			headerName: 'Speaker',
			editable: true,
		},
		{
			field: 'components',
			headerName: 'Text',
			editable: true,
			flex: 1,
			renderCell: renderText,
			renderEditCell: renderTextEditor
		},
		{
			field: 'action',
			headerName: 'Action',
			type: 'actions',
			flex: 0.5,
			getActions: (params) => [
				<GridActionsCellItem key={params.row.id}
					icon={<ArrowUpward />}
					label="向上"
					onClick={() => dispatch({
						type: 'moveon_dialogue',
						index: params.row.index
					})}
				/>,
				<GridActionsCellItem key={params.row.id}
					icon={<ArrowDownward />}
					label="向下"
					onClick={() => dispatch({
						type: 'movedown_dialogue',
						index: params.row.index
					})}
				/>,
				<GridActionsCellItem key={params.row.id}
					icon={<Add />}
					label="向下新增"
					onClick={() => dispatch({
						type: 'add_dialogue_below',
						index: params.row.index
					})}
				/>,
				<GridActionsCellItem key={params.row.id}
					icon={<Merge />}
					label="向上合併"
					onClick={() => dispatch({
						type: 'merge_to_above',
						index: params.row.index
					})}
				/>,
				<GridActionsCellItem key={params.row.id}
					icon={<Delete />}
					label="刪除"
					onClick={() => dispatch({
						type: 'delete_dialogue',
						index: params.row.index
					})}
				/>,
			]
		}
	], [dispatch])

	const handleEditStart = (params, e) => {
		// Only call dialog when editing the text field
		if (params.field === 'components') {
			setSelectedId(params.row.id);
		}else if(params.field === 'speaker'){
			// Do not use the default editing system
			e.defaultMuiPrevented = true;
			// Open dialog
			setSelectedIdsEditSpeaker(selectedIdsEditSpeaker.add(params.row.id));
		}
	};

	const handleEditStop = useCallback((params, e) => {
		if (params.field === 'components') {
			const newRow = apiRef.current.getRowWithUpdatedValues(selectedId, 'components');
			dispatch({
				type: 'edit_dialogue',
				uuid: selectedId,
				components: convertTo(newRow.components, 'components')
			});
			setSelectedId(null);
		}
	}, [dispatch, selectedId, apiRef]);

	return (
		<>
			<DataGrid
				rows={rows}
				columns={columns}
				onCellEditStart={handleEditStart}
				onCellEditStop={handleEditStop}
				getRowHeight={() => 'auto'}
				apiRef={apiRef}
			/>
			<SpeakerDialog
				scenario={scenario}
				dispatch={dispatch}
				selected={selectedIdsEditSpeaker}
				onClose={() => setSelectedIdsEditSpeaker(selectedIdsEditSpeaker.clear())}
			/>
		</>
	);
}

/**
 * @param {Object} param
 * @param {Scenario} param.scenario
 * @param {ImmutableSet<String>} param.selected
 */
function SpeakerDialog({scenario, dispatch, selected: chosen, onClose}){
	const [open, setOpen] = useState(false);
	const [displayName, setDisplayName] = useState("");
	const [chosenSpeaker, setChosenSpeaker] =
		useState(/** @type {OrderedMap<String, Boolean>} */(OrderedMap()));

	// Useful when multiple
	const [displayNameModified, setDisplayNameModified] = useState(false);
	const [chosenSpeakerModified, setChosenSpeakerModified] = useState(false);

	if(!open && !chosen.isEmpty()){
		// Initialize
		setOpen(true);
		setDisplayNameModified(false);
		setChosenSpeakerModified(false);

		const displaySet = chosen.map(uuid => scenario.dialogues.reference[uuid].speaker ?? "");
		if(displaySet.size > 1){
			// Inconsistent
			setDisplayName("");
		}else{
			setDisplayName(displaySet.first());
		}

		const chosenSpeakerListSet = chosen.map(uuid => ImmutableSet(scenario.dialogues.reference[uuid].speakers_list));
		const chosenSpeakerMap = (/** @type {OrderedMap<String, Boolean>} */(OrderedMap())).withMutations(map => {
			for (const cuuid of scenario.characters.order) {
				map = map.set(cuuid, false)
			}
			if (chosenSpeakerListSet.size > 1) {
				// Inconsistent
			} else {
				/** @type {ImmutableSet<String>} */
				const chosenSpeakerList = chosenSpeakerListSet.first();
				for (const cuuid of chosenSpeakerList){
					map = map.set(cuuid, true);
				}
			}
		});
		setChosenSpeaker(chosenSpeakerMap);
	}else if(open && chosen.isEmpty()){
		setOpen(false);
	}

	const handleClose = () => {
		// ...
		onClose();
	};

	return (<Dialog
		open={open}
		onClose={handleClose} // Automatically apply (more user-friendly)
	>
		<DialogTitle>更改說話者</DialogTitle>
		<DialogContent sx={{display: "flex", flexDirection: "column"}}>
			<DialogContentText>編輯說話者的顯示名稱，與實際參與這句台詞的角色</DialogContentText>
			<TextField
				label="顯示說話者"
				helperText="在台詞冒號前方顯示的名稱"
				value={displayName}
				onChange={e => {
					setDisplayName(e.target.value);
					setDisplayNameModified(true);
				}}
				sx={{ m: 2 }}
			/>
			<FormControl sx={{ m: 2 }} component="fieldset" variant="standard">
				<FormLabel>選擇說話者</FormLabel>
				<FormHelperText>用來Highlight角色有哪些台詞</FormHelperText>
				<FormGroup>
					{chosenSpeaker.entrySeq().map(([cuuid, chosen]) => <FormControlLabel
						key={cuuid}
						label={scenario.characters.reference[cuuid].name}
						control={
							<Checkbox checked={chosen} onChange={(e) => {
								setChosenSpeaker(chosenSpeaker.set(cuuid, e.target.checked));
								setChosenSpeakerModified(true);
							}} />
						}
					/>)}
				</FormGroup>
			</FormControl>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>取消</Button>
			<Button onClick={handleClose}>確定</Button>
		</DialogActions>
	</Dialog>);
}