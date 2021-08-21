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
const d1 = new Float32Array([
  0.2, 0.2, 0.0, 1.0, 0.0, 0.0,
  -0.2, 0.2, 0.0, 1.0, 0.0, 0.0,
  0.2, -0.2, 0.0, 1.0, 0.0, 0.0
]);

const d2 = new Float32Array([
  0.7, 0.7, 0.0, 1.0, 1.0, 0.0,
  -0.5, 0.5, 0.0, 1.0, 1.0, 0.0,
  0.4, -0.4, 0.0, 1.0, 1.0, 0.0
]);

const d11 = new Float32Array([
  0.5, 0.5, 0.0,
  -0.5, 0.5, 0.0,
  0.5, -0.5, 0.0
]);

const p = new Float32Array([0.0])
// const d2 = new Float32Array([0.5, 0.5]);

function createVAO (gl, program, d) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);


  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
  const size = d.BYTES_PER_ELEMENT;
  const a_postion = gl.getAttribLocation(program, "a_position");
  const a_color = gl.getAttribLocation(program, "a_color");
  gl.vertexAttribPointer(a_postion, 3, gl.FLOAT, false, size * 6, 0);
  gl.enableVertexAttribArray(a_postion);
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, size * 6, size * 3);
  gl.enableVertexAttribArray(a_color);

  return vao;
}

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");

    const program = twgl.createProgramInfo(gl, createShaderFromScript(["vertex", "frag"]));
    gl.useProgram(program.program);

    const triangleVAO1 = createVAO(gl, program.program, d1);
    const triangleVAO2 = createVAO(gl, program.program, d2);

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var tick = function(time) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(triangleVAO1);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
        gl.bindVertexArray(triangleVAO2);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
}