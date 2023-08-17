import { useRef, useEffect, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

const VideoJSComponent = forwardRef(function VideoJSComponent({ option }, ref) {
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
			if(ref){
				ref.current = playerRef.current;
			}
		} else {
			// Initialized
			let same = false;
			const currentSources = playerRef.current.currentSources();
			if(currentSources.length === option.sources.length){
				same = true;
				for(let i = 0; i < currentSources.length; i++){
					// "!=" is used here! Be careful!!!
					if(currentSources[i] != option.sources[i]){
						same = false;
						break;
					}
				}
			}
			if (!same){
				playerRef.current.src(option.sources);
			}
		}
	}), [option, frameRef];

	// Cleanup code
	useEffect(() => {
		const player = playerRef.current;
		return () => {
			if (player && !player.isDisposed()) {
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
});

export default VideoJSComponent;