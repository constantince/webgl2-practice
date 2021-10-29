
// const steelblue = d3.rgb("steelblue")
// console.log(steelblue);

const BASICCOLORS = [
  [235, 237, 240, 255],
  [15, 233, 168, 255],
  [64, 196, 99, 255],
  [48, 161, 78, 255],
  [55, 112, 73, 255],
  [33, 110, 57, 255]
];


function getNextDay(today) {
  const todayStramp = new Date(today).getTime();
  const nextDayStramp = todayStramp + (24 * 60 * 60 * 1000);
  const t = new Date(nextDayStramp);
  const y = t.getFullYear();
  const m = t.getMonth() + 1;
  const d = t.getDate();
  return `${y}/${m}/${d}`;
}
// data initialization
const CONTRIBUTIONSMAXNUM = 160;
const c0 = d3.lab((10 - 3) * 15, -34.9638, 47.7721).rgb();
let contributions = [{ date: '2021/01/01', num: 3, color: [c0.r / 255, c0.g / 255, c0.b / 255, c0.opacity] }];
const m = new Array(CONTRIBUTIONSMAXNUM - 1).fill(0).reduce((prev, next) => {
  const nextDay = getNextDay(prev);
  const num = Math.floor(Math.random() * 10);
  const c = d3.lab((10 - num) * 15, -34.9638, 47.7721).rgb();
  contributions.push({
    date: nextDay,
    num,
    color: [c.r / 255, c.g / 255, c.b / 255, c.opacity]
  });
  return nextDay;
}, contributions[0].date);

const fieldView = toRaius(60);
const AMBIENTCOLOR = [0.25, 0.25, 0.25, 1];
const F_AMBIENTCOLOR = 1.0;
const DIFFUSECOLOR = [1, 1, 1, 1];
const F_DIFFUSECOLOR = 1;
const LIGHTSOURCE = [2, 4, 5];
const LIGHTSOURCE2 = [-2, 4, -5];
const OFFSCREEN_WIDTH = 2040;
const OFFSCREEN_HEIGH = 2040;
const BARSELECTEDCOLOR = [1.0, 0.0, 0.0, 1.0];
// mouse position
var mouseX = 0;
var mouseY = 0;
// div that containt the contribution data on canvas.
var ytd = document.querySelector(".ytd");
// bar that under the mouse currently.
var selectedObject = {};
// wheel action
var whellZoomSize = 0;
// mouse action
var mouseUped = true;

var clock = createClock();
var spanBox = document.getElementById("date-selected");
function main() {

  const canvas = document.getElementById("happy-life-happy-code");
  const gl = canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (!gl) return console.error("sorry, your browser does't not support webgl now!");
  twgl.setAttributePrefix("a_");
  const programInfo = createShaderFromScript(gl, ["vertex", "frag"]);
  const programInfo1 = createShaderFromScript(gl, ["vertex1", "frag1"]);
  const programPicking = createShaderFromScript(gl, ["vertex-picking", "frag-picking"]);
  const program = programInfo.program; // basic program
  const program1 = programInfo1.program; // bar program
  const program2 = programPicking.program; // picking program
  var _offset = 1;

  function createContributionBarsMatrix(item, index, time, mat) {
    const num = item.num;
    const offset = index % 7;
    if (offset === 0) _offset--;
    const offsetX = ((offset * 1) - 3) * 2;
    const offsetY = ((_offset * 1) + 11) * 2;
    const h = Math.min(time * num / 15 / 1000, num / 10);
    let world = twgl.m4.scale(m4.identity(), [.05, h, .05]);
    world = twgl.m4.translate(world, [offsetX, h * .5, offsetY]);
    var rotation = twgl.m4.rotateY(m4.identity(), toRaius(currentAngle[1]));
    rotation = twgl.m4.rotateX(rotation, toRaius(currentAngle[0]));
    twgl.m4.multiply(rotation, world, mat);
  }

  // Create a texture to render to
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // create a depth renderbuffer
  const depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

  const pickFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);

  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

  // make a depth buffer and the same size as the targetTexture
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  const cubeBuffInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
  const cubevao = twgl.createVAOFromBufferInfo(gl, programInfo1, cubeBuffInfo);

  const planeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
  const planevao = twgl.createVAOFromBufferInfo(gl, programInfo, planeBufferInfo);

  const _arrays = twgl.primitives.createCubeVertices();

  function setFramebufferAttachmentSizes(width, height) {
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
      width, height, border,
      format, type, data);

    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  }

  setFramebufferAttachmentSizes(OFFSCREEN_WIDTH, OFFSCREEN_HEIGH);


  // start make instance data
  const instanceNum = CONTRIBUTIONSMAXNUM;

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  var currentAngle = [0.0, 0.0];
  const projection = m4.perspective(fieldView, canvas.width / canvas.height, 1, 1000);


  var tick = function (time) {
    const instanceWorld = new Float32Array(instanceNum * 16);
    const instanceNormalWorld = new Float32Array(instanceNum * 16);
    let instanceColor = [];
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);


    let view = m4.lookAt([1, 2, 2 + whellZoomSize], [0, 0, 0], [0, 1, 0]);
    view = m4.inverse(view);

    // make the base mat cube 
    let world = twgl.m4.scale(m4.identity(), [0.7, .1, 2.3]);
    world = twgl.m4.translate(world, [0, -.8, 0]);
    var rotation = twgl.m4.rotateY(m4.identity(), toRaius(currentAngle[1]));
    rotation = twgl.m4.rotateX(rotation, toRaius(currentAngle[0]));
    world = twgl.m4.multiply(rotation, world);
    twgl.setUniforms(programInfo, {
      u_projection: projection,
      u_view: view,
      u_world: world
    });
    gl.bindVertexArray(planevao);
    twgl.drawBufferInfo(gl, planeBufferInfo);






    // make the bar that repesent contributions.
    gl.useProgram(program1);
    // const normalMatrix = m4.transpose(m4.inverse(world));
    twgl.setUniforms(programInfo1, {
      u_projection: projection,
      u_view: view,
      u_world: m4.identity(),
      u_color: [.9, .0, .0, 1.0],
      u_ambient: AMBIENTCOLOR,
      f_ambient: F_AMBIENTCOLOR,
      u_diffuse: DIFFUSECOLOR,
      f_diffuse: F_DIFFUSECOLOR,
      u_lightPosition: LIGHTSOURCE,
      // u_normalMatrix: m4.identity()
    });

    _offset = 1;
    contributions.forEach((item, index) => {
      let mat = new Float32Array(instanceWorld.buffer, index * 16 * 4, 16);
      let nmat = new Float32Array(instanceNormalWorld.buffer, index * 16 * 4, 16);
      createContributionBarsMatrix(item, index, time, mat);
      m4.transpose(m4.inverse(mat), nmat);
      let color = item.date === selectedObject.date ? BARSELECTEDCOLOR : item.color;
      // console.log(color);
      instanceColor.push(...color);
    });

    Object.assign(_arrays, {
      world: {
        numComponents: 16,
        data: instanceWorld,
        divisor: 1
      },
      color: {
        numComponents: 4,
        data: instanceColor,
        divisor: 1
      },
      normalMatrix: {
        numComponents: 16,
        data: instanceNormalWorld,
        divisor: 1
      }

    });

    bufferInfo = twgl.createBufferInfoFromArrays(gl, _arrays);
    vertexArrayInfo = twgl.createVAOFromBufferInfo(gl, programInfo1, bufferInfo);

    // twgl.setBuffersAndAttributes(gl, programInfo1, vertexArrayInfo);
    gl.bindVertexArray(vertexArrayInfo);
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, vertexArrayInfo.numElements, 0, instanceNum);


    // render pick frame buffer
    if (mouseUped === true) {
      // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program2);
      twgl.setUniforms(programPicking, {
        u_projection: projection,
        u_view: view,
        u_world: m4.identity(),
      });

      _offset = 1;
      instanceColor = [];
      contributions.forEach((item, index) => {
        let mat = new Float32Array(instanceWorld.buffer, index * 16 * 4, 16);
        createContributionBarsMatrix(item, index, time, mat);
        const id = index + 1;
        instanceColor.push(
          ((id >> 0) & 0xFF) / 0xFF,
          ((id >> 8) & 0xFF) / 0xFF,
          ((id >> 16) & 0xFF) / 0xFF,
          ((id >> 24) & 0xFF) / 0xFF
        )
        // console.log(instanceColor);
        // createContributionBarsMatrixMatrix(item, index, programPicking, time, mat);
      });

      Object.assign(_arrays, {
        world: {
          numComponents: 16,
          data: instanceWorld,
          divisor: 1
        },
        id: {
          numComponents: 4,
          data: instanceColor,
          divisor: 1
        }
      });

      let bufferInfo = twgl.createBufferInfoFromArrays(gl, _arrays);
      let vertexArrayInfo = twgl.createVAOFromBufferInfo(gl, programPicking, bufferInfo);
      // twgl.setBuffersAndAttributes(gl, programInfo1, vertexArrayInfo);
      gl.bindVertexArray(vertexArrayInfo);
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLES, vertexArrayInfo.numElements, 0, instanceNum);

      const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
      const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
      const data = new Uint8Array(4);
      gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
      if (data[0] > 0 && contributions[data[0] - 1]) {
        selectedObject = contributions[data[0] - 1];
        spanBox.innerHTML = 'On <span class="date-cls">' + selectedObject.date + '</span> commited: <span class="times-cls">' + selectedObject.num + '</span> times';
      } else {
        //  selectedObject = {};
      }
      //  console.log(selectedObject);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      mouseUped = false;
      window.requestAnimationFrame(tick);
    }

    clock(gl);
  }


  // start to listen canvas mouse event.   
  initEventHandlers(canvas, currentAngle, tick);

  // make a animation that last for 2 seconds.
  const rafTickFunctionCounterTimes = excutedCountes(tick, 1500);
  rafTickFunctionCounterTimes();
}

// create the container of bar infomations.
const body = document.body;
function makeCover() {
  var coverDiv = document.createElement("div");
  var style = coverDiv.style;
  style.height = body.clientHeight + 'px';
  style.width = body.clientWidth + 'px';
  style.top = '0px';
  style.left = '0px';
  style.position = "absolute";
  body.appendChild(coverDiv);
  return coverDiv;
}







function createClock() {
  var now = null, counts = 0;
  var fps = document.getElementById("fps");
  return function (gl) {
    gl.finish();
    counts++;
    var _now = Date.now();
    if (_now - now >= 1000) {
      now = _now;
      var n = counts;
      counts = 0;
      // console.log(n,' FPS');
      fps.innerText = 'GPU: ' + n + ' fps';
      return n;// return FPS counts
    }
  }
}


