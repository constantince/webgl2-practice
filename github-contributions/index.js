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

const contributions = [
  {
    date: '2020/12/31',
    num: 0,
    limit: limit(.4)
  },{
  date: '2021/01/01',
  num: 4,
  limit: limit(.4)
}
,{
  date: '2021/01/02',
  num: 1,
  limit: limit(.1)
},{
  date: '2021/01/03',
  num: 5,
  limit: limit(.5)
}
,{
  date: '2021/01/04',
  num: 10,
  limit: limit(1)
}

,{
  date: '2021/01/05',
  num: 2,
  limit: limit(.2)
}

,{
  date: '2021/01/06',
  num: 1,
  limit: limit(.1)
}

,{
  date: '2021/01/07',
  num: 8,
  limit: limit(.8)
}
,{
  date: '2021/01/08',
  num: 3,
  limit: limit(.3)
}
,{
  date: '2021/01/09',
  num: 7,
  limit: limit(.7)
}

]

const fieldView = toRaius(60);

const AMBIENTCOLOR = [0.7, 0.7, 0.7, 1];
const F_AMBIENTCOLOR = 1.0;

const DIFFUSECOLOR = [1, 1, 1, 1];
const F_DIFFUSECOLOR = .2;

const LIGHTSOURCE = [2, 4, 5];
const LIGHTSOURCE2 = [-2, 4, -5];
const OFFSCREEN_WIDTH = 2040;
const OFFSCREEN_HEIGH = 2040;


function makeTexture (gl) {
  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  {
    const level = 0;
    const internalFormat = gl.R8;
    const width = 7;
    const height = 23;
    const border = 0;
    const format = gl.RED;
    const type = gl.UNSIGNED_BYTE;
    const data = new Uint8Array([
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        // 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        // 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
    ]);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
                  format, type, data);

    // set the filtering so we don't need mips
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  return texture;
}
var selectedObject = {};
function limit(value) {
 var max = value;
 var height = 0;
 return function(time) {
  if( height >= max) {
    return max;
  }
  height = Math.abs(Math.sin(time * 0.0005)) + 0.01;
  return height;
 }
}

const growCylinder1 = limit(1);

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
    const program = programInfo.program;
    const program1 = programInfo1.program; // 
    const program2 = programPicking.program; // picking program

    function createCylinders(x, y, color, time, p, current, index, cb, num) {
      // const h = cb ? cb(time * num / 15): growCylinder1(time * num);
      const h = Math.min(time * num / 15 / 1000, num / 10);
      let world = twgl.m4.scale(m4.identity(), [.05, h, .05]);
      world = twgl.m4.translate(world, [x, h * 0.5, y]);
      const normalMatrix = m4.transpose(m4.inverse(world));
      const id = index + 1;
      twgl.setUniforms(p, {
        u_world: world,
        u_color: current ? current : color,
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

    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 1, 1);
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
    // gl.useProgram(program);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    var t = makeTexture(gl);
    var tick = function(time) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        const projection = m4.perspective(fieldView, canvas.width / canvas.height, 1, 1000);
        // let view = m4.lookAt([1, 2, 2], [0, 0, 0], [0, 1, 0]);
        view = m4.lookAt([Math.cos(time * 0.0002) * 2, 2, Math.sin(time * 0.0002) * 2], [0, 0, 0], [0, 1, 0]);
        view = m4.inverse(view);
        let world = twgl.m4.scale(m4.identity(), [0.7, .1, 2.3]);

        twgl.setUniforms(programInfo, {
          u_projection: projection,
          u_view: view,
          u_world: world,
          u_texture: t
        });

        gl.bindVertexArray(planevao);
        twgl.drawBufferInfo(gl, planeBufferInfo);


        

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

        var _offset = 1;
        contributions.forEach((item, index) => {
          const current = item.date === selectedObject.date ? [1.0, 1.0, 0.0, 1.0] : null;
          const offset = index % 7;
          const num = item.num;
          if( offset === 0 ) _offset--;
          const offsetX = ((offset * 1) - 3) * 2;
          const offsetY = ((_offset * 1) + 11) * 2;
          createCylinders(
            offsetX,
            offsetY,
            [1.0, 1.0, 1.0, 1.0], 
            time, 
            programPicking, 
            null, 
            index,
            item.limit,
            num
          );
        });


         
        const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
        const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
        const data = new Uint8Array(4);
        gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
        if( data[0] > 0 ) {
            selectedObject = contributions[data[0] - 1];
            ytd.innerHTML = selectedObject.date;
            ytd.style.display = "block";
            
        } else {
            ytd.style.display = "none";
            selectedObject = {};
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);



        gl.useProgram(program1);

        world = twgl.m4.translate(world, [0, -.51, 0]);

        const normalMatrix = m4.transpose(m4.inverse(world));
        twgl.setUniforms(programInfo1, {
          u_projection: projection,
          u_view: view,
          u_world: world,
          u_color: [1.0, 1.0, 1.0, 1.0],
          u_ambient: AMBIENTCOLOR,
          f_ambient: F_AMBIENTCOLOR,
          u_diffuse: DIFFUSECOLOR,
          f_diffuse: F_DIFFUSECOLOR,
          u_lightPosition: LIGHTSOURCE,
          u_lightPosition2: LIGHTSOURCE2,
          u_normalMatrix: normalMatrix,
        });
        
        gl.bindVertexArray(cubevao);
        twgl.drawBufferInfo(gl, cubeBuffInfo);

        

        var _offset = 1;
        contributions.forEach((item, index) => {
          const current = item.date === selectedObject.date ? [1.0, 1.0, 0.0, 1.0] : null;
          const num = item.num;
          const offset = index % 7;
          if( offset === 0 ) _offset--;
          const offsetX = ((offset * 1) - 3) * 2;
          const offsetY = ((_offset * 1) + 11) * 2;
          const c = BASICCOLORS[Math.min(Math.ceil(num / 2), 4)];
          createCylinders(
            offsetX,
            offsetY,
            c.map(v => v/255.0),
            time,
            programInfo1,
            current,
            index,
            item.limit,
            num
          );
        });

        window.requestAnimationFrame(tick);

    }

    window.requestAnimationFrame(tick);
    // start to listen canvas mouse event
    eventStartUp(canvas)
}

var mouseX = 0;
var mouseY = 0;
var mouseupActived = false;
var ytd = document.querySelector(".ytd");
function eventStartUp(canvas) {
  const rect = canvas.getBoundingClientRect();
  canvas && canvas.addEventListener("mousemove", (e) => {
   
    ytd.style.left = e.clientX + 'px';
    ytd.style.top = e.clientY + 'px';
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseupActived = true;
  });
}


