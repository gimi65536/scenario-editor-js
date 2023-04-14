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
		</>
	);
}