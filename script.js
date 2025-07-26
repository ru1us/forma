window.addEventListener("load", function () {
    document.getElementById("link1").addEventListener("click", function () {
        triggerLoad("kol1.html");
        window.location.href = "kol1.html";
    });

    document.getElementById("link2").addEventListener("click", function () {
        triggerLoad("kol2.html");
        window.location.href = "kol2.html";
    });

    document.getElementById("link3").addEventListener("click", function () {
      triggerLoad("kol3.html");
      window.location.href = "kol3.html";
    });

    gsap.registerPlugin(ScrollTrigger);

    const scroller = this.document.querySelector("[data-scroll-container]");

    const locoScroll = new LocomotiveScroll({
        el: scroller,
        smooth: true,
        getDirection: true,
        direction: "horizontal",
        smartphone: {
            smooth: true,
            direction: "horizontal",
        },
        tablet: {
            smooth: true,
            direction: "horizontal",
        },
    });

    locoScroll.stop();
    this.setTimeout(() => {
        locoScroll.start();
    }, 1000);

    locoScroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(scroller, {
        scrollTop(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.y;
        },
        scrollLeft(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.x;
        },
        getBoundingClientRect() {
            return {
                left: 0,
                top: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        pinType: scroller.style.transform ? "transform" : "fixed",
    });

    ScrollTrigger.defaults({
        scroller: scroller,
    });

    let ScrollTween = gsap.to(".anim-wrap", {
        scrollTrigger: {
            trigger: ".vertical",
            scroller: scroller,
            start: "left left",
            end: () => "+=" + document.querySelector(".anim-wrap").scrollHeight,
            scrub: true,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            horizontal: true,
            invalidateOnRefresh: true,
            refreshPriority: 1,
        },
        y: () =>
            -(document.querySelector(".anim-wrap").scrollHeight - window.innerHeight),
        ease: "none",
    });

    const gsapHImg = gsap.utils.toArray(".image.horizontal_img");
    gsapHImg.forEach((gsHImg) => {
        const itemHImg = gsHImg.querySelector(".image__bl");

        gsap.to(itemHImg, {
            scrollTrigger: {
                trigger: gsHImg,
                start: () => "left right",
                end: () => "right left",
                scrub: 0.7,
                horizontal: true,
                invalidateOnRefresh: true,
                refreshPriority: 1,
            },
            x: 0,
            ease: "none",
        });
    });

    const gsapVs = gsap.utils.toArray(".vertical .inner-section");
    gsapVs.forEach((gsVs) => {
        const itemVImg = gsVs.querySelector(".image__bl");
        const title = gsVs.querySelector(".title");

        gsap.to(itemVImg, {
            scrollTrigger: {
                trigger: gsVs,
                start: () => "left right",
                end: () => "right left",
                scrub: 0.7,
                horizontal: false,
                refreshPriority: 1,
                containerAnimation: ScrollTween,
            },
            y: 210,
            ease: "none",
        });

        gsap.to(title, {
            scrollTrigger: {
                trigger: gsVs,
                start: () => "left right",
                end: () => "right left",
                scrub: 1.5,
                horizontal: false,
                refreshPriority: 1,
                containerAnimation: ScrollTween,
            },
            y: 85,
            ease: "none",
        });
    });

    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();

    // Smooth Image Distortion Transition with Three.js, GSAP, and Displacement Map

    // Import Three.js if not already loaded

    let renderer, scene, camera, material, mesh;
    let uniforms;
    const container = document.querySelector(".distortion");
    let rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    // Load videos as textures
    const video1 = document.createElement("video");
    video1.src = "./public/displace/video1.1.mp4";
    video1.crossOrigin = "anonymous";
    video1.loop = true;
    video1.muted = true;
    video1.playsInline = true;
    video1.autoplay = true;
    video1.play();

    const video2 = document.createElement("video");
    video2.src = "./public/displace/video2.2.mp4";
    video2.crossOrigin = "anonymous";
    video2.loop = true;
    video2.muted = true;
    video2.playsInline = true;
    video2.autoplay = true;
    video2.play();

    const texture1 = new THREE.VideoTexture(video1);
    const texture2 = new THREE.VideoTexture(video2);

    const loader = new THREE.TextureLoader();
    const disp = loader.load("./public/displace/heightmap2.png");

    // Set texture properties for displacement
    texture1.minFilter = texture2.minFilter = disp.minFilter = THREE.LinearFilter;
    texture1.magFilter = texture2.magFilter = disp.magFilter = THREE.LinearFilter;
    texture1.anisotropy =
        texture2.anisotropy =
        disp.anisotropy =
        renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

    // Create scene
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        width / -2,
        width / 2,
        height / 2,
        height / -2,
        1,
        1000
    );
    camera.position.z = 1;

    // Stärke des Displacement-Effekts zentral steuern
    const DISTORTION_STRENGTH = 0.1;

    // Shader uniforms
    uniforms = {
        effectFactor: { value: DISTORTION_STRENGTH },
        dispFactor: { value: 0.0 },
        texture1: { value: texture1 },
        texture2: { value: texture2 },
        disp: { value: disp },
    };

    // Vertex shader
    const vertexShader = `
    varying vec2 vUv;
    void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
    `;

    // Fragment shader
    const fragmentShader = `
    varying vec2 vUv;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform sampler2D disp;
    uniform float dispFactor;
    uniform float effectFactor;

    void main() {
        vec2 uv = vUv;
        vec4 disp = texture2D(disp, uv);
        vec2 distortedPosition = uv;
        vec2 distortedPosition2 = uv;
        if (dispFactor > 0.0 && dispFactor < 1.0) {
            distortedPosition = uv + vec2(dispFactor * (disp.r*effectFactor), 0.0);
            distortedPosition2 = uv - vec2((1.0 - dispFactor) * (disp.r*effectFactor), 0.0);
        }
        vec4 _texture1 = texture2D(texture1, distortedPosition);
        vec4 _texture2 = texture2D(texture2, distortedPosition2);
        gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
    `;

    // Create material and mesh
    material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        transparent: true,
    });

    // Helper to create mesh with correct aspect ratio and centered
    function createCenteredMesh(videoWidth, videoHeight, containerWidth, containerHeight) {
        // Video soll volle Höhe ausfüllen, Breite darf überstehen
        const videoRatio = videoWidth / videoHeight;
        const drawHeight = containerHeight;
        const drawWidth = containerHeight * videoRatio;
        const geometry = new THREE.PlaneGeometry(drawWidth, drawHeight, 1);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 0, 0); // Exakt zentriert
        return mesh;
    }

    // Initial mesh (will be replaced after video metadata loaded)
    mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 1), material);
    scene.add(mesh);

    // Handle resize and centering
    function updateGeometryToVideoRatio() {
        rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        renderer.setSize(width, height);
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();

        // Only update mesh if video metadata is loaded
        if (video1.videoWidth && video1.videoHeight) {
            // Remove old mesh
            scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            // Create new centered mesh
            mesh = createCenteredMesh(
                video1.videoWidth,
                video1.videoHeight,
                width,
                height
            );
            scene.add(mesh);
        }
    }
    video1.addEventListener("loadedmetadata", updateGeometryToVideoRatio);
    window.addEventListener("resize", updateGeometryToVideoRatio);

    // Render loop
    function animate() {
        // Update video textures
        if (texture1) texture1.needsUpdate = true;
        if (texture2) texture2.needsUpdate = true;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // LocomotiveScroll: Shader-Effekt ab horizontalem Scroll von 400
    let shaderTriggered = false;
    locoScroll.on("scroll", (obj) => {
        const scrollX = locoScroll.scroll.instance.scroll.x;
        if (!shaderTriggered && scrollX >= 400) {
            shaderTriggered = true;
            gsap.to(uniforms.dispFactor, {
                value: 1,
                duration: 1.2,
                ease: "power2.inOut",
            });
        } else if (shaderTriggered && scrollX < 400) {
            shaderTriggered = false;
            gsap.to(uniforms.dispFactor, {
                value: 0,
                duration: 1.2,
                ease: "power2.inOut",
            });
        }
    })

});