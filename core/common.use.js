// mouse action on canvas.
function initEventHandlers(canvas, currentAngle, tick) {
    var dragging = false;
    var lastX = -1, lastY = -1;
    var rect = canvas.getBoundingClientRect();
  
    canvas.addEventListener("wheel", (ev) => {
      let eventDelta = ev.wheelDelta || -ev.deltaY + 40;// 火狐和其他浏览器都兼容
      let zoomSize = eventDelta / 120; // 如果是正数向上,复数向下
      whellZoomSize -= zoomSize * 0.1;
      window.requestAnimationFrame(tick);
    });
  
    canvas.onmousedown = function (ev) {
      var x = ev.clientX, y = ev.clientY;
      if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
        lastX = x; lastY = y;
        dragging = true;
  
      }
    }
  
    canvas.onmouseup = function (ev) {
      dragging = false;
      mouseX = ev.clientX - rect.left;
      mouseY = ev.clientY - rect.top;
      mouseUped = true;
      window.requestAnimationFrame(tick);
    }
  
    canvas.onmousemove = function (ev) {
      var x = ev.clientX, y = ev.clientY;
  
      if (dragging) {
        var factor = .05 / canvas.height;
        var dx = factor * (x - lastX);
        var dy = factor * (y - lastY);
        currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
        currentAngle[1] = currentAngle[1] + dx;
        window.requestAnimationFrame(tick);
      }
      lastX = x, lastY = y;
    }
}

// exctue the animation for N seconds
function excutedCountes(func, sec) {
    var raf; var start; var cover;
  
    function Counters(time) {
      func(time);
      // console.log(Date.now() - start);
      if (Date.now() - start >= sec) {
        window.cancelAnimationFrame(raf);
        cover.style.display = "none";
      } else {
        raf = window.requestAnimationFrame(Counters);
      }
    }
  
    return function result() {
      cover = makeCover();
      start = Date.now();
      window.requestAnimationFrame(Counters);
    }
  
}

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
    if (shaders.length <= 1) {
      console.warn("shaders text error", shaders);
    }
    const program = twgl.createProgramInfo(gl, shaders);
  
    return program;
  }
  
  function toRaius(a) {
    return a * 180 / Math.PI;
  }