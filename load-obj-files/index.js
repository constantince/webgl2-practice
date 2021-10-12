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
  if (shaders.length <= 1) {
    console.warn("shaders text error", shaders);
  }
  const program = twgl.createProgramInfo(gl, shaders);

  return program;
}

function toRedius(a) {
  return a * 180 / Math.PI;
}

function createEmptyMatrix() {
  const transformMatrix = m4.identity();
  return {
    u_world: transformMatrix,
    u_normalMatrix: m4.inverse(transformMatrix)
  }
}



function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const dpr = window.devicePixelRatio;
  const { width, height } = canvas.getBoundingClientRect();
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  // Check if the canvas is not the same size.
  const needResize = canvas.width !== displayWidth ||
    canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}



const AMBIENTCOLOR = [1.0, 1.0, 1.0];
const AMBIENTMATERIAL = 0.63;
const DIFFUSECOLOR = [1.0, 1.0, 1.0];
const DIFFUSEMATERIAL = 2.0;
const SPECULARCOLOR = [1.0, 1.0, 1.0];
const SPECULARM = 2.0;
const LIGHTSOURCE = [5.3, 10.0, 10.5];
const LOOKAT = [5, 3, 10];
const OFFSCREEN_WIDTH = 2040;
const OFFSCREEN_HEIGH = 2040;
const fieldView = toRedius(60.0);


let selectedObject = { name: null };

function main() {
  const canvas = document.getElementById("happy-life-happy-code");
  const gl = canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if (!gl) return console.error("sorry, your browser does't not support webgl now!");
  eventStartUp(canvas);
  const renderProgram = createShaderFromScript(gl, ["vertex", "frag"]);
  const frameProgram = createShaderFromScript(gl, ["frame-vertex", "frame-frag"]);
  const pickProgram = createShaderFromScript(gl, ["click-vertex", "click-frag"]);

  // Create a texture to render to
  const targetTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, targetTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // create a depth renderbuffer
  const depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

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

  // Create and bind the framebuffer
  const pickFbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

  // make a depth buffer and the same size as the targetTexture
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  twgl.setAttributePrefix("a_");

  const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 50, 50);
  const planeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, planeBufferInfo);

  //scene
  let sence = [
    {
      name: 'plane',
      buffer: planeBufferInfo,
      vao: planeVao,
      calculateTheUniforms: function (time) {
        const transformMatrix = m4.translate(m4.identity(), 0, 0, 0);
        return {
          u_color: [1.0, 1.0, 1.0, 1.0],
          u_use_shadow: false,
          u_ambientM: 0.35,
          u_diffuseM: 0.8,
          u_specularM: 0.0,
          u_world: transformMatrix,
          u_normalMatrix: m4.inverse(transformMatrix)
        }
      }
    }
  ]

  // load object from serve
  fetch('./Lowpoly_tree_sample.obj').then(response => response.text()
  ).then(async res => {
    const obj = parseOBJ(res);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
      const response = await fetch('./' + filename);
      return await response.text();
    }));
    const materials = parseMTL(matTexts.join('\n'));
    // console.log(materials);
    // var objDoc = new OBJDoc('canon.obj');  // Create a OBJDoc object
    // var result = objDoc.parse(res, 30, false); // Parse the file
    // if (result) {
    //   setTimeout(() => {
    //     if (objDoc !== null && objDoc.isMTLComplete()) { // OBJ and all MTLs are available
    //       var drawingInfo = objDoc.getDrawingInfo();
    //       console.log(drawingInfo);
    //       const buffer = twgl.createBufferInfoFromArrays(gl, drawingInfo);
    //       const vao = twgl.createVAOFromBufferInfo(gl, renderProgram, buffer);
          
    //   }, 3000);

    // }
    // console.log(obj);
    obj.geometries.map(({material ,data}) => {
      const buffer = twgl.createBufferInfoFromArrays(gl, data);
      // console.log(data);
      // fills out a vertex array by calling gl.createVertexArray, gl.bindVertexArray
      // then gl.bindBuffer, gl.enableVertexAttribArray, and gl.vertexAttribPointer for each attribute
      const vao = twgl.createVAOFromBufferInfo(gl, renderProgram, buffer);

      material = materials[material];
      // console.log(material);
      sence.push({
        name: 'canon',
        buffer,
        vao,
        calculateTheUniforms: function (time) {
          let transform = m4.translate(m4.identity(), 0, 1, 0);
          transform = m4.axisRotate(transform, [0, .01, 0], toRedius(time * 0.000000));
          const transformMatrix = twgl.m4.scale(transform, [.25, .25, .25]);
          return {
            ...material,
            u_ambientM: 1.0,
            u_diffuseM: 1.0,
            u_specularM: 1.0,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      });

    });


  });

  // render scenc matrixs
  // const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
  // const render_view = m4.lookAt(LOOKAT, [0, 0, 0], [0, 1, 0]);

  // render shadow matrixs
  const framePerspective = m4.perspective(fieldView, OFFSCREEN_WIDTH / OFFSCREEN_HEIGH, 0.5, 1000);
  const frameLookAt = m4.lookAt(LIGHTSOURCE, [0, 0, 0], [0, 1, 0]);

  const { fbo, texture } = createFrameBuffer(gl);


  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  var tick = function (time) {
    // render scenc matrixs
    const VIEWORIGANL = [Math.cos(time * 0.0005) * 7, 12, 12];
    const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
    const render_view = m4.lookAt(VIEWORIGANL, [0, 0, 0], [0, 1, 0]);

    // render pick frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pickProgram.program);
    twgl.setUniforms(pickProgram, {
      u_projection: render_project,
      u_view: m4.inverse(render_view),
    });

    sence.forEach((item, index) => {
      const { buffer, vao, calculateTheUniforms } = item;
      const id = index;
      twgl.setUniforms(pickProgram, {
        ...calculateTheUniforms(time),
        u_id: [
          ((id >> 0) & 0xFF) / 0xFF,
          ((id >> 8) & 0xFF) / 0xFF,
          ((id >> 16) & 0xFF) / 0xFF,
          ((id >> 24) & 0xFF) / 0xFF,
        ]
      });
      gl.bindVertexArray(vao);
      twgl.drawBufferInfo(gl, buffer);
    });

    if (mouseupActived) {

      const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
      const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
      const data = new Uint8Array(4);
      gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
      if (data[0] >= 0) {
        selectedObject = sence[data[0]];
      }

      console.log(data[0], selectedObject.name)
      mouseupActived = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);



    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(frameProgram.program);

    // render frame buffer for shadows
    twgl.setUniforms(frameProgram, {
      u_projection: framePerspective,
      u_view: m4.inverse(frameLookAt)
    });

    sence.forEach((item, index) => {
      const { buffer, vao, calculateTheUniforms } = item;
      twgl.setUniforms(frameProgram, calculateTheUniforms(time));
      gl.bindVertexArray(vao);
      twgl.drawBufferInfo(gl, buffer);
    });

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // render color buffer
    gl.viewport(0, 0, canvas.width, canvas.height);
    resizeCanvasToDisplaySize(canvas)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(renderProgram.program);
    twgl.setUniforms(renderProgram, {
      u_projection: render_project,
      u_view: m4.inverse(render_view),
      u_texture: texture,
      u_innerLimit: -12.0,
      u_outerLimit: -14.5,
      u_frame_projection: framePerspective,
      u_frame_view: m4.inverse(frameLookAt),
      u_lightSource: LIGHTSOURCE,
      u_ambientColor: AMBIENTCOLOR,
      u_diffuseColor: DIFFUSECOLOR,
      u_specularColor: SPECULARCOLOR,
      u_viewDirection: VIEWORIGANL,
      u_color: [1.0, 1.0, 1.0, 1.0],
      u_fogDensity: 0.1,
      u_fogColor: [.2, .2, .2],
    });

    sence.forEach(item => {
      const { buffer, vao, calculateTheUniforms, name } = item;
      const uniforms = calculateTheUniforms(time);
      const optical = (time & 0x8) && (selectedObject.name === name && selectedObject.name !== "plane");
      uniforms.u_color = !optical ? uniforms.u_color : [0.69, 0.23, 0.3, 1.0];
      twgl.setUniforms(renderProgram, uniforms);
      gl.bindVertexArray(vao);
      twgl.drawBufferInfo(gl, buffer);
    });

    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}

function createFrameBuffer(gl) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const rb = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH)

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return { fbo, texture }
}

var mouseX = 0;
var mouseY = 0;
var mouseupActived = false;
function eventStartUp(canvas) {
  canvas && canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseupActived = true;
  });
}

