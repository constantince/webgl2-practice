function getSourceFromScript(scriptId) {
    const shaderScript = document.getElementById(scriptId);
    if (!shaderScript) {
      throw ("*** Error: unknown script element" + scriptId);
    } 
    const text = shaderScript.text;
    return text;
  }
  
function createShaderFromScript(gl, scriptIds) {
    let shaders = [getSourceFromScript(scriptIds[0]), getSourceFromScript(scriptIds[1])];
    if(shaders.length <= 1) {
        console.warn("shaders text error", shaders);
    }
    const program = twgl.createProgramInfo(gl, shaders);

    return program;
}

function toRaius(a) {
  return a * 180 / Math.PI;
}

const BASICCOLORS = [
  [235, 237, 240, 255],
  [15, 233, 168, 255],
  [64, 196, 99, 255],
  [48, 161, 78, 255],
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
let contributions = [{date: '2021/01/01', num: 3}];
const m = new Array(160).fill(0).reduce((prev,next) => {
  const nextDay = getNextDay(prev);
  contributions.push({
    date: nextDay,
    num: Math.floor(Math.random() * 10)
  });
  return nextDay;
}, contributions[0].date);

const fieldView = toRaius(60);
const AMBIENTCOLOR = [0.7, 0.7, 0.7, 1];
const F_AMBIENTCOLOR = 1.0;
const DIFFUSECOLOR = [1, 1, 1, 1];
const F_DIFFUSECOLOR = .2;
const LIGHTSOURCE = [2, 4, 5];
const LIGHTSOURCE2 = [-2, 4, -5];
const OFFSCREEN_WIDTH = 2040;
const OFFSCREEN_HEIGH = 2040;
// mouse position
var mouseX = 0;
var mouseY = 0;
// div that containt the contribution data on canvas.
var ytd = document.querySelector(".ytd");
// bar that under the mouse currently.
var selectedObject = {};

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    twgl.setAttributePrefix("a_");
    const programInfo = createShaderFromScript(gl, ["vertex", "frag"]);
    const programInfo1 = createShaderFromScript(gl, ["vertex1", "frag1"]);
    const programPicking = createShaderFromScript(gl, ["vertex-picking", "frag-picking"]);
    const program = programInfo.program; // basic program
    const program1 = programInfo1.program; // bar program
    const program2 = programPicking.program; // picking program
    var _offset = 1;

    function createContributionBars(item, index, p, time) {
      const num = item.num;
      const offset = index % 7;
      if( offset === 0 ) _offset--;
      const offsetX = ((offset * 1) - 3) * 2;
      const offsetY = ((_offset * 1) + 11) * 2;
      const c = BASICCOLORS[Math.min(Math.ceil(num / 2), 4)];
      let color = c.map(v => v/255.0);
      color = item.date === selectedObject.date ? [1.0, 1.0, 0.0, 1.0] : color;


      const h = Math.min(time * num / 15 / 1000, num / 10);
      let world = twgl.m4.scale(m4.identity(), [.05, h, .05]);
      world = twgl.m4.translate(world, [offsetX, h * .5, offsetY]);
      var rotation = twgl.m4.rotateY(m4.identity(), toRaius(currentAngle[1]));
      rotation = twgl.m4.rotateX(rotation, toRaius(currentAngle[0]));
      world = twgl.m4.multiply(rotation, world);
      const normalMatrix = m4.transpose(m4.inverse(world));
      const id = index + 1;
      twgl.setUniforms(p, {
        u_world: world,
        u_color: color,
        u_normalMatrix: normalMatrix,
        u_id: [
          ((id >>  0) & 0xFF) / 0xFF,
          ((id >>  8) & 0xFF) / 0xFF,
          ((id >> 16) & 0xFF) / 0xFF,
          ((id >> 24) & 0xFF) / 0xFF,
        ]
      });

      gl.bindVertexArray(cubevao);
      twgl.drawBufferInfo(gl, cubeBuffInfo);
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
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    var currentAngle = [0.0, 0.0];
    const projection = m4.perspective(fieldView, canvas.width / canvas.height, 1, 1000);
    let view = m4.lookAt([1, 2, 2], [0, 0, 0], [0, 1, 0]);
    view = m4.inverse(view);


    var tick = function(time) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);

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
        const normalMatrix = m4.transpose(m4.inverse(world));
        twgl.setUniforms(programInfo1, {
          u_projection: projection,
          u_view: view,
          u_world: world,
          u_color: [.9, .9, .9, 1.0],
          u_ambient: AMBIENTCOLOR,
          f_ambient: F_AMBIENTCOLOR,
          u_diffuse: DIFFUSECOLOR,
          f_diffuse: F_DIFFUSECOLOR,
          u_lightPosition: LIGHTSOURCE,
          u_lightPosition2: LIGHTSOURCE2,
          u_normalMatrix: normalMatrix,
        });
        
        
        _offset = 1;
        // load each contribution
        contributions.forEach((item, index) => {
          createContributionBars(item, index, programInfo1, time);
        });




      // render pick frame buffer
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
      contributions.forEach((item, index) => {
        createContributionBars(item, index, programPicking, time);
      });

      const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
      const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
      const data = new Uint8Array(4);
      gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
      if( data[0] > 0 && contributions[data[0] - 1]) {
          selectedObject = contributions[data[0] - 1];
          ytd.innerHTML = selectedObject.date;
          ytd.style.display = "block";
          
      } else {
          ytd.style.display = "none";
          selectedObject = {};
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


    // start to listen canvas mouse event.   
    initEventHandlers(canvas, currentAngle, tick);

    // make a animation that last for 2 seconds.
    const rafTickFunctionCounterTimes = excutedCountes(tick, 2000);
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

// exctue the animation for N seconds
function excutedCountes(func, sec) {
  var raf; var start;var cover;

  function Counters (time) {
    func(time);
    // console.log(Date.now() - start);
    if( Date.now() - start >= sec) {
      window.cancelAnimationFrame(raf);
      cover.style.display = "none";
    } else {
      raf = window.requestAnimationFrame(Counters);
    }
  }

  return function result() {
    cover = makeCover();
    start = Date.now();
    window.requestAnimationFrame(Counters);
  }

}

// mouse action on canvas.
function initEventHandlers(canvas, currentAngle, tick) {
  var dragging = false;
  var lastX = -1, lastY = -1;
  var rect = canvas.getBoundingClientRect();
  canvas.onmousedown = function (ev) {
    var x = ev.clientX, y = ev.clientY;
    if( rect.left <= x && x < rect.right && rect.top <=y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  }

  canvas.onmouseup = function(ev) {
    dragging = false;
  }

  canvas.onmousemove = function(ev) {
      var x = ev.clientX, y = ev.clientY;

      if( dragging ) {
        var factor = .05 / canvas.height;
        var dx = factor * (x - lastX);
        var dy = factor * (y - lastY);
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        currentAngle[1] = currentAngle[1] + dx;
      }
      ytd.style.left = ev.clientX + 'px';
      ytd.style.top = ev.clientY + 'px';
      mouseX = ev.clientX - rect.left;
      mouseY = ev.clientY - rect.top;
      window.requestAnimationFrame(tick);
      lastX = x, lastY =y;
  }
}


