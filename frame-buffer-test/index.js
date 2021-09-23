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

function deAngle(a) {
  return a * 180 / Math.PI;
}

function initVertexBuffersForPlane(gl) {
  // Create a plane
  //  v1------v0
  //  |        | 
  //  |        |
  //  |        |
  //  v2------v3

  // Vertex coordinates
  var vertices = new Float32Array([
    3.0, -1.7, 2.5,  -3.0, -1.7, 2.5,  -3.0, -1.7, -2.5,   3.0, -1.7, -2.5    // v0-v1-v2-v3
  ]);

  // Colors
  var colors = new Float32Array([
    1.0, 1.0, 1.0,    1.0, 1.0, 1.0,  1.0, 1.0, 1.0,   1.0, 1.0, 1.0
  ]);

  // Indices of the vertices
  var indices = new Uint8Array([0, 1, 2,   0, 2, 3]);

  var o = new Object(); // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initVertexBuffersForTriangle(gl) {
  // Create a triangle
  //       v2
  //      / | 
  //     /  |
  //    /   |
  //  v0----v1

  // Vertex coordinates
  var vertices = new Float32Array([-0.8, 3.5, 0.0,  0.8, 3.5, 0.0,  0.0, 3.5, 1.8]);
  // Colors
  var colors = new Float32Array([1.0, 0.5, 0.0,  1.0, 0.5, 0.0,  1.0, 0.0, 0.0]);    
  // Indices of the vertices
  var indices = new Uint8Array([0, 1, 2]);

  var o = new Object();  // Utilize Object object to return multiple buffer objects together

  // Write vertex information to buffer object
  o.vertexBuffer = initArrayBufferForLaterUse(gl, vertices, 3, gl.FLOAT);
  o.colorBuffer = initArrayBufferForLaterUse(gl, colors, 3, gl.FLOAT);
  o.indexBuffer = initElementArrayBufferForLaterUse(gl, indices, gl.UNSIGNED_BYTE);
  if (!o.vertexBuffer || !o.colorBuffer || !o.indexBuffer) return null; 

  o.numIndices = indices.length;

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return o;
}

function initArrayBufferForLaterUse(gl, data, num, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

  // Store the necessary information to assign the object to the attribute variable later
  buffer.num = num;
  buffer.type = type;

  return buffer;
}

function initElementArrayBufferForLaterUse(gl, data, type) {
  // Create a buffer object
  var buffer = gl.createBuffer();
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);

  buffer.type = type;

  return buffer;
}

// Assign the buffer objects and enable the assignment
function initAttributeVariable(gl, a_attribute, buffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, buffer.num, buffer.type, false, 0, 0);
  gl.enableVertexAttribArray(a_attribute);
}

const fileView = deAngle(60);
const OFFSCREEN_HEIGHT = 2048;
const OFFSCREEN_WIDTH = 2048;
function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
      
    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    twgl.setAttributePrefix("a_");
    const program = createShaderFromScript(gl, ["vertex", "frag"]);
    const fprogram = createShaderFromScript(gl, ["frame-buffer-vertex", "frame-buffer-frag"]);
    

    
    const {fbo, texture} = frameBuffer(gl);
    
    
    // gl.useProgram(program.program);
    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, program, cubeBufferInfo);
    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 10, 10);
    const planeVao = twgl.createVAOFromBufferInfo(gl, program, planeBufferInfo);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var tick = function(time) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.cullFace(gl.FRONT);
        // frame buffer
        
        const frame_projection = m4.perspective(fileView, 1, 1, 1000);
        const frame_camera = m4.lookAt([10, 5, 2], [0, 0, 0], [0, 1, 0]);
        const frame_world = m4.identity();
        const frame_cube_world = m4.translate(m4.identity(), 0, Math.abs(Math.sin(time * 0.001)) + .3, 0);
        gl.useProgram(fprogram.program);
        twgl.setUniforms(fprogram, {
          u_projection: frame_projection,
          u_view: m4.inverse(frame_camera),
          u_world: frame_cube_world
        });
       
        // initAttributeVariable(gl, aPosition, triangle.vertexBuffer);
        // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangle.indexBuffer);
        
        // gl.drawElements(gl.TRIANGLES, triangle.numIndices, gl.UNSIGNED_BYTE, 0);

        gl.bindVertexArray(cubeVao);
        twgl.drawBufferInfo(gl, cubeBufferInfo);
        twgl.setUniforms(fprogram, {
          u_world: frame_world
        });
        gl.bindVertexArray(planeVao);
        twgl.drawBufferInfo(gl, planeBufferInfo);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.cullFace(gl.BACK);


        // render buffer
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program.program);
        const render_projection = m4.perspective(fileView, 1, 1, 100);
        const render_camera = m4.lookAt([Math.cos(time * 0.0001) * 5, 10, Math.sin(time * 0.0001) * 5], [0, 0, 0], [0, 1, 0]);
        const render_world = m4.identity();

        twgl.setUniforms(program, {
          u_projection: render_projection,
          u_view: m4.inverse(render_camera),
          u_world: frame_cube_world,
          u_frame_projection: frame_projection,
          u_frame_view: m4.inverse(frame_camera),
          u_frame_world: frame_cube_world,
          u_texture: texture,
          u_color: [1.0, 0.0, 0.0]
        });

        gl.bindVertexArray(cubeVao);
        twgl.drawBufferInfo(gl, cubeBufferInfo);

        twgl.setUniforms(program, {
          u_color: [1.0, 1.0, 1.0],
          u_world: m4.identity(),
          u_frame_world: m4.identity()
        });
        gl.bindVertexArray(planeVao);
        twgl.drawBufferInfo(gl, planeBufferInfo);

        window.requestAnimationFrame(tick);

    }

    window.requestAnimationFrame(tick);
}

function frameBuffer(gl) {
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const renderBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer)

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
   

    return {fbo, texture};
}