window.addEventListener("load", function () {

    document.getElementById("link2").addEventListener("click", function () {
        triggerLoad("kol2.html");
        window.location.href = "kol2.html"

    });

    gsap.registerPlugin(ScrollTrigger);

    const scroller = this.document.querySelector('[data-scroll-container]')
    
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
        }
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
                height: window.innerHeight
            };
        },
        pinType: scroller.style.transform ? "transform" : "fixed"
    });

    ScrollTrigger.defaults({
        scroller: scroller
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
        y: () => -(document.querySelector('.anim-wrap').scrollHeight - window.innerHeight),
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
                refreshPriority: 1
            },
            x: 0,
            ease: "none"
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
                containerAnimation: ScrollTween
            },
            y: 210,
            ease: "none"
        });

        gsap.to(title, {
            scrollTrigger: {
                trigger: gsVs,
                start: () => "left right",
                end: () => "right left",
                scrub: 1.5,
                horizontal: false,
                refreshPriority: 1,
                containerAnimation: ScrollTween
            },
            y: 85,
            ease: "none"
        });
    });


    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();


    // Smooth Image Distortion Transition with Three.js, GSAP, and Displacement Map

    // Import Three.js if not already loaded

    let renderer, scene, camera, material, mesh;
    let uniforms;
    const container = document.querySelector('.distortion');
    let rect = container.getBoundingClientRect();
    let width = rect.width;
    let height = rect.height;

    // Load textures
    const loader = new THREE.TextureLoader();
    const texture1 = loader.load('./public/displace/1.png');
    const texture2 = loader.load('./public/displace/2.png');
    const disp = loader.load('./public/displace/heightmap2.png');
    

    // Set texture properties for displacement
    texture1.minFilter = texture2.minFilter = disp.minFilter = THREE.LinearFilter;
    texture1.magFilter = texture2.magFilter = disp.magFilter = THREE.LinearFilter;
    texture1.anisotropy = texture2.anisotropy = disp.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

    // Create scene
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.OrthographicCamera(
        width / -2, width / 2, height / 2, height / -2, 1, 1000
    );
    camera.position.z = 1;

    // Stärke des Displacement-Effekts zentral steuern
    const DISTORTION_STRENGTH = .1; // Hier Wert anpassen (z.B. 0.2 = schwach, 2.0 = sehr stark)

    // Shader uniforms
    uniforms = {
        effectFactor: { value: DISTORTION_STRENGTH },
        dispFactor: { value: 0.0 },
        texture1: { value: texture1 },
        texture2: { value: texture2 },
        disp: { value: disp }
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
        // Verzerrung nur horizontal (x-Achse)
        vec2 distortedPosition = uv + vec2(dispFactor * (disp.r*effectFactor), 0.0);
        vec2 distortedPosition2 = uv - vec2((1.0 - dispFactor) * (disp.r*effectFactor), 0.0);
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
        transparent: true
    });

    const geometry = new THREE.PlaneGeometry(width, height, 1);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Handle resize
    function onResize() {
        rect = container.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        renderer.setSize(width, height);
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(width, height, 1);
    }
    window.addEventListener('resize', onResize);

    // Render loop
    function animate() {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();

    // LocomotiveScroll: Shader-Effekt ab horizontalem Scroll von 400
    let shaderTriggered = false;
    locoScroll.on('scroll', (obj) => {
        const scrollX = locoScroll.scroll.instance.scroll.x;
        if (!shaderTriggered && scrollX >= 400) {
            shaderTriggered = true;
            gsap.to(uniforms.dispFactor, {
                value: 1,
                duration: 1.2,
                ease: 'power2.inOut'
            });
        } else if (shaderTriggered && scrollX < 400) {
            shaderTriggered = false;
            gsap.to(uniforms.dispFactor, {
                value: 0,
                duration: 1.2,
                ease: 'power2.inOut'
            });
        }
    });

    // Bild nicht gestreckt anzeigen: Passe PlaneGeometry, Renderer und Container exakt an Bildseitenverhältnis an
    function updateGeometryToImageRatio() {
        const img = new window.Image();
        img.src = './public/displace/1.png';
        img.onload = function() {
            const imgRatio = img.width / img.height;
            // Container-Höhe bleibt wie im Layout, Breite wird angepasst
            rect = container.getBoundingClientRect();
            height = rect.height;
            width = height * imgRatio;
            // Setze Container und Canvas exakt auf Bildgröße
            container.style.width = width + 'px';
            container.style.height = height + 'px';
            renderer.setSize(width, height);
            // Passe Kamera an
            camera.left = width / -2;
            camera.right = width / 2;
            camera.top = height / 2;
            camera.bottom = height / -2;
            camera.updateProjectionMatrix();
            // Passe PlaneGeometry an
            mesh.geometry.dispose();
            mesh.geometry = new THREE.PlaneGeometry(width, height, 1);
        };
    }
    updateGeometryToImageRatio();
    window.addEventListener('resize', updateGeometryToImageRatio);
});