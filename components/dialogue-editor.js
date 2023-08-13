import { useState, useMemo, Fragment, useCallback } from "react";
import { DataGrid, GridActionsCellItem, useGridApiContext, useGridApiRef } from "@mui/x-data-grid";
import { ArrowUpward, ArrowDownward, Add, Delete, Merge } from "@mui/icons-material";
import { Element } from "slate";
import SentenceEditor from '@/components/sentence-editor';
import { renderMacro } from '@/lib/macro';
import { componentsToSlate, slateToComponents } from '@/lib/slate-dialogue';

function convertTo(components_or_element, to) {
	if (components_or_element.length === 0) {
		return components_or_element;
	}
	if (Element.isElement(components_or_element[0])) {
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

export default function DialogueEditor({scenario, dispatch}) {
	// Although the scenario allows a dialogue to have more than 1 instance,
	// we don't do that to make things easier.
	const [selectedId, setSelectedId] = useState(null);
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
		<DataGrid
			rows={rows}
			columns={columns}
			onCellEditStart={handleEditStart}
			onCellEditStop={handleEditStop}
			getRowHeight={() => 'auto'}
			apiRef={apiRef}
		/>
	);
}