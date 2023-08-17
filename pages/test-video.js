import { useState, useCallback, useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { Box, Button, CircularProgress } from '@mui/material';
import VideoComponent from '@/lib/video-js';
import { createScheduler, createWorker } from "tesseract.js";

export default function VideoPreview({ ocrWorker = 4 }){
	const [option, updateOption] = useImmer({
		autoplay: false,
		controls: true,
		responsive: true,
		fluid: true,
		sources: [{
			src: undefined,
			type: undefined
		}]
	});
	const [timerId, setTimerId] = useState(null);
	const canvasRef = useRef(null);
	const videoRef = useRef(null);
	const schedulerRef = useRef(null);
	const textareaRef = useRef(null);

	// Initialize
	useEffect(() => {
		canvasRef.current.width = 0;
		canvasRef.current.height = 0;
		schedulerRef.current = createScheduler();
		const initScheduler = async () => {
			for (let i = 0; i < ocrWorker; i++){
				const worker = await createWorker({
					langPath: "https://github.com/tesseract-ocr/tessdata_best/raw/main"
				});
				await worker.loadLanguage('chi_tra+jpn+chi_sim');
				await worker.initialize('chi_tra+jpn+chi_sim');
				schedulerRef.current.addWorker(worker);
			}
		};
		initScheduler();
	}, [ocrWorker]);

	const stopTimer = useCallback(() => {
		if(timerId === null){
			return;
		}
		clearInterval(timerId);
		setTimerId(null);
		//canvasRef.current.width = 0;
		//canvasRef.current.height = 0;
	}, [timerId])

	useEffect(() => {
		// Auto remove timer when destroying
		return () => stopTimer;
	}, [stopTimer])

	const doOCR = useCallback(async () => {
		const c = canvasRef.current;
		const d = videoRef.current.currentDimensions();
		c.width = d.width;
		c.height = d.height;
		c.getContext('2d').drawImage(videoRef.current.children()[0], 0, 0, d.width, d.height);

		const {data: {text}} = await schedulerRef.current.addJob('recognize', c);
		textareaRef.current.value += text + '\n\n';
		// ...
	}, []);

	const toggleOCR = useCallback(() => {
		if(timerId === null){
			// Start OCR
			setTimerId(setInterval(doOCR, 1000));
		}else{
			stopTimer();
		}
	}, [doOCR, stopTimer, timerId]);

	const handleFileChange = useCallback((e) => {
		const file = e.target.files[0];
		if (file === undefined || !file.type.match('video')) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const url = e.target.result;
			if (url === option.sources[0].src) {
				return;
			}
			updateOption(draft => {
				draft.sources[0].src = url;
				draft.sources[0].type = file.type;
			});
			console.log(file.size);
		};
		reader.readAsDataURL(file);
		stopTimer()
	}, [option.sources, stopTimer, updateOption]);

	return (
		<>
			{option.sources[0].src ? <VideoComponent option={option} ref={videoRef} /> : ""}
			<Box>
				<Button variant="contained" component="label" sx={{ mx: 2 }}>
					Upload
					<input
						hidden
						accept="video/*"
						type="file"
						onChange={handleFileChange}
					/>
				</Button>
				{option.sources[0].src ?
					<Button variant="outlined" sx={{ mx: 2 }} onClick={toggleOCR}>
						{timerId === null ? "OCR關閉中" : (<>
							<CircularProgress size="1em" sx={{ mr: 1 }} />
							OCR運行中
						</>)}
					</Button>
				: ""}
				<textarea style={{ width: "100%", height: "50vh" }} ref={textareaRef} />
			</Box>
			<canvas ref={canvasRef} hidden />
		</>
	);
}