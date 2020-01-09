
var gl;

var shaderPrefix = [];
var shaderPrograms = {};
var shaderInit = {};
var bufferInit = {};
var drawFunctions = {};
var animateFunctions = {};
var startTime;
var previousTime;

function startup() {
  msgDOM = document.getElementById("msgDOM").firstChild;
  msg("Startup() called.");
  var canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  gl.clearColor(135/255, 206/255, 250/255, 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.getExtension("OES_element_index_uint");
  startTime = previousTime = Date.now();
  initAll();
  msg("Iitializing shaders...");
  setupShaders(); 
  msg("Iitializing buffers...");
  setupBuffers();

  tick();
}
function tick() {
  requestAnimFrame(tick);
  if(playing){
    draw();
    animate();
    interfaceUpdate();
  }
  if(currentlyPressedKeys[82]){
    restart();
  }
}
function createGLContext(canvas) {
  var names = ["webgl", "experimental-webgl"];
  var context = null;
  for (var i=0; i < names.length; i++) {
    try {
      context = canvas.getContext(names[i]);
    } catch(e) {}
    if (context) {
      break;
    }
  }
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}
function setupShaders(){
  for(var i = 0; i < shaderPrefix.length; i++){
    setupOneShader(shaderPrefix[i]);
    shaderInit[shaderPrefix[i]]();
  }
}
function setupOneShader(prefix){
  var oneShaderProgram = gl.createProgram();
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  var vertexShaderSource = document.getElementById(prefix + "VertexShaderDOM").innerHTML;
  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  var fragmentShaderSource = document.getElementById(prefix + "FragmentShaderDOM").innerHTML;
  gl.shaderSource(vertexShader,vertexShaderSource);
  gl.compileShader(vertexShader);
  gl.attachShader(oneShaderProgram, vertexShader);
  gl.shaderSource(fragmentShader,fragmentShaderSource);
  gl.compileShader(fragmentShader);
  gl.attachShader(oneShaderProgram, fragmentShader);
  gl.linkProgram(oneShaderProgram);

  if (!gl.getProgramParameter(oneShaderProgram, gl.LINK_STATUS)) {
    console.log("Failed to setup shader:" + prefix);
  }

  shaderPrograms[prefix] = oneShaderProgram;
}
function setupBuffers(){
  for(var i = 0; i < shaderPrefix.length; i++){
    bufferInit[shaderPrefix[i]]();
  }
}
function draw(){
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
  for(var i = 0; i < shaderPrefix.length; i++){
    drawFunctions[shaderPrefix[i]]();
  }
}
function animate(){
  var lapse = Date.now() - previousTime;
  previousTime = previousTime + lapse;
  lapse /= 1000.0;
  physicsUpdate(lapse);
  viewUpdateMatrix();
  for(var i = 0; i < shaderPrefix.length; i++){
    animateFunctions[shaderPrefix[i]](lapse);
  }
}
function degToRad(d){
  return d * Math.PI / 180 ;
}
function radToDeg(r){
  return r / Math.PI * 180 ;
}
function initAll(){
  msg("Iitializing interface...");
  interfaceInit();
  msg("Iitializing view...");
  viewInit();
  msg("Iitializing physics...");
  physicsInit();
  msg("Iitializing airplane...");
  airplaneInit();
  msg("Iitializing misc...");
  miscInit();
  msg("Iitializing terrain...");
  terrainInit();
}
function restart(){

  playing = true;
  ground = true;
  reverse = false;

  startTime = previousTime = Date.now();

  viewQuat = quat.create();
  viewOrigin = vec3.fromValues(0.0,-0.9,AIRPLANE_HEIGHT);
  velocity = vec3.create();

  interfaces.thrust.set(0.0);

  msg("Inisialisasi dilakukan, Mulailah bersenang-senang!");

  document.getElementById("msgDOM").style.color = "black";
}
function gameover(text){
  playing = false;
  msg(text);
  document.getElementById("msgDOM").style.color = "red";
}