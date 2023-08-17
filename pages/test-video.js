import { useState, useCallback, useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { Box, Button, CircularProgress, Dialog } from '@mui/material';
import VideoComponent from '@/lib/video-js';
import { createScheduler, createWorker } from "tesseract.js";
import { ReactCrop } from "react-image-crop";

export default function VideoPreview(){
	const DISABLE_OCR = false; // OCR is erroneous now, so disabled by default
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
	const [cropping, setCropping] = useState(false);
	const [fullImage, setFullImage] = useState("");
	const videoRef = useRef(null);
	const schedulerRef = useRef(null);
	const textareaRef = useRef(null);
	const canvasRef = useRef(null);

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

	const handleOpenDialog = useCallback(() => {
		// Make image
		const c = canvasRef.current;
		const d = videoRef.current.currentDimensions();
		c.width = d.width;
		c.height = d.height;
		c.getContext('2d').drawImage(videoRef.current.children()[0], 0, 0, d.width, d.height);
		setFullImage(c.toDataURL())
		setCropping(true);
		c.getContext('2d').clearRect(0, 0, d.width, d.height);
	}, []);

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
					(option.sources[0].src ?
						<Button variant="outlined" sx={{ mx: 2 }} onClick={handleOpenDialog} disabled={DISABLE_OCR}>
							OCR{DISABLE_OCR ? "（目前尚未實裝）" : ""}
						</Button>
					: "")
				}
				<textarea style={{ width: "100%", height: "50vh" }} ref={textareaRef} />
			</Box>
			<CropDialog
				openSignal={cropping}
				imageData={fullImage}
				saveCapture={handleCapture}
				onClose={() => setCropping(false)}
			/>
			<canvas ref={canvasRef} hidden />
		</Box>
	);
}

function CropDialog({openSignal, onClose, saveCapture, imageData}){
	const [open, setOpen] = useState(false);
	const [crop, setCrop] = useState();
	const imgRef = useRef(null);
	const canvasRef = useRef(null);

	const handleCapture = useCallback((crop) => {
		if(crop?.width && crop.height){
			const c = canvasRef.current;
			const ctx = c.getContext('2d');
			const pixelRatio = window.devicePixelRatio;
			const image = imgRef.current;
			c.width = Math.floor(crop.width * pixelRatio);
			c.height = Math.floor(crop.height * pixelRatio);
			ctx.scale(pixelRatio, pixelRatio);

			ctx.save();
			ctx.translate(-crop.x, -crop.y);
			ctx.drawImage(
				image,
				0,
				0,
				image.naturalWidth,
				image.naturalHeight,
				0,
				0,
				image.naturalWidth,
				image.naturalHeight,
			);
			ctx.restore();

			saveCapture(c.toDataURL());

			//...
			onClose();
		}
	}, [onClose, saveCapture]);

	if(!open && openSignal){
		if(!imageData){
			return;
		}
		// Initialize
		setOpen(true);
		setCrop(undefined);
	}else if(open && !openSignal){
		setOpen(false);
	}

	return (<Dialog open={open} onClose={onClose} maxWidth="lg">
		<ReactCrop
			crop={crop}
			onChange={(c, percentCrop) => setCrop(percentCrop)} // set percentage to prevent overflow
			onComplete={handleCapture}
		>
			<img
				alt="Crop"
				src={imageData}
				ref={imgRef}
			/>
		</ReactCrop>
		<canvas ref={canvasRef} hidden />
	</Dialog>);
}