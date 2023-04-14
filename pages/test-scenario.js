import {Button} from '@mui/material';
import {useState} from 'react';
import { processObject2Scenario } from '@/lib/scenario';

export default function TestScenario(){
	const [scenario, setScenario] = useState(null);

	function handleFileChange(e){
		const file = e.target.files[0];
		e.target.value = '';
		if (file === undefined) {
			return;
		}
		console.log(file);
		const reader = new FileReader();
		reader.onload = async (e) => {
			const json = JSON.parse(e.target.result);
			// Do sanitization here...
			console.log(json);
			const result = await processObject2Scenario(json);
			setScenario(result);
		};
		reader.readAsText(file);
	}

	function handleDownload(){
		const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(scenario))}`;
		const link = document.createElement('a');
		link.href = jsonString;
		link.download = `${scenario.title}.json`;
		link.click();
	}

	return (
		<>
			<Button variant="contained" component="label">
				Upload
				<input
					hidden
					accept="application/json"
					type="file"
					onChange={handleFileChange}
				/>
			</Button>
			<textarea defaultValue={scenario && JSON.stringify(scenario)} />
			{scenario ?
				<Button
					variant="contained"
					onClick={handleDownload}
				>
					Download
				</Button>
			: ""}
		</>
	);
}