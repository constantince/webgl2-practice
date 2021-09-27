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


function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");

    const renderProgram = createShaderFromScript(gl, ["vertex", "frag"]);
    const frameProgram = createShaderFromScript(gl, ["frame-vertex", "frame-frag"]);
    
    twgl.setAttributePrefix("a_");
    const SCALE = 0.5;
    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 2 * SCALE);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cubeBufferInfo);

    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 50, 50);
    const planeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, planeBufferInfo);

    const discBufferInfo = twgl.primitives.createDiscBufferInfo(gl, 2.0 * SCALE, 6);
    const discVao = twgl.createVAOFromBufferInfo(gl, renderProgram, discBufferInfo);

    const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(gl, 1.5 * SCALE, 255, 255);
    const sphereVao = twgl.createVAOFromBufferInfo(gl, renderProgram, sphereBufferInfo);

    const torusBufferInfo = twgl.primitives.createTorusBufferInfo(gl, 1 * SCALE, .2 * SCALE, 255, 255);
    const torusVao = twgl.createVAOFromBufferInfo(gl, renderProgram, torusBufferInfo);

    const cylindarBufferInfo = twgl.primitives.createCylinderBufferInfo(gl, 1 * SCALE, 2 * SCALE, 255, 10);
    const cylindarVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cylindarBufferInfo);
    
    // render scenc matrixs
    // const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
    // const render_view = m4.lookAt(LOOKAT, [0, 0, 0], [0, 1, 0]);
    
    // render shadow matrixs
    const framePerspective = m4.perspective(fieldView, OFFSCREEN_WIDTH / OFFSCREEN_HEIGH, 0.5, 1000);
    const frameLookAt = m4.lookAt(LIGHTSOURCE, [0, 0, 0], [0, 1, 0]);

    const {fbo, texture} = createFrameBuffer(gl);
    //scene
    const sence = [
      {
        name: 'cylindar',
        buffer: cylindarBufferInfo,
        vao: cylindarVao,
        calculateTheUniforms: function(time) {
          const translation = m4.translate(m4.identity(), -1.5, 1.0, 2);
          const transformMatrix = m4.axisRotate(translation, [1, 1, 1], toRedius(time * 0.00001));
          return {
            u_use_shadow: true,
            u_color: [1.0, 0.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'torus',
        buffer: torusBufferInfo,
        vao: torusVao,
        calculateTheUniforms: function(time) {
          const transform = m4.translate(m4.identity(), 1, 1.0, 2.5);
          const transformMatrix = m4.axisRotate(transform, [1, 1, 1], toRedius(time * 0.00001));
          return {
            u_use_shadow: true,
            u_color: [1.0, 1.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'sphere',
        buffer: sphereBufferInfo,
        vao: sphereVao,
        calculateTheUniforms: function(time) {
          const translation = m4.translate(m4.identity(), 3, 1.0, -3);
          const rotation = twgl.m4.rotateY(m4.identity(), toRedius(time * 0.00001));
          const transformMatrix = m4.multiply(rotation, translation);
          return {
            u_use_shadow: true,
            u_color: [0.0, 1.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'disc',
        buffer: discBufferInfo,
        vao: discVao,
        calculateTheUniforms: function(time) {
          let tanslate = m4.translate(m4.identity(), 2, 2, 1.1);
          //tanslate = twgl.m4.rotateX(tanslate, toRedius(90));
          const transformMatrix = m4.axisRotate(tanslate, [1, 0, 0], toRedius(time * 0.00001));
          return {
            u_color: [1.0, 1.0, 1.0, 1.0],
            u_use_shadow: true,
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'cube',
        buffer: cubeBufferInfo,
        vao: cubeVao,
        calculateTheUniforms: function(time) {
          const transformMatrix = m4.translate(m4.identity(), 0, Math.sin(time * 0.001) + 2.5, 0);
          return {
            u_color: [.34, .78, .98, 1.0],
            u_use_shadow: true,
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'plane',
        buffer: planeBufferInfo,
        vao: planeVao,
        calculateTheUniforms: function(time) {
          const transformMatrix = m4.translate(m4.identity(), 0, -1, 0);
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

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var tick = function(time) {
          // render scenc matrixs
        const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
        const render_view = m4.lookAt([10, 6, Math.sin(time* 0.00013) * 10], [0, 0, 0], [0, 1, 0]);

        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(frameProgram.program);
       
        // render frame buffer for shadows
        twgl.setUniforms(frameProgram, {
          u_projection: framePerspective,
          u_view: m4.inverse(frameLookAt)
        });

        sence.forEach(item => {
          const {buffer, vao, calculateTheUniforms} = item;
          twgl.setUniforms(frameProgram, calculateTheUniforms(time));
          gl.bindVertexArray(vao);
          twgl.drawBufferInfo(gl, buffer);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // render color buffer
        gl.viewport(0, 0, canvas.width, canvas.height);
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
          u_viewDirection: LOOKAT,
          u_color: [1.0, 1.0, 1.0, 1.0]
        });

        sence.forEach(item => {
          const {buffer, vao, calculateTheUniforms} = item;
          twgl.setUniforms(renderProgram, calculateTheUniforms(time));
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

  return {fbo, texture}
}

