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

function degToRad(d) {
  return d * Math.PI / 180;
}

var filedOfViewRadians = degToRad(60);


function main() {
  console.log("hello webgl...");
  const canvas = document.getElementById("happy-life-happy-code");
  const gl = canvas.getContext("webgl2") ||
    canvas.getContext("webgl") ||
    canvas.getContext("experimental-webgl");

  if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
  twgl.setAttributePrefix("a_");
  const program = twgl.createProgramInfo(gl, createShaderFromScript(["vertex", "frag"]));

  const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(
      gl,
      1,
      12,
      6
  );

  const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(
    gl,
    20,
    20,
    1,
    1
  );

  const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(
    gl,
    2
  );


  const sphereVAOInfo = twgl.createVAOFromBufferInfo(gl, program, sphereBufferInfo);
  const planeVAOInfo = twgl.createVAOFromBufferInfo(gl, program, planeBufferInfo);
  const cubeVAOInfo = twgl.createVAOFromBufferInfo()
  // make a 8x8 checkerboard texture
  const checkerboardTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
  gl.texImage2D(
      gl.TEXTURE_2D,
      0,                // mip level
      gl.LUMINANCE,     // internal format
      8,                // width
      8,                // height
      0,                // border
      gl.LUMINANCE,     // format
      gl.UNSIGNED_BYTE, // type
      new Uint8Array([  // data
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
        0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
        0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
  ]));
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  const allUniforms = {
    u_projection: m4.identity(),
    u_view: m4.identity(),
    u_world: m4.identity(),
    u_mulColor: [0.7, .5, .6, 1.0],
    u_sampler: checkerboardTexture,
    u_textureMatrix: m4.identity()
  } 

  const imageTexture = loadImageTexture('./f-texture.png');

 

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  var tick = function() {
      // console.log(settings);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program.program);

      allUniforms.u_projection = m4.perspective(filedOfViewRadians, canvas.width / canvas.height, 1, 2000);
      var matrix = m4.lookAt([settings.cameraX, settings.cameraY, 7], [0, 0, 0], [0, 1, 0])
      allUniforms.u_view = m4.inverse(matrix);
      allUniforms.u_texture = imageTexture;
      var projection = m4.perspective(filedOfViewRadians, 1, 1, 100);

      let textureWorldMatrix = m4.lookAt(
        [settings.posX, settings.posY, settings.posZ],          // position
        [settings.targetX, settings.targetY, settings.targetZ], // target
        [0, 1, 0],                                              // up
      );
      textureWorldMatrix = m4.scale(
          textureWorldMatrix,
          settings.projWidth, settings.projHeight, 1,
      );
      // use the inverse of this world matrix to make
      // a matrix that will transform other positions
      // to be relative this this world space.
      const textureMatrix = m4.inverse(textureWorldMatrix);
      // console.log(settings.projWidth);
      allUniforms.u_textureMatrix = textureMatrix;

      // draw sphere
      twgl.setUniforms(program, Object.assign(allUniforms, {
        u_world: m4.translation(1, 0, 2)
      }));

      gl.bindVertexArray(sphereVAOInfo);
      twgl.setUniforms(program, allUniforms);
      twgl.drawBufferInfo(gl, sphereBufferInfo);

      // draw plane
      gl.bindVertexArray(planeVAOInfo);
      twgl.setUniforms(program, Object.assign({}, allUniforms, {
        u_mulColor: [0.3, 0.4, 0.5, 1.0],
        u_world: m4.translation(0.0, -1.0, 0.0)
      }));
      twgl.drawBufferInfo(gl, planeBufferInfo);

      // window.requestAnimationFrame(tick);
  }

  let settings = {
    cameraX: 2.75,
    cameraY: 5,
    posX: 3.5,
    posY: 4.4,
    posZ: 4.7,
    targetX: 0.8,
    targetY: 0,
    targetZ: 4.7,
    projWidth: 1,
    projHeight: 1,
  };

  webglLessonsUI.setupUI(document.querySelector('#ui'), settings, [
    { type: 'slider',   key: 'cameraX',    min: -10, max: 10, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'cameraY',    min:   1, max: 20, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posX',       min: -10, max: 10, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posY',       min:   1, max: 20, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'posZ',       min:   1, max: 20, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetX',    min: -10, max: 10, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetY',    min:   0, max: 20, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'targetZ',    min: -10, max: 20, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projWidth',  min:   0, max: 10, change: tick, precision: 2, step: 0.001, },
    { type: 'slider',   key: 'projHeight', min:   0, max: 10, change: tick, precision: 2, step: 0.001, },
  ]);

  function loadImageTexture(url) {
    // Create a texture.
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Fill the texture with a 1x1 blue pixel.
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));
    // Asynchronously load an image
    const image = new Image();
    image.src = url;
    image.addEventListener('load', function() {
      // Now that the image has loaded make copy it to the texture.
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      // assumes this texture is a power of 2
      gl.generateMipmap(gl.TEXTURE_2D);
      tick(settings);
    });
    return texture;
  }
   
  
  // loadImageTexture(imageTexture);
  // window.requestAnimationFrame(tick);
}