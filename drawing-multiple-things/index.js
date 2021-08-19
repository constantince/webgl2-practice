function createShaderFromScript(scriptId) {
  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw ("*** Error: unknown script element" + scriptId);
  } 

  const text = shaderScript.text;
 

  return text;
}

function createShader(scriptIds) {
  let shaders = [createShaderFromScript(scriptIds[0]), createShaderFromScript(scriptIds[1])];

  if(shaders.length <= 1) {
    console.warn("shaders text error", shaders)
  }

  return shaders;
}

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

  
  var sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(gl, 10, 12, 6);
  var cubeBufferInfo   = flattenedPrimitives.createCubeBufferInfo(gl, 20);
  var coneBufferInfo   = flattenedPrimitives.createTruncatedConeBufferInfo(gl, 10, 0, 20, 12, 1, true, false);

  // setup GLSL program
  var programInfo = twgl.createProgramInfo(gl, createShader(["vertex", "frag"]));

  // console.log(programInfo);
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

  function rand(min, max) {
    if (max === undefined) {
      max = min;
      min = 0;
    }
    return Math.random() * (max - min) + min;
  }
  for(let i=0; i< 50; i++) {
    const s = {
        ...shapes[Math.floor(Math.random(10) * 3)],
        translate: [rand(-100, 100), rand(-100, 100), rand(-150, -50)],
        speedX: rand(0, 1),
        speedY: rand(1.1, 1.5),
        uniforms: {
          u_colorMult:[rand(0, 1), rand(0, 1), rand(0, 1), 1],
          u_matrix: m4.identity()
        }
       
      }
    objectsToDraw.push(s);
  }

  requestAnimationFrame(drawScene);


  var lastProgram = null;
  var lastVertex = null;

  // Draw the scene.
  function drawScene(time) {
    time = time * 0.0005;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    twgl.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

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

    

    // Set the uniforms we just computed
    // twgl.setUniforms(programInfo, coneUniforms);

    // twgl.drawBufferInfo(gl, coneBufferInfo);

    objectsToDraw.forEach(element => {
      element.uniforms.u_matrix = createNewMatrix(
        canvas,
        element.translate,
        time * element.speedX,
        time * element.speedY
      );

      if(lastProgram !== element.programInfo.program) {
        gl.useProgram(element.programInfo.program);
        lastProgram = element.programInfo.program;
      }

      if(lastVertex !== element.vaoInfo) {
        gl.bindVertexArray(element.vaoInfo);
        lastVertex = element.vaoInfo;
      }
      
      
      twgl.setUniforms(element.programInfo, element.uniforms);
      twgl.drawBufferInfo(gl, element.bufferInfo);
    })

    requestAnimationFrame(drawScene);
  }
}

function createNewMatrix(canvas, t, rx, ry) {
    var aspect = canvas.clientWidth / canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [0, 0, 100];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var matrix = m4.multiply(projectionMatrix, viewMatrix);
    matrix = m4.translate(matrix, t[0], t[1], t[2]);
    matrix = m4.xRotate(matrix, rx);
    matrix = m4.yRotate(matrix, ry);

    return matrix;


}

