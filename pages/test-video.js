import { useState } from 'react';
import { useImmer } from "use-immer";
import { Button } from '@mui/material';
import VideoComponent from '@/lib/video-js';

export default function VideoPreview(){
	const [option, updateUption] = useImmer({
		autoplay: false,
		controls: true,
		responsive: true,
		fluid: true,
		sources: [{
			src: undefined,
			type: undefined
		}]
	});

	function handleFileChange(e){
		const file = e.target.files[0];
		if (file === undefined || !file.type.match('video')){
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const url = e.target.result;
			if(url === option.sources[0].src){
				return;
			}
			updateUption(draft => {
				draft.sources[0].src = url;
				draft.sources[0].type = file.type;
			});
			console.log(file.size);
		};
		reader.readAsDataURL(file);
	}

	return (
		<>
			<Button variant="contained" component="label">
				Upload
				<input
					hidden
					accept="video/*"
					type="file"
					onChange={handleFileChange}
				/>
			</Button>
			{option.sources[0].src ? <VideoComponent option={option} /> : ""}
		</>
	);
}