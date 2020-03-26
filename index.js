/*
*Name: Renz Carlo Salanga
*Repository: github.com/kingrenz23
*/

var myVue = new Vue({
	el: '#app',
	data: {
		attendance: [],
		names: [],
		date: "Loading..",
		countdown: 0,
		checker: [],
		verifying: false
	},
	methods: {
		
	},
	created: function(){
		var option = {
			month: 'long', 
			weekday: 'long',
			year: 'numeric',
			day: 'numeric'
		}

		var s = new Date().toLocaleDateString("en-US", option);
		
		this.date = s;
	}
});

/***************My Helpers****************/

var option = {
	month: 'long', 
	weekday: 'long',
	year: 'numeric',
	day: 'numeric'
}

var s = new Date().toLocaleDateString("en-US", option);

let inputSize = 224;
let scoreThreshold = 0.5;
let forwardTimes = [];
let imageCapture;
let stream;
let hasFace = false;
let faceMatcher = null;

//timer
let startedTimer = false;

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
	window.location = "take-photo.html";
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
	
	const result = await faceapi.detectAllFaces(videoEl, options).withFaceLandmarks().withFaceDescriptors();
	updateTimeStats(Date.now() - ts);
	
	if(result.length > 0) {
		
		const dims = faceapi.matchDimensions(canvas, videoEl, true);
		const resizedResult = faceapi.resizeResults(result, dims);
	
		hasFace = true;
		
		resizedResult.forEach(({ detection, descriptor }) => {
			const label = faceMatcher.findBestMatch(descriptor).toString()
			const options = { label }
			const drawBox = new faceapi.draw.DrawBox(detection.box, options)
			drawBox.draw(canvas);
			
			var last = label.indexOf('(');
			var name = label.substring(0, last-1);
			
			
			/*
			if(!myVue.names.includes(name) && name != "unknown" && myVue.countdown < 5){
			
				myVue.names.push(name);
					
				myVue.attendance.push({
					"name": name,
					"time": hour + ":" + min + " " + ampm
				});
				
				startTimer();
			}*/
			
			if(myVue.countdown < 5 && !startedTimer && !myVue.verifying){
				startTimer();
				startedTimer = true;
				myVue.checker.push(name);
			}else{
				
				if(!myVue.verifying){
					myVue.checker.push(name);
				}
				
			}
			
		});
		
	}else{
		context = canvas.getContext('2d');
		context.clearRect(0,0,canvas.height, canvas.width);
		myVue.countdown = 0;
		myVue.checker = [];
		hasFace = false;
		//console.log("reset");
		//stopTimer();
	}
	
	setTimeout(() => onPlay())
}
var checkTama
function startTimer(){

checkTama =	setInterval(function(){
	if(myVue.countdown < 5){
		myVue.countdown++;
	}else if(myVue.countdown == 5){
		myVue.verifying = true;
		stopTimer();
		//console.log(myVue.checker);
	}
},1000);
	
}

function stopTimer(){
	clearInterval(checkTama);
	myVue.countdown = 0;
	
	//get all the unique names
	var names = [];
	var count = [];
	
	myVue.checker.forEach(function(data){
		if(!names.includes(data)){
			names.push(data);
		}
	});
	
	//init 0 for each unique names
	names.forEach(function(data, index){
		count[index] = 0;
	});
	
	names.forEach(function(data, index){
		
		//count for index 0;
		myVue.checker.forEach(function(nagan){
			if(data == nagan){
				count[index]++;
			}
		});
		
	});
	
	/*
	startedTimer = false;
	myVue.verifying = false;*/
	
	var maxIndex = 0;
	var max = count[maxIndex];
	
	count.forEach(function(data, index){
		if(data > max){
			maxIndex = index;
			max = data;
		}
	});
	
	
	var fetchTime = new Date();
			
	var hour = fetchTime.getHours();
	var min = fetchTime.getMinutes();
	var ampm = "am";
	
	if (min < 10) {
		min = "0" + min;
	}
	
	if(hour > 12){
		hour -= 12;
		ampm = "pm";
	}
	
	
	if(!myVue.names.includes(names[maxIndex])){
		myVue.names.push(names[maxIndex]);

		myVue.attendance.push({
			"name": names[maxIndex],
			"time": hour + ":" + min + " " + ampm
		});
	}else{
		alert("You already signed in today :-)");
	}
	
	startedTimer = false;
	myVue.verifying = false;
}

async function run(){
	await faceapi.nets.tinyFaceDetector.load('models');
	await faceapi.loadFaceLandmarkModel('models');
	await faceapi.loadFaceRecognitionModel('models');
	
	//Initialize face matcher
	faceMatcher = await createRenzFaceMatcher(1);
	
	stream = await navigator.mediaDevices.getUserMedia({ video: {} });
	
	const videoEl = document.getElementById('inputVideo');
	videoEl.srcObject = stream;
}

window.onload = function(){
    run();
}

