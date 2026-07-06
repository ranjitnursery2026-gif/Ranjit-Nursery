const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');

// We want to extract the inner HTML of the body.
// But keeping the same structure is easier if we just copy the body content.
const bodyStart = indexContent.indexOf('<body');
const bodyStartClose = indexContent.indexOf('>', bodyStart) + 1;
const bodyEnd = indexContent.indexOf('<script>', bodyStartClose); // before the modal scripts

if (bodyStart === -1 || bodyEnd === -1) {
    console.error("Could not find body tags");
    process.exit(1);
}

let bodyContent = indexContent.slice(bodyStartClose, bodyEnd);

// Remove the preloader from the extracted views, as it should stay in index.html
const preloaderStart = bodyContent.indexOf('<!-- ================= PRELOADER ================= -->');
const desktopViewStart = bodyContent.indexOf('<!-- ================= DESKTOP VIEW ================= -->');
if (preloaderStart !== -1 && desktopViewStart !== -1) {
    bodyContent = bodyContent.slice(0, preloaderStart) + bodyContent.slice(desktopViewStart);
}

// Ensure the views directory exists
if (!fs.existsSync('./public/views')) {
    fs.mkdirSync('./public/views', { recursive: true });
}

// Write the full body content to both for now. 
// The user will edit them separately to simplify their workflow.
fs.writeFileSync('./public/views/indexWeb.html', bodyContent);
fs.writeFileSync('./public/views/indexMob.html', bodyContent);

// Now update index.html to dynamically load them
const newIndexContent = indexContent.slice(0, bodyStartClose) + `
  <!-- ================= PRELOADER ================= -->
  ` + indexContent.slice(indexContent.indexOf('<style>', preloaderStart), desktopViewStart !== -1 ? indexContent.indexOf('<!-- ================= DESKTOP VIEW ================= -->', preloaderStart) : indexContent.indexOf('<div id="desktop-view"')) + `
  
  <!-- Dynamic View Container -->
  <div id="dynamic-view-container"></div>

  <script>
    // Dynamically load Mobile or Desktop view
    async function loadView() {
      const isMobile = window.innerWidth < 768;
      const viewUrl = isMobile ? '/views/indexMob.html' : '/views/indexWeb.html';
      
      try {
        const response = await fetch(viewUrl);
        const html = await response.text();
        document.getElementById('dynamic-view-container').innerHTML = html;
        
        // Dispatch event so main.js knows the DOM is ready
        window.dispatchEvent(new Event('view-loaded'));
      } catch (err) {
        console.error("Failed to load view", err);
      }
    }
    
    loadView();
    // Handle resize swapping (optional, but good for dev)
    let lastIsMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
        const isMobile = window.innerWidth < 768;
        if (isMobile !== lastIsMobile) {
            lastIsMobile = isMobile;
            loadView(); // Reload the other view
        }
    });
  </script>
` + indexContent.slice(bodyEnd);

fs.writeFileSync('index.html', newIndexContent);
console.log("Successfully split index.html!");
