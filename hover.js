const THREE = require("three");
const gsap = require("gsap");

function interopDefault(mod) {
    return mod && typeof mod === "object" && "default" in mod ? mod : { default: mod };
}

function interopNamespace(mod) {
    if (mod && mod.__esModule) return mod;
    const ns = Object.create(null);
    if (mod) {
        Object.keys(mod).forEach((k) => {
            if (k !== "default") {
                const desc = Object.getOwnPropertyDescriptor(mod, k);
                Object.defineProperty(ns, k, desc.get ? desc : {
                    enumerable: true,
                    get: () => mod[k]
                });
            }
        });
    }
    ns.default = mod;
    return ns;
}

const THREE_NS = interopNamespace(THREE);
const gsapDefault = interopDefault(gsap);

module.exports = function (opts) {
    function pick() {
        for (let i = 0; i < arguments.length; i++) {
            if (arguments[i] !== undefined) return arguments[i];
        }
    }

    console.log(
        "%c Hover effect by Robin Delaporte: https://github.com/robin-dela/hover-effect ",
        "color: #bada55; font-size: 0.8rem"
    );

    const parent = opts.parent;
    const displacementImage = opts.displacementImage;
    const image1 = opts.image1;
    const image2 = opts.image2;
    const imagesRatio = pick(opts.imagesRatio, 1);
    const intensity1 = pick(opts.intensity1, opts.intensity, 1);
    const intensity2 = pick(opts.intensity2, opts.intensity, 1);
    const angle = pick(opts.angle, Math.PI / 4);
    const angle1 = pick(opts.angle1, angle);
    const angle2 = pick(opts.angle2, 3 * -angle);
    const speedIn = pick(opts.speedIn, opts.speed, 1.6);
    const speedOut = pick(opts.speedOut, opts.speed, 1.2);
    const hover = pick(opts.hover, true);
    const easing = pick(opts.easing, "expo.out");
    let isVideo = pick(opts.video, false);

    if (!parent) {
        console.warn("Parent missing");
        return;
    }
    if (!image1 || !image2 || !displacementImage) {
        console.warn("One or more images are missing");
        return;
    }

    // Scene setup
    const scene = new THREE_NS.Scene();
    const camera = new THREE_NS.OrthographicCamera(
        parent.offsetWidth / -2,
        parent.offsetWidth / 2,
        parent.offsetHeight / 2,
        parent.offsetHeight / -2,
        1,
        1000
    );
    camera.position.z = 1;

    const renderer = new THREE_NS.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(2);
    renderer.setClearColor(0xffffff, 0);
    renderer.setSize(parent.offsetWidth, parent.offsetHeight);
    parent.appendChild(renderer.domElement);

    const render = () => renderer.render(scene, camera);

    const loader = new THREE_NS.TextureLoader();
    loader.crossOrigin = "";

    let tex1, tex2;
    const disp = loader.load(displacementImage, render);
    disp.magFilter = disp.minFilter = THREE_NS.LinearFilter;

    if (isVideo) {
        (function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        })();

        const video1 = document.createElement("video");
        video1.autoplay = true;
        video1.loop = true;
        video1.muted = true;
        video1.src = image1;
        video1.load();

        const video2 = document.createElement("video");
        video2.autoplay = true;
        video2.loop = true;
        video2.muted = true;
        video2.src = image2;
        video2.load();

        tex1 = new THREE_NS.VideoTexture(video1);
        tex2 = new THREE_NS.VideoTexture(video2);
        tex1.magFilter = tex2.magFilter = THREE_NS.LinearFilter;
        tex1.minFilter = tex2.minFilter = THREE_NS.LinearFilter;

        video2.addEventListener("loadeddata", function () {
            video2.play();
            tex2 = new THREE_NS.VideoTexture(video2);
            tex2.magFilter = THREE_NS.LinearFilter;
            tex2.minFilter = THREE_NS.LinearFilter;
            material.uniforms.texture2.value = tex2;
        });

        video1.addEventListener("loadeddata", function () {
            video1.play();
            tex1 = new THREE_NS.VideoTexture(video1);
            tex1.magFilter = THREE_NS.LinearFilter;
            tex1.minFilter = THREE_NS.LinearFilter;
            material.uniforms.texture1.value = tex1;
        });
    } else {
        tex1 = loader.load(image1, render);
        tex2 = loader.load(image2, render);
        tex1.magFilter = tex2.magFilter = THREE_NS.LinearFilter;
        tex1.minFilter = tex2.minFilter = THREE_NS.LinearFilter;
    }

    // Ratio calculation
    let ratio = imagesRatio;
    let width, height;
    if (parent.offsetHeight / parent.offsetWidth < ratio) {
        width = 1;
        height = parent.offsetHeight / parent.offsetWidth / ratio;
    } else {
        width = (parent.offsetWidth / parent.offsetHeight) * ratio;
        height = 1;
    }

    // Shader material
    const material = new THREE_NS.ShaderMaterial({
        uniforms: {
            intensity1: { type: "f", value: intensity1 },
            intensity2: { type: "f", value: intensity2 },
            dispFactor: { type: "f", value: 0 },
            angle1: { type: "f", value: angle1 },
            angle2: { type: "f", value: angle2 },
            texture1: { type: "t", value: tex1 },
            texture2: { type: "t", value: tex2 },
            disp: { type: "t", value: disp },
            res: { type: "vec4", value: new THREE_NS.Vector4(parent.offsetWidth, parent.offsetHeight, width, height) },
            dpr: { type: "f", value: window.devicePixelRatio }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float dispFactor;
            uniform float dpr;
            uniform sampler2D disp;
            uniform sampler2D texture1;
            uniform sampler2D texture2;
            uniform float angle1;
            uniform float angle2;
            uniform float intensity1;
            uniform float intensity2;
            uniform vec4 res;
            uniform vec2 parent;

            mat2 getRotM(float angle) {
                float s = sin(angle);
                float c = cos(angle);
                return mat2(c, -s, s, c);
            }

            void main() {
                vec4 disp = texture2D(disp, vUv);
                vec2 dispVec = vec2(disp.r, disp.g);

                vec2 uv = 0.5 * gl_FragCoord.xy / (res.xy) ;
                vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);

                vec2 distortedPosition1 = myUV + getRotM(angle1) * dispVec * intensity1 * dispFactor;
                vec2 distortedPosition2 = myUV + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
                vec4 _texture1 = texture2D(texture1, distortedPosition1);
                vec4 _texture2 = texture2D(texture2, distortedPosition2);
                gl_FragColor = mix(_texture1, _texture2, dispFactor);
            }
        `,
        transparent: true,
        opacity: 1
    });

    const geometry = new THREE_NS.PlaneGeometry(parent.offsetWidth, parent.offsetHeight, 1);
    const mesh = new THREE_NS.Mesh(geometry, material);
    scene.add(mesh);

    // Hover events
    function onEnter() {
        gsapDefault.default.to(material.uniforms.dispFactor, {
            duration: speedIn,
            value: 1,
            ease: easing,
            onUpdate: render,
            onComplete: render
        });
    }

    function onLeave() {
        gsapDefault.default.to(material.uniforms.dispFactor, {
            duration: speedOut,
            value: 0,
            ease: easing,
            onUpdate: render,
            onComplete: render
        });
    }

    if (hover) {
        parent.addEventListener("mouseenter", onEnter);
        parent.addEventListener("touchstart", onEnter);
        parent.addEventListener("mouseleave", onLeave);
        parent.addEventListener("touchend", onLeave);
    }

    window.addEventListener("resize", function () {
        if (parent.offsetHeight / parent.offsetWidth < ratio) {
            width = 1;
            height = parent.offsetHeight / parent.offsetWidth / ratio;
        } else {
            width = (parent.offsetWidth / parent.offsetHeight) * ratio;
            height = 1;
        }
        mesh.material.uniforms.res.value = new THREE_NS.Vector4(parent.offsetWidth, parent.offsetHeight, width, height);
        renderer.setSize(parent.offsetWidth, parent.offsetHeight);
        render();
    });

    this.next = onEnter;
    this.previous = onLeave;
};