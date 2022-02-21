import React, {useRef, useEffect, useState} from "react";
import "./webcam.css";
import Webcam from "react-webcam";
import "./camera.css";

function dataURLtoFile(dataurl, filename) {
 
	var arr = dataurl.split(','),
		mime = arr[0].match(/:(.*?);/)[1],
		bstr = atob(arr[1]), 
		n = bstr.length, 
		u8arr = new Uint8Array(n);
		
	while(n--){
		u8arr[n] = bstr.charCodeAt(n);
	}
	
	return new File([u8arr], filename, {type:mime});
}

function Webcam_picture() {
	const videoRef = useRef(null);
	const photoRef = useRef(null);

	const [hasPhoto, setHasPhoto] = useState(false)
	const [feature, setFeatureChange] = useState("lip")
	const [color, setColor] = useState("#FF1414")



	const getVideo = () => {
		navigator.mediaDevices
			.getUserMedia(
				{video: { width: 1080, height: 1080} })
				.then(stream => {
					let video = videoRef.current;
					video.srcObject = stream;
					video.play();
				})
				.catch(err => {
					console.error(err)
				})
	}

	const takePhoto = () => {
		const width = 414;
		const height = width / (16/10);

		let video = videoRef.current;
		let photo = photoRef.current;

		photo.width = width;
		photo.height = height;

		let ctx = photo.getContext('2d')
		ctx.drawImage(video, 0,0, width, height);


		var image = photo.toDataURL("image/png");
		var file = dataURLtoFile(image,'file.png');
		console.log(file);
		setHasPhoto(true);
	}

	const closePhoto = () => {
		let photo = photoRef.current;
		let ctx = photo.getContext('2d')
		setHasPhoto(false);
		ctx.clearRect(0,0, photo.width, photo.height)
	}

	const ColorChange = event => {
		setColor(event.target.value)
		console.log(color)
	}

	const featureChange = event => {
		setFeatureChange(event.target.value)
		console.log(feature)
	}

	useEffect(() => {
		getVideo();
	}, [videoRef])
	return(
		<div className="Webcam_picture">
			<div className="page-header">
				<h1 className="title">Camera Simulation</h1>
			</div>
			<div className="camera">
				<video ref={videoRef}></video>
				<button className="button3" onClick={takePhoto}>Take a Picture</button>
			</div>

			<div className={"result " + (hasPhoto ? 'hasPhoto' : '')} >
				<canvas ref={photoRef}></canvas>
				<button className={"button1 " + (hasPhoto ? 'hasPhoto' : '')} onClick={closePhoto}>Close</button>
					<label className="labels2">
						Select feature
						<select className="featureSelection" value={feature} onChange={featureChange} >
							<option value="lip">Lip color</option>
							<option value="hair">Hair color</option>
						</select>
					</label>
					<label className={"labels1 " + (hasPhoto ? 'hasPhoto' : '')}>
						Choose Color
						<input className="ColorSelect" type="color" onChange={ColorChange}></input>
					</label>
				<button className={"button2 " + (hasPhoto ? 'hasPhoto' : '')}>Apply</button>
			</div>
		</div>
	);
}

export default Webcam_picture;