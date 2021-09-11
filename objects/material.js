

function generateTiles() {
    let tils = [];
    for (let index = 0; index < TILE; index++) {
        for (let index1 = 0; index1 < TILE; index1++) {
            if(index % 2 === 0)
                tils.push(0xFF, 0xCC);
            else
                tils.push(0xCC, 0xFF);
        }
    }
    return tils
}

// new Uint8Array([  // data
//     0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
//     0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
//     0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
//     0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
//     0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
//     0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF,
//     0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC,
//     0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF, 0xCC, 0xFF
// ])

function getCheckerboardTexture (gl) {
    // make a 8x8 checkerboard texture
    const checkerboardTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, checkerboardTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,                // mip level
        gl.LUMINANCE,     // internal format
        TILE,                // width
        TILE * 2,                // height
        0,                // border
        gl.LUMINANCE,     // format
        gl.UNSIGNED_BYTE, // type
        new Uint8Array(generateTiles())
       );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    return checkerboardTexture;
}

function getUniforms(gl) {
    return Object.assign({}, {
        u_ambient: AMBIENTCOLOR,
        u_ambientFactor: AMBIENTCOLORFACTOR,
        u_diffuse: DIFFUSECOLOR,
        u_diffuseFactor: DIFFUSECOLORFACTOR,
        u_lightOrigin: LIGHTORIGIN,
        u_shiness: SHINESS,
        u_perspective: m4.identity(),
        u_view: m4.identity(),
        u_sampler: getCheckerboardTexture(gl),
        u_world: m4.identity(),
        u_color: PLANECOLOR
      });
}