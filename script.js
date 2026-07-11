console.log('Script file is being loaded');

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
    showSlides();
}

document.addEventListener('DOMContentLoaded', () => {

    const slides = document.querySelectorAll('.slide');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    let currentIndex = 0;

    const showSlide = (index) => {
        slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('active', slideIndex === index);
        });
    };

    if(prevButton && nextButton) {
        prevButton.addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(currentIndex);
        });

        nextButton.addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % slides.length;
            showSlide(currentIndex);
        });

        showSlide(currentIndex);
    }

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

// // Resume dropdown functionality
// const initResumeDropdown = () => {
//     console.log('initResumeDropdown called');
//     const resumeBtn = document.getElementById('resumeBtn');
//     const resumeDropdown = document.getElementById('resumeDropdown');
    
//     console.log('resumeBtn:', resumeBtn);
//     console.log('resumeDropdown:', resumeDropdown);
    
//     if (!resumeBtn || !resumeDropdown) {
//         console.warn('Resume button or dropdown not found');
//         return;
//     }
    
//     // Toggle dropdown on button click
//     resumeBtn.addEventListener('click', function(e) {
//         console.log('Resume button clicked');
//         e.preventDefault();
//         e.stopPropagation();
//         resumeDropdown.classList.toggle('active');
//         console.log('Classes after toggle:', resumeDropdown.className);
//     });
    
//     // Close dropdown when clicking on a dropdown item
//     const dropdownItems = resumeDropdown.querySelectorAll('.dropdown-item');
//     dropdownItems.forEach(item => {
//         item.addEventListener('click', function() {
//             console.log('Dropdown item clicked');
//             resumeDropdown.classList.remove('active');
//         });
//     });
    
//     // Close dropdown when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!e.target.closest('.resume-dropdown')) {
//             resumeDropdown.classList.remove('active');
//         }
//     });
    
//     console.log('Resume dropdown initialized');
// };

// // Try to initialize immediately
// console.log('Script loaded, DOM ready state:', document.readyState);
// if (document.readyState === 'loading') {
//     console.log('DOM still loading, waiting for DOMContentLoaded');
//     document.addEventListener('DOMContentLoaded', () => {
//         console.log('DOMContentLoaded fired');
//         initResumeDropdown();
//     });
// } else {
//     console.log('DOM already loaded, initializing immediately');
//     initResumeDropdown();
// }

// // Also try a setTimeout fallback
// setTimeout(() => {
//     console.log('Timeout check - looking for resume button');
//     if (document.getElementById('resumeBtn') && !document.getElementById('resumeBtn').hasListener) {
//         console.log('Re-initializing dropdown via timeout');
//         initResumeDropdown();
//         document.getElementById('resumeBtn').hasListener = true;
//     }
// }, 500);