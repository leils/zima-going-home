//---------------
//Serial
let portAddr = "/dev/tty.usbmodem144201";

//Distances
const boundaryOne = 200;

let lastData;

//TODO avg data should be "far"
let avgData = 200;
let lastAvg = 0;
let influence = 0.08;

//Videos
let noneVid, farVid, midVid, nearVid;
let vids = [];

//video control
let videoPlaying = 1;
let isPlaying = false;



function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function handleAvgData() {
  if (lastAvg < boundaryOne && avgData > boundaryOne) {
    videoPlaying = farVid;
    console.log("Play circ1");

  } else if (lastAvg > boundaryOne && avgData < boundaryOne) {
    videoPlaying = midVid;
    console.log("Play circ2");

  }
  lastAvg = avgData;
}

function gotData() {
  let serialData = serial.readLine();
  if (!serialData) { return; } //throw out nil values

  if (serialData > 0) { //0 is error
    let diff = serialData - avgData;
    avgData += diff * influence;
  }

  handleAvgData();
}


//---------------
//Rendering
function preload(){
  noneVid= createVideo("1_2.mp4")
  noneVid.hide();

  farVid = createVideo("1_2.mp4")
  farVid.hide();

  midVid = createVideo("2_1.mp4")
  midVid.hide();

  nearVid = createVideo("3_2.mp4")
  nearVid.hide();

  vids = [noneVid, farVid, midVid, nearVid];
  print("loaded")
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  serial = new p5.SerialPort();

  serial.list();
  serial.open(portAddr);

  serial.on("connected", serverConnected);

  serial.on("list", gotList);

  serial.on("data", gotData);

  serial.on("error", gotError);

  serial.on("open", gotOpen);

  serial.on("close", gotClose);
}

function playVid(i) {
  vids[videoPlaying].stop();
  vids[videoPlaying].hide();

  vids[i].show();
  vids[i].play();

  videoPlaying = i;
}

function keyPressed() {
  //Space controls video playback
  if (keyCode === 32) {
    if (isPlaying) {
      console.log("Stop");
    } else {
      console.log("Play");
    }
    isPlaying = !isPlaying;
  } if (keyCode === LEFT_ARROW) {
    playVid(1);
    console.log("Far");
  } else if (keyCode === UP_ARROW) {
    playVid(2);
    console.log("Mid");
  } else if (keyCode == RIGHT_ARROW) {
    playVid(3);
    console.log("Near");
  }
}
