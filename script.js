import * as pdfjsLib from './pdfjs/build/pdf.mjs';

// Set worker source before using pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = './pdfjs/build/pdf.worker.mjs';

//PDF Logic ---------------------------------------
const url = './Media/Carlos Ruiz_Resume2026_BetterFormat.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5;

// Variables for DOM elements (will be set after DOM is ready)
let canvas = null;
let ctx = null;
let pageCountEl = null;
let pageNumEl = null;
let prevBtn = null;
let nextBtn = null;

// Render the page
const renderPage = async (num) => {
    if (!pdfDoc || !canvas || !ctx) {
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
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
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
    // Get elements from DOM
    canvas = document.querySelector('#pdf-render');
    ctx = canvas ? canvas.getContext('2d') : null;
    pageCountEl = document.querySelector('#page-count');
    pageNumEl = document.querySelector('#page-num');
    prevBtn = document.querySelector('#pdfPrevious');
    nextBtn = document.querySelector('#pdfNext');
    
    if (!canvas) {
        console.warn('PDF canvas element not found');
        return;
    }
    
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
};

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPDFViewer);
} else {
    // DOM is already loaded
    initPDFViewer();
}

//
//function showSlides() {
//    let i;
//    let desktopSlides = document.getElementsByClassName("slideshow-slide-desktop");
//    let mobileSlides = document.getElementsByClassName("slideshow-slide-mobile");
//
//    for (i = 0; i < desktopSlides.length; i++) {
//        desktopSlides[i].style.display = "none";
//    }
//    for (i = 0; i < mobileSlides.length; i++) {
//        mobileSlides[i].style.display = "none";
//    }
//
//    if (slideIndex >= desktopSlides.length) {
//        slideIndex = 0;
//    } else if (slideIndex < 0) {
//        slideIndex = desktopSlides.length;
//    }
//
//    desktopSlides[slideIndex].style.display = "block";
//    mobileSlides[slideIndex].style.display = "block";
//}
//
//function changeSlide(n) {
//    slideIndex += n;
//    showSlides();
//}