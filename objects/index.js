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
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    twgl.setAttributePrefix("a_");
    const program = createShaderFromScript(gl, ["vertex", "frag"]);
    gl.useProgram(program.program);
    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, TILESAREA, TILESAREA);
    const planeVAO = twgl.createVAOFromBufferInfo(gl, program, planeBufferInfo);

    const torusBufferInfo = twgl.primitives.createTorusBufferInfo(gl, 2, .4, 255, 255);
    const torusVao = twgl.createVAOFromBufferInfo(gl, program, torusBufferInfo);

    const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(gl, 2, 255, 255);
    const sphereVao = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo);


    let U = getUniforms(gl);


    const canvas_w = canvas.width;
    const canvas_h = canvas.height;
    const ratio = canvas_w / canvas_h;
    const fieldView = angle(60);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
       
    var tick = function(time) {
        gl.viewport(0, 0, canvas_w, canvas_h);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        U.u_perspective = m4.perspective(fieldView, 1, ratio, 1000);
        // const la = m4.lookAt([Math.cos(time * .0001) * Math.PI * CAMERAPOSITION.X, CAMERAPOSITION.Y, Math.sin(time * .0001) * Math.PI * CAMERAPOSITION.Z], [0, 0, 0], [0, 1, 0]);
        const la = m4.lookAt([CAMERAPOSITION.X, CAMERAPOSITION.Y, CAMERAPOSITION.Z], [0, 0, 0], [0, 1, 0]);
        U.u_view = m4.inverse(la);

        U.u_lightOrigin = [Math.cos(time * .0005) * 20, 15, Math.sin(time * .0005) * 20]
        
        // draw plane
        U.u_ambientFactor = 2.0;
        U.u_color = [.85, .85, .85, 1.0];
        twgl.setUniforms(program, U);
        gl.bindVertexArray(planeVAO);
        twgl.drawBufferInfo(gl, planeBufferInfo);

        // draw torus
        twgl.setUniforms(program, Object.assign({}, {
          u_color: TORUSCOLOR,
          u_world: m4.translate(m4.identity(), 0, 2, 0),
          u_nochessboard: 2.0,
          u_ambientFactor: 1.0
        }));
        gl.bindVertexArray(torusVao);
        twgl.drawBufferInfo(gl, torusBufferInfo);

        // draw sphere
        twgl.setUniforms(program, Object.assign({
          u_color: SPHERECOLOR,
          u_world: m4.translate(m4.identity(), 8, 2, 0),
          u_ambientFactor: 1.0
        }));
        gl.bindVertexArray(sphereVao);
        twgl.drawBufferInfo(gl, sphereBufferInfo);



        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
}