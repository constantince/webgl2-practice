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

function angle(a) {
  return a * Math.PI / 180;
}
const settings = {
  cameraX: 6,
  cameraY: 5,
  posX: 2.5,
  posY: 4.8,
  posZ: 4.3,
  targetX: 2.5,
  targetY: 0,
  targetZ: 3.5,
  projWidth: 1,
  projHeight: 1,
  perspective: true,
  fieldOfView: 120,
};

function UI(render) {

  webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    { type: 'slider',   key: 'cameraX',    min: -40, max: 40, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'cameraY',    min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posX',       min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posY',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posZ',       min:   1, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetX',    min: -10, max: 10, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetY',    min:   0, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetZ',    min: -10, max: 20, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projWidth',  min:   0, max:  2, change: render, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projHeight', min:   0, max:  2, change: render, precision: 2, step: 0.001, },
    { type: 'checkbox', key: 'perspective', change: render, },
    { type: 'slider',   key: 'fieldOfView', min:  1, max: 179, change: render, },
  ]);
}

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    addMouseUp(canvas);

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    twgl.setAttributePrefix("a_");
    const program = createShaderFromScript(gl, ["vertex", "frag"]);
    const programFrame = createShaderFromScript(gl, ['f-vertex', 'f-frag']);
    const programShadow = createShaderFromScript(gl, ['shadow-vertex', 'shadow-frag']);
    gl.useProgram(program.program);

    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, TILESAREA, TILESAREA);
    const planeVAO = twgl.createVAOFromBufferInfo(gl, program, planeBufferInfo);

    const torusBufferInfo = twgl.primitives.createTorusBufferInfo(gl, 2, .4, 255, 255);
    const torusVao = twgl.createVAOFromBufferInfo(gl, program, torusBufferInfo);

    const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(gl, 2, 255, 255);
    const sphereVao = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo);

    const cylindarBufferInfo = twgl.primitives.createCylinderBufferInfo(gl, 2, 4, 255, 10);
    const cylindarVao = twgl.createVAOFromBufferInfo(gl, program, cylindarBufferInfo);

    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 4);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, program, cubeBufferInfo);

    const cresentBufferInfo = twgl.primitives.createCresentBufferInfo(gl, 5, 7, 8, 1, 255);
    const cresentVao = twgl.createVAOFromBufferInfo(gl, program, cresentBufferInfo);

    // depth buffer
    const fb = makeBuffer(gl);

    // shadow buffer
    const { depthFramebuffer, depthTexture} = makeShadowBuffer(gl)

    let U = {
      ...getUniforms(gl),
      u_samplerShadow: depthTexture,
      u_ambientFactor: 2.0,
      u_color: [.85, .85, .85, 1.0]
    }

    let mutipleThings = [
      {
        name: "floor",
        buffer: planeBufferInfo,
        vao: planeVAO,
        uniforms: U
      },
      {
        name: "torus",
        buffer: torusBufferInfo,
        vao: torusVao,
        uniforms: {
          u_color: TORUSCOLOR,
          u_world: m4.translate(m4.identity(), 0, 2, 0),
          u_nochessboard: 2.0,
          u_ambientFactor: 1.0
        }
      },
      {
        name: "sphere",
        buffer: sphereBufferInfo,
        vao: sphereVao,
        uniforms: {
          u_color: SPHERECOLOR,
          u_world: m4.translate(m4.identity(), 8, 2, 0),
          u_ambientFactor: 1.0
        }
      },
      {
        name: "cylindar",
        buffer: cylindarBufferInfo,
        vao: cylindarVao,
        uniforms: {
          u_color: CYLINDARCOLOR,
          u_world: m4.translate(m4.identity(), -8, 2, 0),
          u_ambientFactor: 1.0
      }
      },
      {
        name: 'cube',
        buffer: cubeBufferInfo,
        vao: cubeVao,
        uniforms: {
          u_color: CUBECOLOR,
          u_world: m4.translate(m4.identity(), 0, 2, -8),
          u_ambientFactor: 1.0
        }
      },
      // {
      //   name: 'cresent',
      //   buffer: cresentBufferInfo,
      //   vao: cresentVao,
      //   uniforms : {
      //     u_color: CUBECOLOR,
      //     u_world: m4.identity(),
      //     u_ambientFactor: 1.0
      //   }
      // }
    ];


    const canvas_w = canvas.width;
    const canvas_h = canvas.height;
    const ratio = canvas_w / canvas_h;
    const fieldView = angle(60);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
       
    var tick = function(time) {
       
        
        /*----------------- draw frame buffer---------------- */
        // draw depth buffer
        // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        // gl.viewport(0, 0, canvas_w, canvas_h);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.useProgram(programFrame.program);
        // mutipleThings.forEach((element, id) => {
        //   let {uniforms, vao, buffer} = element;
        //   uniforms.u_frameColor = [
        //     ((id >>  0) & 0xFF) / 0xFF,
        //     ((id >>  8) & 0xFF) / 0xFF,
        //     ((id >> 16) & 0xFF) / 0xFF,
        //     ((id >> 24) & 0xFF) / 0xFF
        //   ];
        //   twgl.setUniforms(programFrame, uniforms);
        //   gl.bindVertexArray(vao);
        //   twgl.drawBufferInfo(gl, buffer);
        // });

        // /*----------------- click objects ---------------- */
        // if(clicked === true) {
        //   const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
        //   const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
        //   const data = new Uint8Array(4);
        //   gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
        //   const index = data[0];
        //   let target = {name: null};
        //   if(index > -1) {
        //     target = mutipleThings[index];
        //   }
        //   console.log(target.name, 'was clicked');
        //   clicked = false;
        // }
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // U.u_lightOrigin = [Math.cos(time * .0005) * 20, 10, Math.sin(time * .0005) * 20];
        U.u_lightOrigin = [settings.posX, settings.posY, settings.posZ];
        /*----------------- draw shadows ---------------- */
        gl.useProgram(programShadow.program);
        gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
        gl.viewport(0, 0, canvas_w, canvas_h);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        const shadowMatrix_projection = m4.perspective(fieldView, settings.projWidth / settings.projHeight, .5, 1000);
        // const shadowMatrix_projection = m4.orthographic(512, 512, 512, 512, 1, 1000);
        const shadowMatrix_view = m4.lookAt(U.u_lightOrigin, [settings.targetX, settings.targetY, settings.targetZ], [0, 1, 0]);
        const shadowMatrix = m4.multiply(shadowMatrix_projection, m4.inverse(shadowMatrix_view));
        U.u_shadowMatrix = shadowMatrix;
        mutipleThings.forEach(element => {
          // const u = element.uniforms.u_world;
          // if( element.name === "cresent") {
          //   const m = m4.translate(m4.identity(), 0, 2, 8);
          //   element.uniforms.u_world = m4.axisRotate(m, [0, 0, 1], Math.sin(angle(time * 0.01)) * 3.141592);
          // } else {
          //   element.uniforms.u_world = u;
          // }
          twgl.setUniforms(programShadow, element.uniforms);
          // console.log('uniforms in shadows:', element.uniforms.u_world)
          gl.bindVertexArray(element.vao);
          twgl.drawBufferInfo(gl, element.buffer);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        /*----------------- draw color buffer---------------- */
        
        gl.useProgram(program.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas_w, canvas_h);
        
        U.u_perspective = m4.perspective(fieldView, 1, ratio, 1000);
        // let newMatrix = m4.identity();
        // const offset = .9;
        // newMatrix = m4.scale(newMatrix, offset, offset, offset);
        // newMatrix = m4.translate(newMatrix, offset, offset, offset);
        // newMatrix = m4.multiply(shadowMatrix, newMatrix);
        // U.u_samplerShadow = depthTexture;
        U.u_shadowMatrix1 = shadowMatrix;
        // const la = m4.lookAt([Math.cos(time * .0001) * Math.PI * CAMERAPOSITION.X, CAMERAPOSITION.Y, Math.sin(time * .0001) * Math.PI * CAMERAPOSITION.Z], [0, 0, 0], [0, 1, 0]);
        const la = m4.lookAt([settings.cameraX, settings.cameraY, 10], [0, 0, 0], [0, 1, 0]);
        U.u_view = m4.inverse(la);
       
       

        mutipleThings.forEach(element => {
          // console.log('uniforms in color buffer:', element.uniforms.u_world)
          twgl.setUniforms(program, element.uniforms);
          gl.bindVertexArray(element.vao);
          twgl.drawBufferInfo(gl, element.buffer);
        });
        

        // window.requestAnimationFrame(tick);
    }

    UI(tick);

    window.requestAnimationFrame(tick);
}

