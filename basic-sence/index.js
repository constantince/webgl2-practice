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

const AMBIENTCOLOR = [0.1, 0.1, 0.1, 1.0];
const AMBIENTMATERIAL = 0.63;
const DIFFUSECOLOR = [1.0, 1.0, 1.0, 1.0];
const DIFFUSEMATERIAL = 2.0;
const SPECULARCOLOR = [1.0, 1.0, 1.0, 1.0];
const SPECULARM = 2.0;
const LIGHTSOURCE = [5, 6, 7];
const LOOKAT = [5, 5, 5];

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");

    const renderProgram = createShaderFromScript(gl, ["vertex", "frag"]);

    twgl.setAttributePrefix("a_");

    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 1);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cubeBufferInfo);
    
    // render scenc matrixs
    const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
    const render_view = m4.lookAt(LOOKAT, [0, 0, 0], [0, 1, 0]);


    //scene
    const sence = [
      {
        name: 'cube',
        buffer: cubeBufferInfo,
        vao: cubeVao,
        calculateTheUniforms: function(time) {
          const rotation = m4.axisRotate(m4.identity(), [0, 1, 0], toRedius(time * 0.00001));
          return {
            u_world: rotation,
            u_normalMatrix: m4.inverse(rotation)
          }
        }
      }
    ]

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    var tick = function(time) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(renderProgram.program);

        twgl.setUniforms(renderProgram, {
          u_projection: render_project,
          u_view: m4.inverse(render_view),
          //u_world: m4.axisRotate(m4.identity(), [1, 1, 1], toRedius(time * 0.00001)),
          u_lightSource: LIGHTSOURCE,
          u_ambientColor: AMBIENTCOLOR,
          u_ambientM: AMBIENTMATERIAL,
          u_diffuseColor: DIFFUSECOLOR,
          u_diffuseM: DIFFUSEMATERIAL,
          u_specularColor: SPECULARCOLOR,
          u_specularM: SPECULARM,
          u_viewDirection: LOOKAT,
          u_color: [1.0, 1.0, 1.0, 1.0]
        });




        sence.forEach(item => {
          const {buffer, vao, calculateTheUniforms} = item;
          twgl.setUniforms(renderProgram, calculateTheUniforms(time));
          gl.bindVertexArray(vao);
          twgl.drawBufferInfo(gl, buffer);
        })



        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
}