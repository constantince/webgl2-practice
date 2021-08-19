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


//webglUtils  twgl
function main() {
    // console.log(webglUtils, twgl, m4);
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    const programInfo = twgl.createProgramInfo(gl, createShaderFromScript(["vertex", "frag"]));
    const programInfo2 = twgl.createProgramInfo(gl, createShaderFromScript(["vertex2", "frag2"]));

  
    // gl.enable(gl.DEPTH_TEST);
    // gl.clearColor(0.0);
    // gl.clearColor(0.0);

    gl.useProgram(programInfo.program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0]), gl.STATIC_DRAW);

    // const lo = gl.getAttribLocation(programInfo.program, "a_position");
    gl.vertexAttribPointer(0, 1, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0); // ==>  gl.getAttribLocation(programInfo.program, "a_position");  gl.getAttribLocation(programInfo2.program, "a_position");

    const buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1.0, 0.0, 0.0, 1.0]), gl.STATIC_DRAW);

    const lo1 = gl.getAttribLocation(programInfo.program, "a_color");
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

   
    gl.drawArrays(gl.POINTS, 0, 1);





    // the second shader

    gl.useProgram(programInfo2.program);

    // const buffer2 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0, 1.0, 1.0, 1.0]), gl.STATIC_DRAW);
    // const lo2 = gl.getAttribLocation(programInfo.program, "a_color");
    // gl.vertexAttribPointer(lo2, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(lo2);

    gl.drawArrays(gl.POINTS, 0, 1);



    
}