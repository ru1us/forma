document.addEventListener("DOMContentLoaded", () => {
  checkDesktopOnly();
  
  if (window.innerWidth >= 1100 && shouldRunPreloader()) {
    startMediaPreloader();
  }

  document.body.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (link && link.getAttribute("href")) {
      const href = link.getAttribute("href");
      if (
        href.endsWith(".html") &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto")
      ) {
        e.preventDefault();
        triggerLoad(href);
      }
    }
  });
});

export function triggerLoad(href) {
  if (
    href &&
    !href.startsWith("http") &&
    !href.startsWith("#") &&
    !href.startsWith("mailto")
  ) {
    sessionStorage.setItem("showLoaderOnLoad", "true");
    document.getElementById("loading-screen").style.display = "flex";
    setTimeout(() => {
      window.location.href = href;
    }, 100);
  } else {
    window.location.href = href;
  }
}
window.triggerLoad = triggerLoad;

function checkDesktopOnly() {
  const warning = document.getElementById("mobile-warning");
  if (window.innerWidth < 1100) {
    warning.style.display = "flex";
    document.body.style.overflow = "hidden";
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
    return false; 
  } else {
    warning.style.display = "none";
    document.body.style.overflow = "visible";
    return true; 
  }
}
window.addEventListener("resize", checkDesktopOnly);
window.addEventListener("DOMContentLoaded", checkDesktopOnly);

function shouldRunPreloader() {
  return window.innerWidth >= 1100 && !sessionStorage.getItem("mediaPreloaded");
}

const htmlFiles = [
  "https://ru1us.github.io/forma/index.html",
  "https://ru1us.github.io/forma/kol1.html",
  "https://ru1us.github.io/forma/kol2.html"
];

const additionalMedia = [
  "https://ru1us.github.io/forma/public/displace/1.png",
  "https://ru1us.github.io/forma/public/displace/2.png",
  "https://ru1us.github.io/forma/public/displace/heightMap.png",
  "https://ru1us.github.io/forma/public/displace/heightmap2.png",
  "https://ru1us.github.io/forma/public/displace/video1.mp4",
  "https://ru1us.github.io/forma/public/displace/video2.mp4"
];

function extractMediaUrls(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const mediaUrls = [];
  
  const images = doc.querySelectorAll("img");
  images.forEach(img => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("data:") && !src.startsWith("http")) {
      mediaUrls.push(src);
    }
  });
  
  const videos = doc.querySelectorAll("video");
  videos.forEach(video => {
    const src = video.getAttribute("src");
    if (src) mediaUrls.push(src);
    const sources = video.querySelectorAll("source");
    sources.forEach(source => {
      const srcAttr = source.getAttribute("src");
      if (srcAttr) mediaUrls.push(srcAttr);
    });
  });
  
  const elementsWithBg = doc.querySelectorAll("*");
  elementsWithBg.forEach(el => {
    const style = el.getAttribute("style");
    if (style && style.includes("background-image")) {
      const matches = style.match(/url\(['"]?([^'"]+)['"]?\)/g);
      if (matches) {
        matches.forEach(match => {
          const url = match.replace(/url\(['"]?(.+?)['"]?\)/, "$1");
          if (!url.startsWith("data:") && !url.startsWith("http")) {
            mediaUrls.push(url);
          }
        });
      }
    }
  });
  
  return mediaUrls;
}

function loadMedia(url) {
  return new Promise((resolve, reject) => {
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      const video = document.createElement("video");
      video.onloadeddata = () => resolve(url);
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
      video.src = url;
      video.load();
    } else if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    } else {
      fetch(url)
        .then(response => response.ok ? resolve(url) : reject(new Error(`Failed to load: ${url}`)))
        .catch(() => reject(new Error(`Failed to load: ${url}`)));
    }
  });
}

function updateProgress(loaded, total) {
  const percentage = Math.round((loaded / total) * 100);
  const progressElement = document.querySelector(".progress-percentage");
  const progressBar = document.querySelector(".loader-bar-progress");
  
  if (progressElement) {
    progressElement.textContent = `${percentage}%`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

async function startMediaPreloader() {
  console.log("Starting media preloader...");
  
  try {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
    
    let allMediaUrls = [...additionalMedia];
    
    for (const htmlFile of htmlFiles) {
      try {
        const response = await fetch(htmlFile);
        if (response.ok) {
          const htmlContent = await response.text();
          const mediaUrls = extractMediaUrls(htmlContent);
          allMediaUrls = allMediaUrls.concat(mediaUrls);
        }
      } catch (error) {
        console.warn(`Could not load ${htmlFile}:`, error);
      }
    }
    
    allMediaUrls = [...new Set(allMediaUrls)].filter(url => url && url.trim() !== "");
    
    console.log(`Found ${allMediaUrls.length} media files to preload`);
    
    let loadedCount = 0;
    const total = allMediaUrls.length;
    
    updateProgress(0, total);
    
    const loadPromises = allMediaUrls.map(async (url) => {
      try {
        await loadMedia(url);
        loadedCount++;
        updateProgress(loadedCount, total);
        console.log(`Loaded ${loadedCount}/${total}: ${url}`);
      } catch (error) {
        console.warn(`Failed to load ${url}:`, error);
        loadedCount++;
        updateProgress(loadedCount, total);
      }
    });
    
    await Promise.all(loadPromises);
    
    sessionStorage.setItem("mediaPreloaded", "true");
    
    console.log("Media preloading complete!");
    
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = "none";
      }
    }, 500);
    
  } catch (error) {
    console.error("Error during media preloading:", error);
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }
}
