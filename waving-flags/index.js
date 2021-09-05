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
    const program = twgl.createProgramInfo(gl, ["vertex", "frag-jan"]);

    return program;
}


function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    // let program = twgl.createProgramInfo(gl, ["vertex", "frag-usa"]);
    const selector = document.querySelector(".selector");
    let currentCountry = "frag-china";
    selector.addEventListener("change", (e) => {
      // const currentCountry = e.target.value;
      program = countries[e.target.value];
    }); 
    let countries = {};

    countries["frag-usa"] = twgl.createProgramInfo(gl, ["vertex", "frag-usa"]);
    countries["frag-germany"] = twgl.createProgramInfo(gl, ["vertex", "frag-germany"]);
    countries["frag-japan"] = twgl.createProgramInfo(gl, ["vertex", "frag-japan"]);
    countries["frag-china"] = twgl.createProgramInfo(gl, ["vertex", "frag-china"]);
    countries["frag-france"] = twgl.createProgramInfo(gl, ["vertex", "frag-france"]);
    countries["frag-english"] = twgl.createProgramInfo(gl, ["vertex", "frag-english"]);
    
    let program = countries[currentCountry];

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");

    
    const arrays = {
      a_position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
    };

    const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
    const vao = twgl.createVAOFromBufferInfo(gl, program, bufferInfo);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 1.0);
    
    var tick = function(time) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program.program);
        const unifroms = {
          u_resolution: [canvas.width, canvas.height],
          u_time: time * 0.001
        }
        gl.bindVertexArray(vao);
        twgl.setUniforms(program, unifroms);
        twgl.drawBufferInfo(gl, bufferInfo);

        window.requestAnimationFrame(tick);

    }

    window.requestAnimationFrame(tick);
}