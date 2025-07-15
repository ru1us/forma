window.addEventListener("load", function () {
  this.document.querySelectorAll("nav .logo").forEach((img) => {
    console.log("Adding click event listener to logo image:", img);
    img.addEventListener("click", () => {
      triggerLoad("index.html");
      this.window.location.href = "index.html";
    });
  });

  const mainPic = document.querySelector("#mainpic");
  const imagesContainer = document.querySelector(".left");
  const descContainer = document.querySelector(".desc");
  const rightContainer = document.querySelector(".container .right");

  function setupSimpleMediaSwitch(container, mainMedia) {
    if (!container || !mainMedia) return;
    const mediaThumbs = container.querySelectorAll("img, video");
    let currentMainMedia = mainMedia;
    let progressBar = null;

    function setActiveMedia(media) {

      if (progressBar && progressBar.parentNode) {
        progressBar.parentNode.removeChild(progressBar);
        progressBar = null;
      }

      if (currentMainMedia.tagName !== media.tagName) {
        let newMedia;
        if (media.tagName === "VIDEO") {
          newMedia = document.createElement("video");
          newMedia.src = media.src;
          newMedia.poster = media.poster || "";
          newMedia.autoplay = true;
          newMedia.loop = true;
          newMedia.controls = false;
          newMedia.className = currentMainMedia.className;
          newMedia.id = currentMainMedia.id;
        } else {
          newMedia = document.createElement("img");
          newMedia.src = media.src;
          newMedia.className = currentMainMedia.className;
          newMedia.id = currentMainMedia.id;
        }
        currentMainMedia.parentNode.replaceChild(newMedia, currentMainMedia);
        currentMainMedia = newMedia;
      } else {
        currentMainMedia.src = media.src;
        if (currentMainMedia.tagName === "VIDEO") {
          currentMainMedia.poster = media.poster || "";
          currentMainMedia.autoplay = true;
          currentMainMedia.loop = true;
          currentMainMedia.controls = false;
        }
      }

      mediaThumbs.forEach((m) => {
        m.style.opacity = "1";
      });
      media.style.opacity = "0.6";

      if (currentMainMedia.tagName === "VIDEO") {
        progressBar = document.createElement("div");
        progressBar.className = "video-progress-bar";
        progressBar.style.height = "4px";
        progressBar.style.width = "100%";
        progressBar.style.background = "#eee";
        progressBar.style.position = "relative";
        progressBar.style.marginTop = "8px";
        let innerBar = document.createElement("div");
        innerBar.style.height = "100%";
        innerBar.style.width = "0%";
        innerBar.style.background = "#B48B67";
        innerBar.style.transition = "width 0.1s linear";
        progressBar.appendChild(innerBar);
        currentMainMedia.parentNode.appendChild(progressBar);
        currentMainMedia.addEventListener("timeupdate", function () {
          if (currentMainMedia.duration) {
            innerBar.style.width =
              (currentMainMedia.currentTime / currentMainMedia.duration) * 100 +
              "%";
          }
        });
        currentMainMedia.addEventListener("ended", function () {
          innerBar.style.width = "100%";
        });
      }
    }

    mediaThumbs.forEach((media) => {
      media.addEventListener("click", function () {
        setActiveMedia(media);
      });
    });
    if (mediaThumbs.length > 0) {
      setActiveMedia(mediaThumbs[0]);
    }
  }

  document.querySelectorAll(".snap-section").forEach((section) => {
    const left = section.querySelector(".left");
    const mainMedia = section.querySelector(".parallax-image");
    setupSimpleMediaSwitch(left, mainMedia);
  });
});
