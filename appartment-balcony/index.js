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

function toRadius(angle) {
  return angle * Math.PI / 180.00
}

const fieldOfViewRadians = toRadius(60);

function main() {
    const canvas = document.getElementById("happy-life-happy-code");
    const gl = canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    if( !gl ) return console.error("sorry, your browser does't not support webgl now!");
    const faceInfos = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: './pos-x.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: './neg-x.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: './pos-y.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: './neg-y.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: './pos-z.jpg',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: './neg-z.jpg',
      },
    ];

    const faceInfo2 = [
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        url: './pos-x-1.png',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        url: './neg-x-1.png',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        url: './pos-y-1.png',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        url: './neg-y-1.png',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        url: './pos-z-1.png',
      },
      {
        target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        url: './neg-z-1.png',
      },
    ] 
    const programInfo = createShaderFromScript(gl, ["vertex", "frag"]);
    const { program } = programInfo;
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const skyBoxLocation = gl.getUniformLocation(program, "u_skybox");
    const viewLocation = gl.getUniformLocation(program, "u_view");

    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array(
      [
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);


    faceInfos.forEach(item => {
      const { target, url } = item;
      gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      const image = new Image();
      image.src = url;
      image.onload = function() {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      }

    });

    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.useProgram(program)


    var tick = function(time) {
        factor -= 0.001;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // console.log(0.9090760218681387 0.41663027550143233);
        const projection = m4.perspective(fieldOfViewRadians, canvas.width / canvas.height, 1, 1000);
        // let view = m4.lookAt([Math.cos(movedX * 0.0001), 0, Math.sin(movedX * 0.0001)], [0, 0, 0], [0, 1, 0]);
        let view = m4.lookAt([factor, 0, 0], [0, 0, 0], [0, 1, 0]);
        view = m4.inverse(view);
        let u_viewMatrix = m4.multiply(projection, view);
        u_viewMatrix = m4.inverse(u_viewMatrix);
        gl.uniformMatrix4fv(viewLocation, false, u_viewMatrix);
        gl.uniform1i(skyBoxLocation, 0);

        gl.depthFunc(gl.LEQUAL);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if( factor <= 1 && moveSwitch) {
           window.requestAnimationFrame(tick);
        }
    }

    window.requestAnimationFrame(tick);

    initMouseEvent(canvas, tick);
    forward(faceInfo2, gl, texture, tick);
}

function initMouseEvent(canvas, tick) {
  var status = null;
  var movedX = 0;
  var start = 0;

  var movedY = 0;
  var startY = 0;
  canvas.addEventListener('mousedown', (e) => {
    status = true;
    start = e.clientX;
    startY = e.clientY;
  }, false)

  canvas.addEventListener('mousemove', (e) => {
    if( status ) {
      const x = e.clientX;
      const y = e.clientY;
      if( start > x) {
        movedX += x;
      } else {
        movedX -= x;
      }

      if( startY > y) {
        movedY += y;
      } else {
        movedY -= y;
      }
     
      tick(movedX, movedY);
    }
  }, false)

  canvas.addEventListener('mouseup', (e) => {
    // console.log('end at:', x);
    status = false;
  }, false)
}

function forward(face, gl, texture, tick) {
  document.getElementById("forward").addEventListener('click', () => {
        window.requestAnimationFrame(tick);
        moveSwitch = true;
        loadAllImageDone(face, gl, texture).then(res => {
          //moveSwitch = false;
        });     
  })
}
var factor = 0;
var moveSwitch = false;
function loadAllImageDone(face, gl, texture) {
    const imagePromise = face.map(item => {
      return new Promise((resolve, reject) => {
        const { target, url } = item;
        gl.texImage2D(target, 0, gl.RGBA, 512, 512, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        const image = new Image();
        image.src = url;
        image.onload = function() {
          resolve({image, target}); 
        }
      })
    });

    return Promise.all(imagePromise).then(res => {
      res.forEach(({image, target}) => {
        // Now that the image has loaded make copy it to the texture.
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
      })
    });


}