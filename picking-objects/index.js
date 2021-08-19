function getSourceFromScript(scriptId) {
  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw ("*** Error: unknown script element" + scriptId);
  } 
  const text = shaderScript.text;
  return text;
}

function createShaderFromScript(scriptIds) {
  let shaders = [getSourceFromScript(scriptIds[0]), getSourceFromScript(scriptIds[1])];

  if(shaders.length <= 1) {
    console.warn("shaders text error", shaders)
  }

  return shaders;
}
var far = 2000;
var near = 1;
var framecount = 0;

var fieldOfViewRadians = glMatrix.glMatrix.toRadian(60);

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#happy-life-happy-code");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  // Tell the twgl to match position with a_position, n
  // normal with a_normal etc..
  twgl.setAttributePrefix("a_");


  const aspect = canvas.clientWidth / canvas.clientHeight;
  const top = Math.tan(fieldOfViewRadians * .5) * 1;
  const bottom = -top;
  const left = aspect * bottom;
  const right = aspect * top;
  const width = Math.abs(right - left);
  const height = Math.abs(top - bottom);
  
  var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
  var cubeBufferInfo   = flattenedPrimitives.createCubeBufferInfo(gl, 20);
  var coneBufferInfo   = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false);
  const options = {
    attribLocations: {
      a_position: 0,
      a_color: 1,
    },
  };
  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, createShaderFromScript(["vertex", "frag"]), options);
  var pickingProgramInfo = twgl.createProgramInfo(gl, createShaderFromScript(["frame-buffer-vertex", "frame-buffer-frag"]), options);
  // console.log(pickingProgramInfo);
//   webgl.useProgram(program)
  var sphereVAO = twgl.createVAOFromBufferInfo(gl, programInfo, sphereBufferInfo);
  var cubeVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, cubeBufferInfo);
  var coneVAO   = twgl.createVAOFromBufferInfo(gl, programInfo, coneBufferInfo);





  const shapes = [
    {
      programInfo: programInfo,
      bufferInfo: sphereBufferInfo,
      vaoInfo: sphereVAO,
    },
    {
      programInfo: programInfo,
      bufferInfo: cubeBufferInfo,
      vaoInfo: cubeVAO,
    },
    {
      programInfo: programInfo,
      bufferInfo: coneBufferInfo,
      vaoInfo: coneVAO,
    }
  ];

  var objectsToDraw = [];
  var viewProjectionMatrix = m4.identity();

  function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }
  for(let i=0; i< 2; i++) {
    var id = i+1;
    const mult = [rand(0, 1), rand(0, 1), rand(0, 1), 1];
    const s = {
        ...shapes[Math.floor(Math.random(10) * 3)],
        translate: [rand(-100, 100), rand(-100, 100), rand(-150, -50)],
        speedX: rand(0, 1),
        speedY: rand(1.1, 1.5),
        preserve: mult,
        uniforms: {
          u_colorMult: mult,
          u_world: m4.identity(),
          u_viewProjection: viewProjectionMatrix,
          u_id: [
            ((id >>  0) & 0xFF) / 0xFF,
            ((id >>  8) & 0xFF) / 0xFF,
            ((id >> 16) & 0xFF) / 0xFF,
            ((id >> 24) & 0xFF) / 0xFF,
          ],
        }
       
      }
    objectsToDraw.push(s);
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
  setFramebufferAttachmentSizes(1, 1);

  // Create and bind the framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

  // attach the texture as the first color attachment
  const attachmentPoint = gl.COLOR_ATTACHMENT0;
  const level = 0;
  gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

  // make a depth buffer and the same size as the targetTexture
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    requestAnimationFrame(drawScene);



  var lastProgram = null;
  var lastVertex = null;
  var lastObjectId = 0;
  var lastMulColor = null;

  // Draw the scene.
  function drawScene(time) {
    time = time * 0.0005;
    framecount++;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
   
    // console.log(twgl.resizeCanvasToDisplaySize(canvas))
    webglUtils.resizeCanvasToDisplaySize(gl.canvas)
    // if (webglUtils.resizeCanvasToDisplaySize(gl.canvas)) {
    //   // the canvas was resized, make the framebuffer attachments match
    //   setFramebufferAttachmentSizes(gl.canvas.width, gl.canvas.height);
    //   // console.log(gl.canvas.width);
    // }
    
    

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // // Compute the projection matrix
    // var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    // var projectionMatrix =
    //     m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // // Compute the camera's matrix using look at.
    // var cameraPosition = [0, 0, 100];
    // var target = [0, 0, 0];
    // var up = [0, 1, 0];
    // var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // // Make a view matrix from the camera matrix.
    // var viewMatrix = m4.inverse(cameraMatrix);

    // var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // var sphereXRotation =  time;
    // var sphereYRotation =  time;
    // var cubeXRotation   = -time;
    // var cubeYRotation   =  time;
    // var coneXRotation   =  time;
    // var coneYRotation   = -time;

    // gl.useProgram(programInfo.program);

    // ------ Draw the sphere --------

    // Setup all the needed attributes.
    // gl.bindVertexArray(sphereVAO);
    // sphereUniforms.u_matrix = createNewMatrix(canvas, sphereTranslation, time, time);
    // cubeUniforms.u_matrix = createNewMatrix(canvas, cubeTranslation, -time, time);
    // coneUniforms.u_matrix = createNewMatrix(canvas, coneTranslation, time, -time);

    
    // Set the uniforms we just computed
    // twgl.setUniforms(programInfo, sphereUniforms);

    // twgl.drawBufferInfo(gl, sphereBufferInfo);

    // ------ Draw the cube --------

    // Setup all the needed attributes.
    // gl.bindVertexArray(cubeVAO);

    

    // Set the uniforms we just computed
    // twgl.setUniforms(programInfo, cubeUniforms);

    // twgl.drawBufferInfo(gl, cubeBufferInfo);

    // ------ Draw the cone --------

    // Setup all the needed attributes.
    // gl.bindVertexArray(coneVAO);
   

    // compute the portion of the near plane covers the 1 pixel
    // under the mouse.
    const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
    const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    
    const subLeft = left + pixelX * width / gl.canvas.width;
    const subBottom = bottom + pixelY * height / gl.canvas.height;
    const subWidth = 1 / gl.canvas.width;
    const subHeight = 1 / gl.canvas.height;

     // // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    
    // make a frustum for that 1 pixel
    var projectionMatrix = m4.frustum(
        subLeft,
        subLeft + subWidth,
        subBottom,
        subBottom + subHeight,
        near,
        far
      );

      // console.log(subLeft)

    m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.viewport(0, 0, 1, 1);

    // offscreen draws
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawObjects(null, canvas, time, gl, objectsToDraw, pickingProgramInfo);
    // const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
    // const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
    const data = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    var id = data[0];
    // console.log(data);
    
    // if( id !== lastObjectId && id >=1) {
    //   id = id - 1;
    //   // recover the old
    //   if( lastObjectId ) {
    //     objectsToDraw[lastObjectId].uniforms = lastMulColor;
    //   }

    //   if( id >= 0) {
    //     const selectedObject = objectsToDraw[id];
    //     // set new color
    //     lastMulColor = selectedObject.uniforms.u_colorMult;
    //     selectedObject.uniforms.u_colorMult = [1.0, 1.0, 0.0, 1.0];
    //     // preverse the new
    //     lastObjectId = id;
    //   }  
    // } else {
    //   objectsToDraw[lastObjectId].uniforms = lastMulColor;
    // }
    

    var aspect = canvas.clientWidth / canvas.clientHeight;
    projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, near, far);

    m4.multiply(projectionMatrix, viewMatrix, viewProjectionMatrix);
  
  // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    drawObjects(id, canvas, time, gl, objectsToDraw);

    // Set the uniforms we just computed
    // twgl.setUniforms(programInfo, coneUniforms);

    // twgl.drawBufferInfo(gl, coneBufferInfo);

  

    requestAnimationFrame(drawScene);
  }
  var mouseX = 0;
  var mouseY = 0;
  gl.canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
}



function drawObjects(id, canvas, time, gl, objectsToDraw, frameProgram) {

  objectsToDraw.forEach((element, i) => {
    var p = frameProgram ? frameProgram : element.programInfo;
   
    element.uniforms.u_world = createNewMatrix(
      canvas,
      element.translate,
      time * element.speedX,
      time * element.speedY
    );
    // console.log(id);

    element.uniforms.u_colorMult = id - 1 === i && (framecount & 0x8) ? [1.0, 0.0, 0.0, 1.0] : element.preserve;


    gl.useProgram(p.program);
    
    gl.bindVertexArray(element.vaoInfo);
    
    
    twgl.setUniforms(p, element.uniforms);
    twgl.drawBufferInfo(gl, element.bufferInfo);
  })
}

function createNewMatrix(canvas, t, rx, ry) {
    // var aspect = canvas.clientWidth / canvas.clientHeight;
    // var projectionMatrix =
    //     m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // // Compute the camera's matrix using look at.
    // var cameraPosition = [0, 0, 100];
    // var target = [0, 0, 0];
    // var up = [0, 1, 0];
    // var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // // Make a view matrix from the camera matrix.
    // var viewMatrix = m4.inverse(cameraMatrix);

    // var matrix = m4.multiply(projectionMatrix, viewMatrix);
    var matrix = m4.translation(t[0], t[1], t[2]);
    matrix = m4.xRotate(matrix, rx);
    matrix = m4.yRotate(matrix, ry);

    return matrix;


}

