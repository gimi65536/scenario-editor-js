import { useState, useCallback, useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { Box, Button, CircularProgress } from '@mui/material';
import VideoComponent from '@/lib/video-js';
import { createScheduler, createWorker } from "tesseract.js";
import { ScreenCapture } from "react-screen-capture";

export default function VideoPreview(){
	const DISABLE_OCR = true; // OCR is erroneous now, so disabled by default
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
	const [captured, setCaptured] = useState("");
	const videoRef = useRef(null);
	const schedulerRef = useRef(null);
	const textareaRef = useRef(null);

	// Initialize
	useEffect(() => {
		schedulerRef.current = createScheduler();
		const initScheduler = async () => {
			const worker = await createWorker({
				langPath: "https://github.com/tesseract-ocr/tessdata_best/raw/main"
			});
			await worker.loadLanguage('chi_tra');
			await worker.initialize('chi_tra');
			schedulerRef.current.addWorker(worker);
		};
		initScheduler();
	}, []);

	useEffect(() => {
		// Do some destroy...
	}, [])

	const doOCR = useCallback(async (imgUrl) => {
		let re = /^data:image\/([a-zA-Z]*);base64,([^"]*)$/;
		if(!imgUrl || !imgUrl.match(re)){
			setCaptured("");
			return;
		}
		const { data: { text } } = await schedulerRef.current.addJob('recognize', imgUrl);
		textareaRef.current.value += text + '\n\n';
		// ...
		setCaptured("");
	}, []);

	const handleCapture = useCallback((imgUrl) => {
		setCaptured(imgUrl);
		doOCR(imgUrl);
	}, [doOCR])

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
	}, [option.sources, updateOption]);

	return (
		<Box>
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
				{Boolean(captured) ?
					<Button variant="outlined" sx={{ mx: 2 }} disabled>
						<CircularProgress size="1em" sx={{ mr: 1 }} />
						OCR運行中
					</Button>
				:
					<ScreenCapture onEndCapture={handleCapture}>
						{({ onStartCapture }) => {
							if (option.sources[0].src){
								return <Button variant="outlined" sx={{ mx: 2 }} onClick={onStartCapture} disabled={DISABLE_OCR}>
									OCR{DISABLE_OCR ? "（目前尚未實裝）" : ""}
								</Button>;
							}else{
								return "";
							}
						}}
					</ScreenCapture>
				}
				<textarea style={{ width: "100%", height: "50vh" }} ref={textareaRef} />
			</Box>
		</Box>
	);
}