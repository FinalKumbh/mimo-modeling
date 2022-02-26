import React, {useRef, useEffect, useState} from "react";
import "./webcam.css";
import Webcam from "react-webcam";
import "./camera.css";
import axios from "axios";
/*global cv*/



function dataURLtoFile(dataurl, filename) {
 
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataurl.split(',')[1]);

    // separate out the mime component
    var mimeString = dataurl.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8ClampedArray(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

	
	return new File([ab], filename, {type:mimeString});
}

function Webcam_picture() {
	const videoRef = useRef(null);
	const photoRef = useRef(null);

	const [hasPhoto, setHasPhoto] = useState(false)
	const [feature, setFeatureChange] = useState("lip")
	const [color, setColor] = useState("#FF1414")
	const [image_file, setFile] = useState(null)
	const [image_path, setPath] = useState(null)

	const [prediction, setPrediction] = useState(null)
	const [image, setImage] = useState(null)



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
		const width = 1024;
		const height = width;

		let video = videoRef.current;
		let photo = photoRef.current;
		
		photo.width = width;
		photo.height = height;

		let ctx = photo.getContext('2d')
		ctx.drawImage(video, 0,0, width, height);


		var image = photo.toDataURL("image/jpeg");
		var file = dataURLtoFile(image,'file.jpeg');
		setFile(file);
		setHasPhoto(true);
	}
	//code here to change the state
	const Upload_photo = () => {
		//event.preventDefault();
		const data = new FormData();
		data.append('file', image_file)
		console.log(image_file)
		axios.post('http://localhost:8000/api/v1/upload',data, {
        })
        .then(res => {getImageData(res)
        })
	}
	const getImageData = res => {
		setPath(res.data.path)
		console.log(image_path)
		const imgData = {
			path: image_path
		}
		axios.post('http://localhost:8000/api/v1/makeup', imgData, {
		})
		.then(imgRes => {
			console.log("imgRes.data.prediction")

			setPrediction(imgRes.data.prediction);
			setImage(imgRes.data.imageArray)
		})
	}


	const ApplyHandler = () => {
		const hexToRgb = hex =>
            hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
               .substring(1).match(/.{2}/g)
               .map(x => parseInt(x, 16))

        var applyColor = hexToRgb(color);
        // Segmented prediction from makeup API
        const data = prediction;
		console.log(data)
        // Original image from makeup API
        const image1 = image;
        const bytes = new Uint8ClampedArray(500 * 500 * 4);
        const tar = new Uint8ClampedArray(256 * 256 * 4);
        for (let i = 0; i < 500 * 500; ++i) {
            const j = i * 4;
            const k = i * 3;
            bytes[j + 0] = image1[k + 0];
            bytes[j + 1] = image1[k + 1];
            bytes[j + 2] = image1[k + 2];
            bytes[j + 3] = 255;
        }
        // Changing the color of the selected feature only
        for (let i =0; i < 256 * 256; ++i) {
            const j = i * 4;
            const partId = data[i];
            switch (feature){
                case "lip": {
                    if(partId == 11 || partId == 12){ 
                        tar[j + 0] = applyColor[0];
                        tar[j + 1] = applyColor[1];
                        tar[j + 2] = applyColor[2];
                        tar[j + 3] = 255;
                    }
                    else{
                        tar[j + 0] = 0;
                        tar[j + 1] = 0;
                        tar[j + 2] = 0;
                        tar[j + 3] = 255;
                    }
                    break;
                }
                case "hair": {
                    if(partId == 13){ 
                        tar[j + 0] = applyColor[0];
                        tar[j + 1] = applyColor[1];
                        tar[j + 2] = applyColor[2];
                        tar[j + 3] = 255;
                    }
                    else{
                        tar[j + 0] = 0;
                        tar[j + 1] = 0;
                        tar[j + 2] = 0;
                        tar[j + 3] = 255;
                    }
                    break;
                }
            }
        }
        let tarInter = new ImageData(tar, 256, 256);
        // Image having the feature with changes color
        let tarCanvas =  cv.matFromImageData(tarInter);
        let tsize = new cv.Size(500, 500);
        // Resize mask to match orriginal image
        cv.resize(tarCanvas, tarCanvas, tsize, 0, 0, cv.INTER_LINEAR)

        // Original image in opencv.js accepted format
        let bytesInter = new ImageData(bytes, 500, 500);
        let bytesCanvas =  cv.matFromImageData(bytesInter);

        let blur = new cv.Mat();
        let ksize = new cv.Size(7, 7);
        // Gaussian blur to sharpen the edges
        cv.GaussianBlur(tarCanvas, blur, ksize, 10);

        // Incorporating changes on the original image
        cv.addWeighted(bytesCanvas, 1, blur, 0.4, 0, bytesCanvas);
        
        blur.delete(); tarCanvas.delete();
        cv.imshow('canvasOutput', bytesCanvas);
        bytesCanvas.delete();
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
				<canvas ref={photoRef} id="canvasOutput"></canvas>
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
				<button className={"button2 " + (hasPhoto ? 'hasPhoto' : '')} onClick={ApplyHandler}>Apply</button>
				<button className={"button4 " + (hasPhoto ? 'hasPhoto' : '')} onClick={Upload_photo}>Upload</button>
			</div>
		</div>
	);
}

export default Webcam_picture;