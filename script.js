console.log('Script file is being loaded');

class Slideshow {
    constructor(container) {
        this.container = container;
        this.slides = container.querySelectorAll('.slide');
        this.currentIndex = 0;
        this.videoIndex = 0;
        this.zoomed = false;

        container.querySelector('.prev').addEventListener('click', () => this.showSlide(this.currentIndex-1));
        container.querySelector('.next').addEventListener('click', () => this.showSlide(this.currentIndex+1));
        container.querySelector('#toggle-slideshow-zoom').addEventListener('click', () => this.toggleZoomedView());
        this.showSlide(0);
    }

    showSlide(index) {
        if (this.slides.length == 0) return;

        this.currentIndex = (index + this.slides.length) % this.slides.length;

        this.slides.forEach((slide) => {
            var videoSlide = slide.querySelector('iframe');
            if(videoSlide instanceof HTMLIFrameElement){
                    videoSlide.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
            }
            slide.style.display = 'none';
        });

        this.slides[this.currentIndex].style.display = 'block';
    }

    toggleZoomedView() {
        console.log('toggle zoom')
        this.zoomed = !this.zoomed;
        
        if(this.zoomed)
        {
            this.container.className = 'lightbox';
            this.container.querySelector('.toggle-slideshow-zoom').querySelector('i').className = "fas fa-search-minus";
        }
        else
        {
            this.container.className = 'slideshow';
            this.container.querySelector('.toggle-slideshow-zoom').querySelector('i').className = "fas fa-search-plus";
        }
        console.log(this.container.className);
    }
}

document.querySelectorAll('[data-slideshow]').forEach(container => {
    new Slideshow(container);
});

let pdfjsLib;

//PDF Logic Variables
const url = './Media/Carlos Ruiz_Resume2026_BetterFormat.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5;

// Variables for DOM elements (will be set after DOM is ready)
let canvases = [];
let ctx = null;
let pageCountEl = null;
let pageNumEl = null;
let prevBtn = null;
let nextBtn = null;

// Render the page
const renderPage = async (num) => {
    if (!pdfDoc || canvases.length === 0) {
        console.warn('PDF document or canvas not ready');
        return;
    }
    
    if (num <= 0 || num > pdfDoc.numPages) {
        console.warn(`Invalid page number: ${num}`);
        return;
    }
    
    pageIsRendering = true;
    
    try {
        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale });
        
        // Render to all canvases
        for (let canvas of canvases) {
            const canvasCtx = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: canvasCtx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
        }
        
        if (pageNumEl) pageNumEl.textContent = num;
        console.log(`Rendered page ${num}`);
    } catch (err) {
        console.error('Error rendering page:', err);
    }
    
    pageIsRendering = false;
    
    if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
    }
};

// Initialize PDF viewer when DOM is ready
const initPDFViewer = () => {
    // Get elements from DOM - use class selector to get all canvas elements
    canvases = Array.from(document.querySelectorAll('canvas.pdf-render'));
    if (canvases.length === 0) {
        console.warn('PDF canvas element not found');
        return;
    }
    
    pageCountEl = document.querySelector('#page-count');
    pageNumEl = document.querySelector('#page-num');
    prevBtn = document.querySelector('#pdfPrevious');
    nextBtn = document.querySelector('#pdfNext');
    
    // Load the PDF document
    pdfjsLib.getDocument(url).promise
        .then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            console.log(`PDF loaded successfully. Pages: ${pdfDoc.numPages}`);
            if (pageCountEl) pageCountEl.textContent = pdfDoc.numPages;
            renderPage(pageNum);
        })
        .catch(err => {
            console.error('Error loading PDF:', err);
        });
    
    // Event listeners for navigation
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (pageNum <= 1) return;
            pageNum--;
            pageNumIsPending = null;
            if (pageIsRendering) {
                pageNumIsPending = pageNum;
            } else {
                renderPage(pageNum);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
            pageNum++;
            pageNumIsPending = null;
            if (pageIsRendering) {
                pageNumIsPending = pageNum;
            } else {
                renderPage(pageNum);
            }
        });
    }
    
    // Download button listener
    const downloadBtn = document.querySelector('#pdfDownload');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Carlos Ruiz_Resume2026_BetterFormat.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
};

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded - initializing with PDF.js available');
        if (pdfjsLib) {
            initPDFViewer();
        }
    });
} else {
    // DOM is already loaded
    if (pdfjsLib) {
        initPDFViewer();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const resumeBtn = document.getElementById('resumeBtn');
    const resumeDropdown = document.getElementById('resumeDropdown');

    resumeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        resumeDropdown.classList.toggle('active');
        console.log('Classes after toggle:', resumeDropdown.className);
    });

    const dropdownItems = resumeDropdown.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function () {
            console.log('Dropdown item clicked');
            resumeDropdown.classList.remove('active');
        })
    });
    document.addEventListener('click', function(e) {
        if(!e.target.closest('.resume-dropdown')) {
            resumeDropdown.classList.remove('active');
        }
    });
});

