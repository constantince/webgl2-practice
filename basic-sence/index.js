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

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  const materialLibs = [];
  const geometries = [];
  let geometry;
  let groups = ['default'];
  let material = 'default';
  let object = 'default';

  const noop = () => {};

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
  }

  function setGeometry() {
    if (!geometry) {
      const position = [];
      const texcoord = [];
      const normal = [];
      webglVertexData = [
        position,
        texcoord,
        normal,
      ];
      geometry = {
        object,
        groups,
        material,
        data: {
          position,
          texcoord,
          normal,
        },
      };
      geometries.push(geometry);
    }
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      setGeometry();
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
    s: noop,    // smoothing group
    mtllib(parts, unparsedArgs) {
      // the spec says there can be multiple filenames here
      // but many exist with spaces in a single filename
      materialLibs.push(unparsedArgs);
    },
    usemtl(parts, unparsedArgs) {
      material = unparsedArgs;
      newGeometry();
    },
    g(parts) {
      groups = parts;
      newGeometry();
    },
    o(parts, unparsedArgs) {
      object = unparsedArgs;
      newGeometry();
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  // remove any arrays that have no entries.
  for (const geometry of geometries) {
    geometry.data = Object.fromEntries(
        Object.entries(geometry.data).filter(([, array]) => array.length > 0));
  }

  return {
    geometries,
    materialLibs,
  };
}

function resizeCanvasToDisplaySize(canvas) {
  // Lookup the size the browser is displaying the canvas in CSS pixels.
  const dpr = window.devicePixelRatio;
  const {width, height} = canvas.getBoundingClientRect();
  const displayWidth  = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);

  // Check if the canvas is not the same size.
  const needResize = canvas.width  !== displayWidth ||
                     canvas.height !== displayHeight;

  if (needResize) {
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  return needResize;
}



const AMBIENTCOLOR = [1.0, 1.0, 1.0];
const AMBIENTMATERIAL = 0.63;
const DIFFUSECOLOR = [1.0, 1.0, 1.0];
const DIFFUSEMATERIAL = 2.0;
const SPECULARCOLOR = [1.0, 1.0, 1.0];
const SPECULARM = 2.0;
const LIGHTSOURCE = [5.3, 10.0, 10.5];
const LOOKAT = [5, 3, 10];
const OFFSCREEN_WIDTH = 2040;
const OFFSCREEN_HEIGH = 2040;
const fieldView = toRedius(60.0);


let selectedObject = {name: null};

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    eventStartUp(canvas);
    const renderProgram = createShaderFromScript(gl, ["vertex", "frag"]);
    const frameProgram = createShaderFromScript(gl, ["frame-vertex", "frame-frag"]);
    const pickProgram = createShaderFromScript(gl, ["click-vertex", "click-frag"]);

    // Create a texture to render to
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // create a depth renderbuffer
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);

    function setFramebufferAttachmentSizes(width, height) {
      gl.bindTexture(gl.TEXTURE_2D, targetTexture);
      // define size and format of level 0
      const level = 0;
      const internalFormat = gl.RGBA;
      const border = 0;
      const format = gl.RGBA;
      const type = gl.UNSIGNED_BYTE;
      const data = null;
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    width, height, border,
                    format, type, data);

      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    setFramebufferAttachmentSizes(OFFSCREEN_WIDTH, OFFSCREEN_HEIGH);

    // Create and bind the framebuffer
    const pickFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    // make a depth buffer and the same size as the targetTexture
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    twgl.setAttributePrefix("a_");
    const SCALE = 0.5;
    const cubeBufferInfo = twgl.primitives.createCubeBufferInfo(gl, 2);
    const cubeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cubeBufferInfo);

    const planeBufferInfo = twgl.primitives.createPlaneBufferInfo(gl, 50, 50);
    const planeVao = twgl.createVAOFromBufferInfo(gl, renderProgram, planeBufferInfo);

    const discBufferInfo = twgl.primitives.createDiscBufferInfo(gl, 2.0, 6);
    const discVao = twgl.createVAOFromBufferInfo(gl, renderProgram, discBufferInfo);

    const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(gl, .7, 255, 255);
    const sphereVao = twgl.createVAOFromBufferInfo(gl, renderProgram, sphereBufferInfo);

    const torusBufferInfo = twgl.primitives.createTorusBufferInfo(gl, 1, .2, 255, 255);
    const torusVao = twgl.createVAOFromBufferInfo(gl, renderProgram, torusBufferInfo);

    const cylindarBufferInfo = twgl.primitives.createCylinderBufferInfo(gl, 1, 2, 255, 10);
    const cylindarVao = twgl.createVAOFromBufferInfo(gl, renderProgram, cylindarBufferInfo);

    // load object from serve
    /*
    fetch('./teamugobj.obj').then(response => response.text()
    ).then(res => {
      const obj = parseOBJ(res);
      console.log(obj);
      const parts = obj.geometries.map(({data}) => {
        const buffer = twgl.createBufferInfoFromArrays(gl, data);
        // fills out a vertex array by calling gl.createVertexArray, gl.bindVertexArray
        // then gl.bindBuffer, gl.enableVertexAttribArray, and gl.vertexAttribPointer for each attribute
        const vao = twgl.createVAOFromBufferInfo(gl, renderProgram, buffer);

        return {vao, buffer};

      });

        sence.push({ 
          name: 'chair',
          ...parts[0],
          calculateTheUniforms: function(time) {
            let transform = m4.translate(m4.identity(), 5, .5, 2.5);
            transform = m4.axisRotate(transform, [0, 1, 0], toRedius(time * 0.00001));
            const transformMatrix = twgl.m4.scale(transform, [0.5, 0.5, 0.5]);
            return {
              u_color: [1.0, 1.0, 0.0, 1.0],
              u_ambientM: 0.1,
              u_diffuseM: 0.6,
              u_specularM: 0.9,
              u_world: transformMatrix,
              u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
            }
          }
        });
      });  
      */
    // render scenc matrixs
    // const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
    // const render_view = m4.lookAt(LOOKAT, [0, 0, 0], [0, 1, 0]);
    
    // render shadow matrixs
    const framePerspective = m4.perspective(fieldView, OFFSCREEN_WIDTH / OFFSCREEN_HEIGH, 0.5, 1000);
    const frameLookAt = m4.lookAt(LIGHTSOURCE, [0, 0, 0], [0, 1, 0]);

    const {fbo, texture} = createFrameBuffer(gl);

    //const {pickFbo: fbo} = createFrameBuffer(gl);

    //scene
    const sence = [
      {
        name: 'cylindar',
        buffer: cylindarBufferInfo,
        vao: cylindarVao,
        calculateTheUniforms: function(time) {
          let translation = m4.translate(m4.identity(), -1.5, 1.0, 2);
          translation = twgl.m4.scale(translation, [0.7, 0.7, 0.7]);
          const transformMatrix =m4.axisRotate(translation, [1, 1, 1], toRedius(time * 0.00001));
          return {
            u_use_shadow: true,
            u_color: [1.0, 0.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'torus',
        buffer: torusBufferInfo,
        vao: torusVao,
        calculateTheUniforms: function(time) {
          let translation = m4.translate(m4.identity(), 1, 1.0, 2.5);
          translation = twgl.m4.scale(translation, [0.7, 0.7, 0.7]);
          const transformMatrix = m4.axisRotate(translation, [1, 1, 1], toRedius(time * 0.00001));
          return {
            u_use_shadow: true,
            u_color: [1.0, 1.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'sphere',
        buffer: sphereBufferInfo,
        vao: sphereVao,
        calculateTheUniforms: function(time) {
          const translation = m4.translate(m4.identity(), 3.5, 2.0, -3.5);
          const rotation = twgl.m4.rotateY(m4.identity(), toRedius(time * 0.00001));
          const transformMatrix = m4.multiply(rotation, translation);
          return {
            u_use_shadow: true,
            u_color: [0.0, 1.0, 0.0, 1.0],
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'disc',
        buffer: discBufferInfo,
        vao: discVao,
        calculateTheUniforms: function(time) {
          let translation = m4.translate(m4.identity(), 3, 2, 2.1);
          translation = twgl.m4.scale(translation, [0.5, 0.5, 0.5]);
         translation = m4.axisRotate(translation, [0, 1, 1], toRedius(90));
          const transformMatrix = m4.axisRotate(translation, [0, 1, 0], toRedius(time * 0.00001));
          return {
            u_color: [1.0, 1.0, 1.0, 1.0],
            u_use_shadow: true,
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
            u_specularM: 0.9,
            u_world: transformMatrix,
            u_normalMatrix: m4.transpose(m4.inverse(transformMatrix))
          }
        }
      },
      {
        name: 'cube',
        buffer: cubeBufferInfo,
        vao: cubeVao,
        calculateTheUniforms: function(time) {
          let translation = twgl.m4.scale(m4.identity(), [0.7, 0.7, 0.7]);
          const transformMatrix = m4.translate(translation, 0, Math.sin(time * 0.001) + 2.5, 0);
          return {
            u_color: [.34, .78, .98, 1.0],
            u_use_shadow: true,
            u_ambientM: 0.1,
            u_diffuseM: 0.6,
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
          const transformMatrix = m4.translate(m4.identity(), 0, -1, 0);
          return {
            u_color: [1.0, 1.0, 1.0, 1.0],
            u_use_shadow: false,
            u_ambientM: 0.35,
            u_diffuseM: 0.8,
            u_specularM: 0.0,
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
      // render scenc matrixs
      const VIEWORIGANL = [Math.cos(time* 0.0001) * 12, 10, Math.sin(time* 0.0001) * 12];
      const render_project = m4.perspective(toRedius(60), 1, gl.canvas.width / gl.canvas.height, 1000);
      const render_view = m4.lookAt(VIEWORIGANL, [0, 0, 0], [0, 1, 0]);

        // render pick frame buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, pickFbo);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(pickProgram.program);
        twgl.setUniforms(pickProgram, {
          u_projection: render_project,
          u_view: m4.inverse(render_view),
        });

        sence.forEach((item, index) => {
          const {buffer, vao, calculateTheUniforms} = item;
          const id = index;
          twgl.setUniforms(pickProgram, {
            ...calculateTheUniforms(time),
            u_id: [
              ((id >>  0) & 0xFF) / 0xFF,
              ((id >>  8) & 0xFF) / 0xFF,
              ((id >> 16) & 0xFF) / 0xFF,
              ((id >> 24) & 0xFF) / 0xFF,
            ]
          });
          gl.bindVertexArray(vao);
          twgl.drawBufferInfo(gl, buffer);
        });

        if( mouseupActived ) {
         
          const pixelX = mouseX * gl.canvas.width / gl.canvas.clientWidth;
          const pixelY = gl.canvas.height - mouseY * gl.canvas.height / gl.canvas.clientHeight - 1;
          const data = new Uint8Array(4);
          gl.readPixels(pixelX, pixelY, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
          if( data[0] >= 0 ) {
             selectedObject = sence[data[0]];
          }

          console.log(data[0], selectedObject.name)
          mouseupActived = false;
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);


        
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(frameProgram.program);
       
        // render frame buffer for shadows
        twgl.setUniforms(frameProgram, {
          u_projection: framePerspective,
          u_view: m4.inverse(frameLookAt)
        });

        sence.forEach((item, index) => {
          const {buffer, vao, calculateTheUniforms} = item;
          twgl.setUniforms(frameProgram, calculateTheUniforms(time));
          gl.bindVertexArray(vao);
          twgl.drawBufferInfo(gl, buffer);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // render color buffer
        gl.viewport(0, 0, canvas.width, canvas.height);
        resizeCanvasToDisplaySize(canvas)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(renderProgram.program);
        twgl.setUniforms(renderProgram, {
          u_projection: render_project,
          u_view: m4.inverse(render_view),
          u_texture: texture,
          u_innerLimit: -12.0,
          u_outerLimit: -14.5,
          u_frame_projection: framePerspective,
          u_frame_view: m4.inverse(frameLookAt),
          u_lightSource: LIGHTSOURCE,
          u_ambientColor: AMBIENTCOLOR,
          u_diffuseColor: DIFFUSECOLOR,
          u_specularColor: SPECULARCOLOR,
          u_viewDirection: VIEWORIGANL,
          u_color: [1.0, 1.0, 1.0, 1.0],
          u_fogDensity: 0.1,
          u_fogColor: [0.0, 0.0, 0.0],
        });

        sence.forEach(item => {
          const {buffer, vao, calculateTheUniforms, name} = item;
          const uniforms = calculateTheUniforms(time);
          const optical = (time & 0x8) && (selectedObject.name === name && selectedObject.name !== "plane");
          uniforms.u_color = !optical ? uniforms.u_color:  [0.69, 0.23, 0.3, 1.0];
          twgl.setUniforms(renderProgram, uniforms);
          gl.bindVertexArray(vao);
          twgl.drawBufferInfo(gl, buffer);
        });

        window.requestAnimationFrame(tick);
    }

    window.requestAnimationFrame(tick);
}

function createFrameBuffer(gl) {
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

  const texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const rb = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGH)

  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rb);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return {fbo, texture}
}

var mouseX = 0;
var mouseY = 0;
var mouseupActived = false;
function eventStartUp(canvas) {
  canvas && canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY -rect.top;
    mouseupActived = true;
  });
}

