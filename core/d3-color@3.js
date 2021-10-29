// https://d3js.org/d3-color/ v3.0.1 Copyright 2010-2021 Mike Bostock
!function(t, e) {
    "object" == typeof exports && "undefined" != typeof module ? e(exports) : "function" == typeof define && define.amd ? define(["exports"], e) : e((t = "undefined" != typeof globalThis ? globalThis : t || self).d3 = t.d3 || {})
}(this, (function(t) {
    "use strict";
    function e(t, e, n) {
        t.prototype = e.prototype = n,
        n.constructor = t
    }
    function n(t, e) {
        var n = Object.create(t.prototype);
        for (var i in e)
            n[i] = e[i];
        return n
    }
    function i() {}
    var r = .7
      , a = 1 / r
      , s = "\\s*([+-]?\\d+)\\s*"
      , o = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*"
      , h = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*"
      , l = /^#([0-9a-f]{3,8})$/
      , u = new RegExp("^rgb\\(" + [s, s, s] + "\\)$")
      , c = new RegExp("^rgb\\(" + [h, h, h] + "\\)$")
      , g = new RegExp("^rgba\\(" + [s, s, s, o] + "\\)$")
      , f = new RegExp("^rgba\\(" + [h, h, h, o] + "\\)$")
      , d = new RegExp("^hsl\\(" + [o, h, h] + "\\)$")
      , p = new RegExp("^hsla\\(" + [o, h, h, o] + "\\)$")
      , b = {
        aliceblue: 15792383,
        antiquewhite: 16444375,
        aqua: 65535,
        aquamarine: 8388564,
        azure: 15794175,
        beige: 16119260,
        bisque: 16770244,
        black: 0,
        blanchedalmond: 16772045,
        blue: 255,
        blueviolet: 9055202,
        brown: 10824234,
        burlywood: 14596231,
        cadetblue: 6266528,
        chartreuse: 8388352,
        chocolate: 13789470,
        coral: 16744272,
        cornflowerblue: 6591981,
        cornsilk: 16775388,
        crimson: 14423100,
        cyan: 65535,
        darkblue: 139,
        darkcyan: 35723,
        darkgoldenrod: 12092939,
        darkgray: 11119017,
        darkgreen: 25600,
        darkgrey: 11119017,
        darkkhaki: 12433259,
        darkmagenta: 9109643,
        darkolivegreen: 5597999,
        darkorange: 16747520,
        darkorchid: 10040012,
        darkred: 9109504,
        darksalmon: 15308410,
        darkseagreen: 9419919,
        darkslateblue: 4734347,
        darkslategray: 3100495,
        darkslategrey: 3100495,
        darkturquoise: 52945,
        darkviolet: 9699539,
        deeppink: 16716947,
        deepskyblue: 49151,
        dimgray: 6908265,
        dimgrey: 6908265,
        dodgerblue: 2003199,
        firebrick: 11674146,
        floralwhite: 16775920,
        forestgreen: 2263842,
        fuchsia: 16711935,
        gainsboro: 14474460,
        ghostwhite: 16316671,
        gold: 16766720,
        goldenrod: 14329120,
        gray: 8421504,
        green: 32768,
        greenyellow: 11403055,
        grey: 8421504,
        honeydew: 15794160,
        hotpink: 16738740,
        indianred: 13458524,
        indigo: 4915330,
        ivory: 16777200,
        khaki: 15787660,
        lavender: 15132410,
        lavenderblush: 16773365,
        lawngreen: 8190976,
        lemonchiffon: 16775885,
        lightblue: 11393254,
        lightcoral: 15761536,
        lightcyan: 14745599,
        lightgoldenrodyellow: 16448210,
        lightgray: 13882323,
        lightgreen: 9498256,
        lightgrey: 13882323,
        lightpink: 16758465,
        lightsalmon: 16752762,
        lightseagreen: 2142890,
        lightskyblue: 8900346,
        lightslategray: 7833753,
        lightslategrey: 7833753,
        lightsteelblue: 11584734,
        lightyellow: 16777184,
        lime: 65280,
        limegreen: 3329330,
        linen: 16445670,
        magenta: 16711935,
        maroon: 8388608,
        mediumaquamarine: 6737322,
        mediumblue: 205,
        mediumorchid: 12211667,
        mediumpurple: 9662683,
        mediumseagreen: 3978097,
        mediumslateblue: 8087790,
        mediumspringgreen: 64154,
        mediumturquoise: 4772300,
        mediumvioletred: 13047173,
        midnightblue: 1644912,
        mintcream: 16121850,
        mistyrose: 16770273,
        moccasin: 16770229,
        navajowhite: 16768685,
        navy: 128,
        oldlace: 16643558,
        olive: 8421376,
        olivedrab: 7048739,
        orange: 16753920,
        orangered: 16729344,
        orchid: 14315734,
        palegoldenrod: 15657130,
        palegreen: 10025880,
        paleturquoise: 11529966,
        palevioletred: 14381203,
        papayawhip: 16773077,
        peachpuff: 16767673,
        peru: 13468991,
        pink: 16761035,
        plum: 14524637,
        powderblue: 11591910,
        purple: 8388736,
        rebeccapurple: 6697881,
        red: 16711680,
        rosybrown: 12357519,
        royalblue: 4286945,
        saddlebrown: 9127187,
        salmon: 16416882,
        sandybrown: 16032864,
        seagreen: 3050327,
        seashell: 16774638,
        sienna: 10506797,
        silver: 12632256,
        skyblue: 8900331,
        slateblue: 6970061,
        slategray: 7372944,
        slategrey: 7372944,
        snow: 16775930,
        springgreen: 65407,
        steelblue: 4620980,
        tan: 13808780,
        teal: 32896,
        thistle: 14204888,
        tomato: 16737095,
        turquoise: 4251856,
        violet: 15631086,
        wheat: 16113331,
        white: 16777215,
        whitesmoke: 16119285,
        yellow: 16776960,
        yellowgreen: 10145074
    };
    function y() {
        return this.rgb().formatHex()
    }
    function w() {
        return this.rgb().formatRgb()
    }
    function m(t) {
        var e, n;
        return t = (t + "").trim().toLowerCase(),
        (e = l.exec(t)) ? (n = e[1].length,
        e = parseInt(e[1], 16),
        6 === n ? N(e) : 3 === n ? new x(e >> 8 & 15 | e >> 4 & 240,e >> 4 & 15 | 240 & e,(15 & e) << 4 | 15 & e,1) : 8 === n ? k(e >> 24 & 255, e >> 16 & 255, e >> 8 & 255, (255 & e) / 255) : 4 === n ? k(e >> 12 & 15 | e >> 8 & 240, e >> 8 & 15 | e >> 4 & 240, e >> 4 & 15 | 240 & e, ((15 & e) << 4 | 15 & e) / 255) : null) : (e = u.exec(t)) ? new x(e[1],e[2],e[3],1) : (e = c.exec(t)) ? new x(255 * e[1] / 100,255 * e[2] / 100,255 * e[3] / 100,1) : (e = g.exec(t)) ? k(e[1], e[2], e[3], e[4]) : (e = f.exec(t)) ? k(255 * e[1] / 100, 255 * e[2] / 100, 255 * e[3] / 100, e[4]) : (e = d.exec(t)) ? $(e[1], e[2] / 100, e[3] / 100, 1) : (e = p.exec(t)) ? $(e[1], e[2] / 100, e[3] / 100, e[4]) : b.hasOwnProperty(t) ? N(b[t]) : "transparent" === t ? new x(NaN,NaN,NaN,0) : null
    }
    function N(t) {
        return new x(t >> 16 & 255,t >> 8 & 255,255 & t,1)
    }
    function k(t, e, n, i) {
        return i <= 0 && (t = e = n = NaN),
        new x(t,e,n,i)
    }
    function M(t) {
        return t instanceof i || (t = m(t)),
        t ? new x((t = t.rgb()).r,t.g,t.b,t.opacity) : new x
    }
    function v(t, e, n, i) {
        return 1 === arguments.length ? M(t) : new x(t,e,n,null == i ? 1 : i)
    }
    function x(t, e, n, i) {
        this.r = +t,
        this.g = +e,
        this.b = +n,
        this.opacity = +i
    }
    function q() {
        return "#" + E(this.r) + E(this.g) + E(this.b)
    }
    function R() {
        var t = this.opacity;
        return (1 === (t = isNaN(t) ? 1 : Math.max(0, Math.min(1, t))) ? "rgb(" : "rgba(") + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", " + Math.max(0, Math.min(255, Math.round(this.b) || 0)) + (1 === t ? ")" : ", " + t + ")")
    }
    function E(t) {
        return ((t = Math.max(0, Math.min(255, Math.round(t) || 0))) < 16 ? "0" : "") + t.toString(16)
    }
    function $(t, e, n, i) {
        return i <= 0 ? t = e = n = NaN : n <= 0 || n >= 1 ? t = e = NaN : e <= 0 && (t = NaN),
        new O(t,e,n,i)
    }
    function H(t) {
        if (t instanceof O)
            return new O(t.h,t.s,t.l,t.opacity);
        if (t instanceof i || (t = m(t)),
        !t)
            return new O;
        if (t instanceof O)
            return t;
        var e = (t = t.rgb()).r / 255
          , n = t.g / 255
          , r = t.b / 255
          , a = Math.min(e, n, r)
          , s = Math.max(e, n, r)
          , o = NaN
          , h = s - a
          , l = (s + a) / 2;
        return h ? (o = e === s ? (n - r) / h + 6 * (n < r) : n === s ? (r - e) / h + 2 : (e - n) / h + 4,
        h /= l < .5 ? s + a : 2 - s - a,
        o *= 60) : h = l > 0 && l < 1 ? 0 : o,
        new O(o,h,l,t.opacity)
    }
    function j(t, e, n, i) {
        return 1 === arguments.length ? H(t) : new O(t,e,n,null == i ? 1 : i)
    }
    function O(t, e, n, i) {
        this.h = +t,
        this.s = +e,
        this.l = +n,
        this.opacity = +i
    }
    function P(t, e, n) {
        return 255 * (t < 60 ? e + (n - e) * t / 60 : t < 180 ? n : t < 240 ? e + (n - e) * (240 - t) / 60 : e)
    }
    e(i, m, {
        copy: function(t) {
            return Object.assign(new this.constructor, this, t)
        },
        displayable: function() {
            return this.rgb().displayable()
        },
        hex: y,
        formatHex: y,
        formatHsl: function() {
            return H(this).formatHsl()
        },
        formatRgb: w,
        toString: w
    }),
    e(x, v, n(i, {
        brighter: function(t) {
            return t = null == t ? a : Math.pow(a, t),
            new x(this.r * t,this.g * t,this.b * t,this.opacity)
        },
        darker: function(t) {
            return t = null == t ? r : Math.pow(r, t),
            new x(this.r * t,this.g * t,this.b * t,this.opacity)
        },
        rgb: function() {
            return this
        },
        displayable: function() {
            return -.5 <= this.r && this.r < 255.5 && -.5 <= this.g && this.g < 255.5 && -.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1
        },
        hex: q,
        formatHex: q,
        formatRgb: R,
        toString: R
    })),
    e(O, j, n(i, {
        brighter: function(t) {
            return t = null == t ? a : Math.pow(a, t),
            new O(this.h,this.s,this.l * t,this.opacity)
        },
        darker: function(t) {
            return t = null == t ? r : Math.pow(r, t),
            new O(this.h,this.s,this.l * t,this.opacity)
        },
        rgb: function() {
            var t = this.h % 360 + 360 * (this.h < 0)
              , e = isNaN(t) || isNaN(this.s) ? 0 : this.s
              , n = this.l
              , i = n + (n < .5 ? n : 1 - n) * e
              , r = 2 * n - i;
            return new x(P(t >= 240 ? t - 240 : t + 120, r, i),P(t, r, i),P(t < 120 ? t + 240 : t - 120, r, i),this.opacity)
        },
        displayable: function() {
            return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1
        },
        formatHsl: function() {
            var t = this.opacity;
            return (1 === (t = isNaN(t) ? 1 : Math.max(0, Math.min(1, t))) ? "hsl(" : "hsla(") + (this.h || 0) + ", " + 100 * (this.s || 0) + "%, " + 100 * (this.l || 0) + "%" + (1 === t ? ")" : ", " + t + ")")
        }
    }));
    const I = Math.PI / 180
      , S = 180 / Math.PI
      , T = .96422
      , _ = .82521
      , z = 4 / 29
      , C = 6 / 29
      , L = 3 * C * C;
    function A(t) {
        if (t instanceof D)
            return new D(t.l,t.a,t.b,t.opacity);
        if (t instanceof V)
            return W(t);
        t instanceof x || (t = M(t));
        var e, n, i = K(t.r), r = K(t.g), a = K(t.b), s = F((.2225045 * i + .7168786 * r + .0606169 * a) / 1);
        return i === r && r === a ? e = n = s : (e = F((.4360747 * i + .3850649 * r + .1430804 * a) / T),
        n = F((.0139322 * i + .0971045 * r + .7141733 * a) / _)),
        new D(116 * s - 16,500 * (e - s),200 * (s - n),t.opacity)
    }
    function B(t, e, n, i) {
        return 1 === arguments.length ? A(t) : new D(t,e,n,null == i ? 1 : i)
    }
    function D(t, e, n, i) {
        this.l = +t,
        this.a = +e,
        this.b = +n,
        this.opacity = +i
    }
    function F(t) {
        return t > .008856451679035631 ? Math.pow(t, 1 / 3) : t / L + z
    }
    function G(t) {
        return t > C ? t * t * t : L * (t - z)
    }
    function J(t) {
        return 255 * (t <= .0031308 ? 12.92 * t : 1.055 * Math.pow(t, 1 / 2.4) - .055)
    }
    function K(t) {
        return (t /= 255) <= .04045 ? t / 12.92 : Math.pow((t + .055) / 1.055, 2.4)
    }
    function Q(t) {
        if (t instanceof V)
            return new V(t.h,t.c,t.l,t.opacity);
        if (t instanceof D || (t = A(t)),
        0 === t.a && 0 === t.b)
            return new V(NaN,0 < t.l && t.l < 100 ? 0 : NaN,t.l,t.opacity);
        var e = Math.atan2(t.b, t.a) * S;
        return new V(e < 0 ? e + 360 : e,Math.sqrt(t.a * t.a + t.b * t.b),t.l,t.opacity)
    }
    function U(t, e, n, i) {
        return 1 === arguments.length ? Q(t) : new V(t,e,n,null == i ? 1 : i)
    }
    function V(t, e, n, i) {
        this.h = +t,
        this.c = +e,
        this.l = +n,
        this.opacity = +i
    }
    function W(t) {
        if (isNaN(t.h))
            return new D(t.l,0,0,t.opacity);
        var e = t.h * I;
        return new D(t.l,Math.cos(e) * t.c,Math.sin(e) * t.c,t.opacity)
    }
    e(D, B, n(i, {
        brighter: function(t) {
            return new D(this.l + 18 * (null == t ? 1 : t),this.a,this.b,this.opacity)
        },
        darker: function(t) {
            return new D(this.l - 18 * (null == t ? 1 : t),this.a,this.b,this.opacity)
        },
        rgb: function() {
            var t = (this.l + 16) / 116
              , e = isNaN(this.a) ? t : t + this.a / 500
              , n = isNaN(this.b) ? t : t - this.b / 200;
            return new x(J(3.1338561 * (e = T * G(e)) - 1.6168667 * (t = 1 * G(t)) - .4906146 * (n = _ * G(n))),J(-.9787684 * e + 1.9161415 * t + .033454 * n),J(.0719453 * e - .2289914 * t + 1.4052427 * n),this.opacity)
        }
    })),
    e(V, U, n(i, {
        brighter: function(t) {
            return new V(this.h,this.c,this.l + 18 * (null == t ? 1 : t),this.opacity)
        },
        darker: function(t) {
            return new V(this.h,this.c,this.l - 18 * (null == t ? 1 : t),this.opacity)
        },
        rgb: function() {
            return W(this).rgb()
        }
    }));
    var X = -.14861
      , Y = 1.78277
      , Z = -.29227
      , tt = -.90649
      , et = 1.97294
      , nt = et * tt
      , it = et * Y
      , rt = Y * Z - tt * X;
    function at(t) {
        if (t instanceof ot)
            return new ot(t.h,t.s,t.l,t.opacity);
        t instanceof x || (t = M(t));
        var e = t.r / 255
          , n = t.g / 255
          , i = t.b / 255
          , r = (rt * i + nt * e - it * n) / (rt + nt - it)
          , a = i - r
          , s = (et * (n - r) - Z * a) / tt
          , o = Math.sqrt(s * s + a * a) / (et * r * (1 - r))
          , h = o ? Math.atan2(s, a) * S - 120 : NaN;
        return new ot(h < 0 ? h + 360 : h,o,r,t.opacity)
    }
    function st(t, e, n, i) {
        return 1 === arguments.length ? at(t) : new ot(t,e,n,null == i ? 1 : i)
    }
    function ot(t, e, n, i) {
        this.h = +t,
        this.s = +e,
        this.l = +n,
        this.opacity = +i
    }
    e(ot, st, n(i, {
        brighter: function(t) {
            return t = null == t ? a : Math.pow(a, t),
            new ot(this.h,this.s,this.l * t,this.opacity)
        },
        darker: function(t) {
            return t = null == t ? r : Math.pow(r, t),
            new ot(this.h,this.s,this.l * t,this.opacity)
        },
        rgb: function() {
            var t = isNaN(this.h) ? 0 : (this.h + 120) * I
              , e = +this.l
              , n = isNaN(this.s) ? 0 : this.s * e * (1 - e)
              , i = Math.cos(t)
              , r = Math.sin(t);
            return new x(255 * (e + n * (X * i + Y * r)),255 * (e + n * (Z * i + tt * r)),255 * (e + n * (et * i)),this.opacity)
        }
    })),
    t.color = m,
    t.cubehelix = st,
    t.gray = function(t, e) {
        return new D(t,0,0,null == e ? 1 : e)
    }
    ,
    t.hcl = U,
    t.hsl = j,
    t.lab = B,
    t.lch = function(t, e, n, i) {
        return 1 === arguments.length ? Q(t) : new V(n,e,t,null == i ? 1 : i)
    }
    ,
    t.rgb = v,
    Object.defineProperty(t, "__esModule", {
        value: !0
    })
}
));
