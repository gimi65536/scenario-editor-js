import { useState, useMemo, Fragment, useCallback } from "react";
import { DataGrid, useGridApiContext, useGridApiRef } from "@mui/x-data-grid";
import { Element } from "slate";
import SentenceEditor from '@/components/sentence-editor';
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
	return (<p>{renderComponents(convertTo(params.value, 'components'))}</p>);
}

function renderComponents(components) {
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
	if (identifier === 'ruby'){
		return <span><ruby>{children[0]}<rp> (</rp><rt>{children[1]}</rt><rp> )</rp></ruby></span>;
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

const columns = [
	{
		field: 'speaker',
		headerName: 'Speaker',
	},
	{
		field: 'components',
		headerName: 'Text',
		editable: true,
		flex: true,
		renderCell: renderText,
		renderEditCell: renderTextEditor
	}
];

export default function DialogueEditor({scenario, dispatch}) {
	const [selectedId, setSelectedId] = useState(null);
	const apiRef = useGridApiRef();

	// This could be a performance neck
	const rows = useMemo(() => scenario.dialogues.order.map(uuid => {
		return { id: uuid, ...scenario.dialogues.reference[uuid] }
	}), [scenario]);

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