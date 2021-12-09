//---------------
//Serial
let portAddr = "/dev/tty.usbmodem141201";

//Distances
const boundaryOne = 200;
const boundaries = [2000,1000,500];
const buffer = 5;

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
  for (let i = 0; i < boundaries.length; i++ ) {
    bound = boundaries[i];
    if (lastAvg > bound && avgData <= bound ) {
    //crossing nearer
      playVid(i + 1);
    } else if (avgData > bound && lastAvg <= bound) {
      //crossing farther
      playVid(i);
    }
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
  noneVid= createVideo("./Assets/0_outside.mp4")

  farVid = createVideo("./Assets/1_far.mp4")

  midVid = createVideo("./Assets/2_mid.mp4")

  nearVid = createVideo("3_2.mp4")

  vids = [noneVid, farVid, midVid, nearVid];

  // console.log(windowHeight);
  vids.forEach(function (v) {
    v.size(windowHeight, windowHeight);
    v.hide();
  })

  console.log("loaded")
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
  console.log("playing video " + i + " at avgData " + avgData);
  vids[videoPlaying].stop();
  vids[videoPlaying].hide();

  vids[i].show();
  vids[i].loop();

  videoPlaying = i;
}

function keyPressed() {
  switch(keyCode) {
    case 49: //1
      avgData = 300;
      handleAvgData();
      break;
    case 50: //2
      avgData = 200;
      handleAvgData();
      break;
    case 51: //3
      avgData = 100;
      handleAvgData();
      break;
    case 52: //4
      avgData = 30;
      handleAvgData();
      break;
    case LEFT_ARROW:
      playVid(1);
      console.log("far");
      break;
    case UP_ARROW:
      playVid(2);
      console.log("mid");
      break;
    case RIGHT_ARROW:
      playVid(3);
      console.log("near");
      break;
    default:
      console.log("unregistered key");
  }
}
