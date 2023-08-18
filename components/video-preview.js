/* eslint-disable @next/next/no-img-element */
import { useState, useCallback, useRef, useEffect } from "react";
import { useImmer } from "use-immer";
import { Box, Button, CircularProgress, Dialog, Stack } from '@mui/material';
import VideoComponent from '@/lib/video-js';
import { PSM, createScheduler, createWorker } from "tesseract.js";
import { ReactCrop } from "react-image-crop";
import { useHotkeysContext } from 'react-hotkeys-hook';

import 'react-image-crop/dist/ReactCrop.css';

export default function VideoPreview({sx, enableOCR = false}){
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
	const [fullImage, setFullImage] = useState("");
	const videoRef = useRef(null); // The video-js element
	const schedulerRef = useRef(null);
	const textareaRef = useRef(null); // The OCR result output
	const canvasRef = useRef(null); // Used to render the video capture

	// Initialize
	useEffect(() => {
		schedulerRef.current = createScheduler();
		const initScheduler = async () => {
			const worker = await createWorker({
				langPath: "https://raw.githubusercontent.com/naptha/tessdata/gh-pages/4.0.0_best",
				//langPath: ".",
				//gzip: false,
			});
			await worker.loadLanguage('chi_tra');
			await worker.initialize('chi_tra');
			await worker.setParameters({
				tessedit_pageseg_mode: PSM.SINGLE_LINE
			});
			schedulerRef.current.addWorker(worker);
		};
		if (enableOCR){
			initScheduler();
		}
		
	}, [enableOCR]);

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
		textareaRef.current.value += text;
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
		if(!c.width || !c.height){
			return;
		}
		videoRef.current.pause();
		c.width = d.width;
		c.height = d.height;
		c.getContext('2d').drawImage(videoRef.current.children()[0], 0, 0, d.width, d.height);
		setFullImage(c.toDataURL())
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
		<Box sx={sx}>
			{option.sources[0].src ? <VideoComponent option={option} ref={videoRef} /> : ""}
			<Box>
				<Stack direction="row" justifyContent="center" sx={{ my: 2 }}>
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
							<Button variant="outlined" sx={{ mx: 2 }} onClick={handleOpenDialog} disabled={!enableOCR}>
								OCR{enableOCR ? "" : "（目前尚未實裝）"}
							</Button>
							: "")
					}
				</Stack>
				<textarea style={{ width: "100%", height: "50vh" }} ref={textareaRef} />
			</Box>
			<CropDialog
				imageData={fullImage}
				saveCapture={handleCapture}
				onClose={() => setFullImage("")}
			/>
			<canvas ref={canvasRef} hidden />
		</Box>
	);
}

function CropDialog({onClose, saveCapture, imageData}){
	const [open, setOpen] = useState(false);
	const [crop, setCrop] = useState();
	const imgRef = useRef(null); // Put the capture
	const canvasRef = useRef(null); // Used to render the cropped capture

	const { enableScope, disableScope } = useHotkeysContext();

	const handleCapture = useCallback((crop) => {
		if(crop?.width && crop?.height){
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

			onClose();
		}
	}, [onClose, saveCapture]);

	if (!open && imageData){
		// Initialize
		setOpen(true);
		setCrop(undefined);
	} else if (open && !imageData){
		setOpen(false);
	}

	useEffect(() => {
		if (open) {
			disableScope("scenario-record");
		} else {
			enableScope("scenario-record");
		}
	}, [disableScope, enableScope, open])


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