document.addEventListener("DOMContentLoaded", () => {
  // Start media preloader if conditions are met
  if (shouldRunPreloader()) {
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
  } else {
    warning.style.display = "none";
    document.body.style.overflow = "";
  }
}
window.addEventListener("resize", checkDesktopOnly);
window.addEventListener("DOMContentLoaded", checkDesktopOnly);

// Check if preloader should run
function shouldRunPreloader() {
  return window.innerWidth >= 1100 && !sessionStorage.getItem("mediaPreloaded");
}

// All HTML files to scan for media
const htmlFiles = [
  "index.html",
  "kol1.html",
  "kol2.html"
];

// Additional known media files
const additionalMedia = [
  "./public/displace/1.png",
  "./public/displace/2.png",
  "./public/displace/heightMap.png",
  "./public/displace/heightmap2.png",
  "./public/displace/video1.mp4",
  "./public/displace/video2.mp4"
];

// Extract media URLs from HTML content
function extractMediaUrls(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const mediaUrls = [];
  
  // Get all images
  const images = doc.querySelectorAll("img");
  images.forEach(img => {
    const src = img.getAttribute("src");
    if (src && !src.startsWith("data:") && !src.startsWith("http")) {
      mediaUrls.push(src);
    }
  });
  
  // Get all videos
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
  
  // Get CSS background images from style attributes
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

// Load a single media file
function loadMedia(url) {
  return new Promise((resolve, reject) => {
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      // Load video
      const video = document.createElement("video");
      video.onloadeddata = () => resolve(url);
      video.onerror = () => reject(new Error(`Failed to load video: ${url}`));
      video.src = url;
      video.load();
    } else if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
      // Load image
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    } else {
      // Try to load as generic resource
      fetch(url)
        .then(response => response.ok ? resolve(url) : reject(new Error(`Failed to load: ${url}`)))
        .catch(() => reject(new Error(`Failed to load: ${url}`)));
    }
  });
}

// Update progress display
function updateProgress(loaded, total) {
  const percentage = Math.round((loaded / total) * 100);
  const progressElement = document.querySelector(".progress-percentage");
  const progressBar = document.querySelector(".progress-bar");
  
  if (progressElement) {
    progressElement.textContent = `${percentage}%`;
  }
  
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
  }
}

// Main preloader function
async function startMediaPreloader() {
  console.log("Starting media preloader...");
  
  try {
    // Show loading screen
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "flex";
    }
    
    // Collect all media URLs
    let allMediaUrls = [...additionalMedia];
    
    // Load HTML files and extract media URLs
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
    
    // Remove duplicates and filter valid URLs
    allMediaUrls = [...new Set(allMediaUrls)].filter(url => url && url.trim() !== "");
    
    console.log(`Found ${allMediaUrls.length} media files to preload`);
    
    // Load all media files
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
    
    // Wait for all media to load
    await Promise.all(loadPromises);
    
    // Mark as preloaded
    sessionStorage.setItem("mediaPreloaded", "true");
    
    console.log("Media preloading complete!");
    
    // Hide loading screen after a short delay
    setTimeout(() => {
      if (loadingScreen) {
        loadingScreen.style.display = "none";
      }
    }, 500);
    
  } catch (error) {
    console.error("Error during media preloading:", error);
    // Hide loading screen on error
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }
}
