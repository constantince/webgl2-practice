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

const AMBIENTCOLOR = [0.1, 0.1, 0.1];
const AMBIENTMATERIAL = 0.63;
const DIFFUSECOLOR = [1.0, 1.0, 1.0];
const DIFFUSEMATERIAL = 2.0;
const SPECULARCOLOR = [1.0, 1.0, 1.0];
const SPECULARM = 2.0;
const LIGHTSOURCE = [2.3, 4.0, 3.5];
const LOOKAT = [5, 5, 10];



function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");

    const renderProgram = createShaderFromScript(gl, ["vertex", "frag"]);

    twgl.setAttributePrefix("a_");

    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 2);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cubeBufferInfo);

    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 20, 20);
    const planeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, planeBufferInfo);
    
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
          const transformMatrix = m4.axisRotate(m4.identity(), [0, 1, 0], toRedius(time * 0.00001));
          return {
            u_ambientM: 0.7,
            u_diffuseM: 0.8,
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
          const transformMatrix = m4.translate(m4.identity(), 0, -2, 0);
          return {
            u_ambientM: 0.2,
            u_diffuseM: 0.4,
            u_specularM: 0.6,
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
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(renderProgram.program);

        twgl.setUniforms(renderProgram, {
          u_projection: render_project,
          u_view: m4.inverse(render_view),
          //u_world: m4.axisRotate(m4.identity(), [1, 1, 1], toRedius(time * 0.00001)),
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
        })



        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
}