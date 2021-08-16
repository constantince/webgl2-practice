// const mat4 = glMatrix.mat4;
const {mat4, glMatrix} = window.glMatrix;
//webglUtils  twgl mat4
function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const webgl = canvas.getContext("webgl2");
    webgl.enable(webgl.CULL_FACE);
    webgl.enable(webgl.DEPTH_TEST);
    webgl.clearColor(0.0, 0.0, 0.0, 1.0);
    webgl.viewport(0, 0, canvas.width, canvas.height);
    twgl.setAttributePrefix("a_");
    const program = webglUtils.createProgramFromScripts(webgl, ["vertex", "frag"]);
    webgl.useProgram(program);
    const sphereBufferInfo = flattenedPrimitives.createSphereBufferInfo(webgl, 10, 12, 6);
    const sphereVOAInfo = twgl.createVAOFromBufferInfo(webgl, program, sphereBufferInfo);

    webgl.bindVertexArray(sphereVOAInfo);

    const sphereUniforms = {
        u_color: [0.5, 1.0, 0.5, 1.0]
    }
   
    
    sphereUniforms.u_matrix = createMatrix(canvas);
    twgl.setUniforms(program, sphereUniforms);
    console.log(sphereUniforms)
    var tick = function(time) {
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

        
        // twgl.resizeCanvasToDisplaySize(canvas);
        twgl.drawBufferInfo(webgl, sphereBufferInfo);
       
        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);

    // console.log(program);
}

function createMatrix(canvas) {
    const vm = mat4.create();
    mat4.identity(vm);
    mat4.perspective(vm, glMatrix.toRadian(60), canvas.width / canvas.height, 1, 2000);

    const lm = mat4.create();
    mat4.identity(lm);
    mat4.lookAt(lm, [0, 0, 10], [0.0, 0.0, 0.0], [0, 1.0, 0]);

    return mat4.mul(vm, vm, lm)
}