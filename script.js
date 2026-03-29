import * as pdfjsLib from './pdfjs/build/pdf.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = './pdfjs/build/pdf.worker.mjs';

//PDF Logic ---------------------------------------
const url = './Media/Carlos Ruiz_Resume2026_BetterFormat.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageIsRendering = false,
    pageNumIsPending = null;

const scale = 1.5;

// Get elements safely with null checks
const canvas = document.querySelector('#pdf-render');
const ctx = canvas ? canvas.getContext('2d') : null;
const pageCountEl = document.querySelector('#page-count');
const pageNumEl = document.querySelector('#page-num');
const prevBtn = document.querySelector('#pdfPrevious');
const nextBtn = document.querySelector('#pdfNext');

// Render the page
const renderPage = async (num) => {
    if (!pdfDoc || !canvas || !ctx) return;
    
    if (num <= 0 || num > pdfDoc.numPages) return;
    
    pageIsRendering = true;
    
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
    pageIsRendering = false;
    
    if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
    }
};

// Get Document
pdfjsLib.getDocument(url).promise
    .then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
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