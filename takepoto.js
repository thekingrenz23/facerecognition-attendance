/*
*Name: Renz Carlo Salanga
*Reporsitory: github.com/kingrenz23
*/


/***************My Helpers****************/

let inputSize = 224;
let scoreThreshold = 0.5;
let forwardTimes = [];
let imageCapture;
let stream;
let hasFace = false;
let faceMatcher = null;

//for picture
let x,y,width,height;

//var attendace = [];

function isFaceDetectionModelLoaded() {
  return !!faceapi.nets.tinyFaceDetector.params
}

function getFaceDetectorOptions() {
    return new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold });
}

//Take a Picture
document.getElementById('take-photo').onclick = function(){
	if(hasFace){
		var canvas = document.getElementById("picture");
		var ctx = canvas.getContext('2d');
		
		var video = document.getElementById('inputVideo');
		
		//ctx.drawImage(video, x,y, width, height, 0,0, canvas.width, canvas.height);
		ctx.drawImage(video, x,y, width, height, 0,0, canvas.width, canvas.height);
		
		//var image = canvas.toDataURL("image/png");
		
		canvas.height = 100;
		canvas.width = 100;
		
		ctx.drawImage(video, x,y, width, height, 0,0, canvas.width, canvas.height);
		
		var base = canvas.toDataURL("image/png");
		
		var name = prompt("Please enter Person name: ");
		
		if(name!=null){
			download(base, name+".png", "image/png");
		}else{
			alert("Please Enter a name");
		}
	}else{
		alert("No face detected");
	}
};
/***************My Code****************/
function updateTimeStats(timeInMs) {
	forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30)
	const avgTimeInMs = forwardTimes.reduce((total, t) => total + t) / forwardTimes.length
	//$('#time').val(`${Math.round(avgTimeInMs)} ms`)
	//$('#fps').val(`${faceapi.round(1000 / avgTimeInMs)}`)
}

async function onPlay() {
	const videoEl = document.getElementById('inputVideo');
	const canvas = document.getElementById('overlay');
	
	if(videoEl.paused || videoEl.ended || !isFaceDetectionModelLoaded()){
		return setTimeout(() => onPlay())
	}
	
	const options = getFaceDetectorOptions();
	
	const ts = Date.now();
	
	const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks();
	updateTimeStats(Date.now() - ts);
	
	if(result) {
		
		const dims = faceapi.matchDimensions(canvas, videoEl, true);
		const resizedResult = faceapi.resizeResults(result, dims);
		
		x = resizedResult.alignedRect._box.x;
		y = resizedResult.alignedRect._box.y;
		width = resizedResult.alignedRect._box._width;
		height = resizedResult.alignedRect._box._height;
			
		//console.log(width);
		//console.log(x);
		//faceapi.draw.drawDetections(canvas, faceapi.resizeResults(result, dims));
		//const faceMatcher = new faceapi.FaceMatcher(results);
		faceapi.draw.drawDetections(canvas, resizedResult);
		faceapi.draw.drawFaceLandmarks(canvas, resizedResult);
		
		//const faceMatcher = new faceapi.FaceMatcher(results)
		hasFace = true;
		//drawFaceRecognitionResults(result);
		
		/*
		resizedResult.forEach(({ detection, descriptor }) => {
			const label = faceMatcher.findBestMatch(descriptor).toString()
			const options = { label }
			const drawBox = new faceapi.draw.DrawBox(detection.box, options)
			drawBox.draw(canvas);
			
			var last = label.indexOf('(');
			var name = label.substring(0, last-1);
			
			if(!myVue.attendance.includes(name) && name != "unknown"){
				myVue.attendance.push(name);
			}
		});*/
		
	}else{
		context = canvas.getContext('2d');
		context.clearRect(0,0,canvas.height, canvas.width);
		hasFace = false;
	}
	
	setTimeout(() => onPlay())
}



async function run(){
	await faceapi.nets.tinyFaceDetector.load('models');
	await faceapi.loadFaceLandmarkModel('models');
	//await faceapi.loadFaceRecognitionModel('models');
	
	//Initialize face matcher
	//faceMatcher = await createRenzFaceMatcher(1);
	
	stream = await navigator.mediaDevices.getUserMedia({ video: {} });
	
	const videoEl = document.getElementById('inputVideo');
	videoEl.srcObject = stream;
}

window.onload = function(){
    run();
}

