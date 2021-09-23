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


function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2", {
      antialias: true
    }) ||
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

    const discBufferInfo = twgl.primitives.createDiscBufferInfo(gl, 4, 100);
    const discVao = twgl.createVAOFromBufferInfo(gl, program, discBufferInfo);

    var fbo = initFramebufferObject(gl);
    // var { depthTexture, depthFramebuffer } = makeShadowBuffer(gl);
    if (!fbo) {
      console.log('Failed to initialize frame buffer object');
      return;
    }

    let mutipleThings = [
      // {
      //   name: "disc",
      //   buffer: discBufferInfo,
      //   vao: discVao,
      //   world: m4.translate(m4.identity(), 8, 4, -8),
      //   uniforms: {
      //     u_color: DISCCOLOR,
      //     u_world: m4.identity(),
      //     u_nochessboard: 2.0,
      //     u_ambientFactor: 1.0
      //   }
      // },
      
      // {
      //   name: "torus",
      //   buffer: torusBufferInfo,
      //   vao: torusVao,
      //   world: m4.translate(m4.identity(), 0, 2, 8),
      //   uniforms: {
      //     u_color: TORUSCOLOR,
      //     u_world: m4.identity(),
      //     u_nochessboard: 2.0,
      //     u_ambientFactor: 1.0
      //   }
      // },
      // {
      //   name: "sphere",
      //   buffer: sphereBufferInfo,
      //   vao: sphereVao,
      //   world: m4.translate(m4.identity(), 0, 2, 0),
      //   uniforms: {
      //     u_color: SPHERECOLOR,
      //     u_world: m4.identity(),
      //     u_ambientFactor: 1.0
      //   }
      // },
      // {
      //   name: "cylindar",
      //   buffer: cylindarBufferInfo,
      //   vao: cylindarVao,
      //   world:  m4.translate(m4.identity(), -8, 3, 0),
      //   uniforms: {
      //     u_color: CYLINDARCOLOR,
      //     u_world: m4.identity(),
      //     u_ambientFactor: 1.0
      // }
      // },
      {
        name: 'cube',
        buffer: cubeBufferInfo,
        vao: cubeVao,
        uniforms: {
          u_color: [1.0, 0.0, 0.0, 1.0],
          u_world: m4.identity()
         
        }
      },
      {
        name: "floor",
        buffer: planeBufferInfo,
        vao: planeVAO,
        uniforms: {
          u_color: [1.0, 1.0, 1.0, 1.0],
          u_world: m4.translate(m4.identity(), 0, -2, 0)
          
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

        // U.u_innerLimit = Math.cos(angle(settings.fieldOfView / 2 - 10));
        // U.u_outerLimit = Math.cos(angle(settings.fieldOfView / 2));

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
        //   if( target.name !== "floor") {
        //     settings.currentObject = target.name;
        //   }
          
        //   clicked = false;
        // }
        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // U.u_lightOrigin = [Math.cos(time * .0005) * 20, 10, Math.sin(time * .0005) * 20];
        // U.u_lightOrigin = [settings.posX, settings.posY, settings.posZ];
        // U.u_lightOrigin = LIGHTORIGIN;
        /*----------------- draw shadows ---------------- */
        // gl.cullFace(gl.FRONT);
        gl.useProgram(programShadow.program);
       
       
        
        gl.viewport(0, 0, canvas_w, canvas_h);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        

        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        const u_projection = m4.perspective(fieldView, 1, 1, 1000);
        // // const shadowMatrix_projection = m4.orthographic(512, 512, 512, 512, 1, 1000);
        const u_view = m4.lookAt([10, 10, 10], [0, 0, 0], [0, 1, 0]);
        // const shadowMatrix = m4.multiply(shadowMatrix_projection, m4.inverse(shadowMatrix_view));
        // U.u_shadowMatrix = shadowMatrix;
        
        twgl.setUniforms(programShadow, {
          u_projection,
          u_view: m4.inverse(u_view),
          u_world: m4.identity()
        });

        mutipleThings.forEach(element => {
          // const u = element.uniforms.u_world;
          // const m = element.world;

        //   if( element.name === settings.currentObject) {
        //      element.uniforms.u_world = m4.translate(m, 0, Math.sin(time * 0.005) + 2, 0);
        //   } else {
        //      element.uniforms.u_world = m;
        //   }
        //   // element.uniforms.u_samplerShadow = fbo.texture;
        //   element.uniforms.u_normalMatrix = m4.inverse(element.uniforms.u_world);
          twgl.setUniforms(programShadow, element.uniforms);
        //   // console.log('uniforms in shadows:', element.uniforms.u_world)
           gl.bindVertexArray(element.vao);
           twgl.drawBufferInfo(gl, element.buffer);
        });

        // // gl.cullFace(gl.BACK);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        

        /*----------------- draw color buffer---------------- */
        
        gl.useProgram(program.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, canvas_w, canvas_h);
        const la = m4.lookAt([Math.cos(time * .0001) * CAMERAPOSITION.X, CAMERAPOSITION.Y, Math.sin(time * .0001) * CAMERAPOSITION.Z], [0, 0, 0], [0, 1, 0]);
        gl.activeTexture(gl.TEXTURE0); // Set a texture object to the texture unit
        gl.bindTexture(gl.TEXTURE_2D, fbo.texture);
        twgl.setUniforms(program, {
          u_perspective : m4.perspective(fieldView, 1, ratio, 1000),
          u_view: m4.inverse(la),
          u_world: m4.identity(),
          u_samplerShadow: 0
        });
        
        // let textureMatrix = m4.identity();
       
        // // console.log(fbo.texture);
        // U.u_samplerShadow = 0;
        // const offset = .5;
        // textureMatrix = m4.translate(textureMatrix, offset, offset, offset);
        // textureMatrix = m4.scale(textureMatrix, offset, offset, offset);
        // textureMatrix = m4.multiply(textureMatrix, shadowMatrix_projection);
        // textureMatrix = m4.multiply(textureMatrix, m4.inverse(shadowMatrix_view));

        
        // U.u_shadowMatrix1 = textureMatrix;
        

        mutipleThings.forEach(element => {
          gl.bindVertexArray(element.vao);
          // console.log('uniforms in color buffer:', element.uniforms.u_world)
          twgl.setUniforms(program, element.uniforms);
         
          twgl.drawBufferInfo(gl, element.buffer);
        });
        

        window.requestAnimationFrame(tick);
    }

    // UI(tick);

    window.requestAnimationFrame(tick);
}

