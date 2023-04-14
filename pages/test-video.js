import { useState } from 'react';
import { Button } from '@mui/material';

export default function VideoPreview(){
	const [videoUrl, setVideoUrl] = useState(null);
	const [mime, setMime] = useState(null);

	function handleFileChange(e){
		const file = e.target.files[0];
		if (file === undefined || !file.type.match('video')){
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const url = e.target.result;
			if(url === videoUrl){
				return;
			}
			setVideoUrl(url);
			setMime(file.type);
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
			{videoUrl ?
				<video controls src={videoUrl} >
					<source src={videoUrl} type={mime} />
				</video>
				: ""}
		</>
	);
}