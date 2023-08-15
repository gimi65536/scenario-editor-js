import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@mui/material';
import { useCallback, useState } from 'react';
import DialogueEditor from "@/components/dialogue-editor";
import json from '@/test/NTUCCC 109SS VAD07-gimi65536 0.1.0.json';
import { processObject2Scenario, hydrateImmutable, dehydrateImmutable, normalizeImmutable, validate } from '@/lib/scenario';
import useUndoReducer from '@/lib/undo';
import reducer from "@/lib/reducer";
import { enableMapSet } from "immer";
enableMapSet();

export default function TestScenario(){
	const [scenario, isModified, undo, redo, update, setScenario, irreversibleSetScenario, setUnmodified, reset] = useUndoReducer(reducer, null);
	const [willLoadFile, setWillLoadFile] = useState('');

	const loadFile = useCallback((file) => {
		console.log(file);
		const reader = new FileReader();
		reader.onload = async (e) => {
			const json = JSON.parse(e.target.result);
			// Do sanitization here...
			console.log(json);
			const result = await processObject2Scenario(json);
			reset(hydrateImmutable(normalizeImmutable(validate(result), 1)));
		};
		reader.readAsText(file);
	}, [reset]);

	const handleFileChange = useCallback((e) => {
		const file = e.target.files[0];
		e.target.value = '';
		if (file === undefined) {
			return;
		}
		if(!isModified){
			loadFile(file);
		}else{
			// Alert
			setWillLoadFile(file);
		}
	}, [loadFile, isModified, setWillLoadFile]);

	return (
		<>
			<div style={{ height: 800 }}>
				{scenario ?
					<DialogueEditor
						scenario={scenario}
						dispatch={update}
					/>
					: ""
				}
				<div>
					<Button variant="contained" component="label">
						Upload
						<input
							hidden
							accept="application/json"
							type="file"
							onChange={handleFileChange}
						/>
					</Button>
					<Button variant="contained" component="label" onClick={() => {
						reset(hydrateImmutable(normalizeImmutable(validate(json), 1)));
					}}>
						Load Default
					</Button>
				</div>
				<textarea style={{ width: "100%", height: "50%" }} defaultValue={scenario && JSON.stringify(dehydrateImmutable(scenario))} />
				{scenario ?
					<Button
						variant="contained"
						component="a"
						href={`data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(scenario))}`}
						download={`${scenario.title}.json`}
					>
						Download
					</Button>
				: ""}
			</div>
			<LoadDialog
				file={willLoadFile}
				onConfirm={() => {
					loadFile(willLoadFile);
					setWillLoadFile('');
				}}
				onClose={() => {
					setWillLoadFile('');
				}}
			/>
		</>
	);
}

function LoadDialog({file, onConfirm, onClose}){
	return (<Dialog open={file !== ''} onClose={onClose}>
		<DialogTitle>確認是否讀取台本</DialogTitle>
		<DialogContent>
			<DialogContentText>還有變更尚未儲存！是否直接讀取？</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button onClick={onClose}>取消</Button>
			<Button onClick={onConfirm} color="warning">確定</Button>
		</DialogActions>
	</Dialog>);
}