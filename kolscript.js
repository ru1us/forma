window.addEventListener("load", function () {

    window.addEventListener("scroll", function () {
        const parallaxImages = document.querySelectorAll(".parallax-image");
        parallaxImages.forEach((image) => {
            const speed = 0.1; // Adjust speed as needed
            const offset = window.scrollY * speed;
            image.style.transform = `translateY(${offset}px)`;
        });
    });

    this.document.querySelectorAll("nav .logo").forEach((img) => {
        console.log("Adding click event listener to logo image:", img);
        img.addEventListener("click", () => {
            triggerLoad("index.html");
            this.window.location.href = "index.html";
        });
    });

    const mainPic = document.querySelector("#mainpic");
    if (!mainPic) {
        console.error("Element with id 'mainpic' not found in the DOM.");
        return;
    }

    const imagesContainer = document.querySelector(".left");
    const descContainer = document.querySelector(".desc");
    const icons = document.querySelectorAll(".icons img");

    function updateImages(dataset) {
        imagesContainer.innerHTML = "";

        dataset.left.forEach(item => {
            const img = document.createElement("img");
            img.src = item.src;
            img.dataset.title = item.title;
            img.dataset.description = item.description;
            imagesContainer.appendChild(img);
        });

        const images = document.querySelectorAll(".left img");
        images.forEach(img => {
            img.addEventListener("click", function (e) {
                console.log("img clicked", img);
                let link = e.target.src;
                mainPic.src = link;

                if (descContainer) {
                    descContainer.innerHTML = `
                        <h2>${e.target.dataset.title}</h2>
                        <p>${e.target.dataset.description}</p>
                    `;
                }

                images.forEach(img => {
                    img.style.filter = "none";
                    img.style.boxShadow = "none";
                    img.style.scale = "1";
                });

                e.target.style.filter = "brightness(200%)";
                e.target.style.scale = "1.01";
            });
        });

        if (images.length > 0) {
            images[0].click();
        }
    }

    const defaultDataset = {
        left: [
            {
                src: "public/scene1.png",
                title: "scnene1",
                description: "This is a description for the scene1 image."
            },
            {
                src: "public/scene2.png",
                title: "scene2",
                description: "This is a description for the scene2 image."
            },
            {
                src: "public/scene3.png",
                title: "scene3",
                description: "This is a description for the scene3 image."
            },
            {
                src: "public/scene4.png",
                title: "scene4",
                description: "This is a description for the scene4 image."
            },
            {
                src: "public/scene5.png",
                title: "scene5",
                description: "This is a description for the scene5 image."
            }
        ]
    };

    updateImages(defaultDataset);

    icons.forEach((icon, index) => {
        icon.addEventListener("click", () => {
            console.log("Icon clicked:", index);

            const datasets = [
                {
                    left: [
                        {
                            src: "public/scene1.png",
                            title: "scene1",
                            description: "This is a description for the scene1 picture."
                        },
                        {
                            src: "public/scene2.png",
                            title: "scene2",
                            description: "This is a description for the scene2 picture."
                        },
                        {
                            src: "public/scene3.png",
                            title: "scene3",
                            description: "This is a description for the scene3 picture."
                        },
                        {
                            src: "public/scene4.png",
                            title: "scene4",
                            description: "This is a description for the scene4 picture."
                        },
                        {
                            src: "public/scene5.png",
                            title: "scene5",
                            description: "This is a description for the scene5 picture."
                        }
                    ]
                },
                {
                    left: [
                        {
                            src: "public/water1.png",
                            title: "water1",
                            description: "This is a description for the water1 picture."
                        },
                        {
                            src: "public/water2.png",
                            title: "water2",
                            description: "This is a description for the water2 picture."
                        },
                        {
                            src: "public/water3.png",
                            title: "water3",
                            description: "This is a description for the water3 picture."
                        },
                        {
                            src: "public/water4.png",
                            title: "water4",
                            description: "This is a description for the water4 picture."
                        }
                    ]
                },
                {
                    left: [
                        {
                            src: "public/lamp1.png",
                            title: "lamp1",
                            description: "This is a description for the lamp1 picture."
                        },
                        {
                            src: "public/lamp2.png",
                            title: "lamp2",
                            description: "This is a description for the lamp2 picture."
                        },
                        {
                            src: "public/lamp3.png",
                            title: "lamp3",
                            description: "This is a description for the lamp3 picture."
                        }
                    ]
                },
                {
                    left: [
                        {
                            src: "public/chair1.png",
                            title: "chair1",
                            description: "This is a description for the chair1 picture."
                        },
                        {
                            src: "public/chair2.png",
                            title: "chair2",
                            description: "This is a description for the chair2 picture."
                        },
                        {
                            src: "public/chair3.png",
                            title: "chair3",
                            description: "This is a description for the chair3 picture."
                        },
                        {
                            src: "public/chair4.png",
                            title: "chair4",
                            description: "This is a description for the chair4 picture."
                        }
                    ]
                }
            ];

            if (datasets[index]) {
                updateImages(datasets[index]);
            } else {
                console.error(`No dataset found for icon at index ${index}`);
            }
        });
    });
});
