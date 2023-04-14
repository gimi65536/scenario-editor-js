import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export default function VideoJSComponent({option}){
	const frameRef = useRef(null);
	const playerRef = useRef(null);

	// Setup code
	useEffect(() => {
		if (!playerRef.current) {
			// Make sure Video.js player is only initialized once
			const videoElement = document.createElement("video-js");
			videoElement.classList.add('vjs-big-play-centered');
			frameRef.current.appendChild(videoElement);

			playerRef.current = videojs(videoElement, option);
		}else{
			// Initialized
			playerRef.current.src(option.sources);
		}
	}), [option, frameRef];

	// Cleanup code
	useEffect(() => {
		const player = playerRef.current;
		return () => {
			if (player && !player.isDisposed()){
				player.dispose();
				playerRef.current = null;
			}
		};
	}, [playerRef]);

	return (
		<div data-vjs-player>
			<div ref={frameRef} />
		</div>
	);
}