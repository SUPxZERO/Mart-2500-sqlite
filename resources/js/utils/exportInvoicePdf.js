import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Preload all images in an element to ensure they render in canvas
 * @param {HTMLElement} element - The element containing images
 * @returns {Promise<void>}
 */
async function preloadImages(element) {
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
        return new Promise((resolve) => {
            if (img.complete) {
                resolve();
            } else {
                img.onload = () => resolve();
                img.onerror = () => {
                    console.warn('⚠️  Image failed to load:', img.src);
                    resolve(); // Continue even if image fails
                };
                // Trigger load if not already loaded
                img.src = img.src;
            }
        });
    });

    await Promise.all(imagePromises);
    console.log('🖼️  All images preloaded');
}

/**
 * Clone element and apply proper styling for PDF conversion
 * @param {HTMLElement} element - The element to clone and style
 * @returns {HTMLElement} - The styled clone
 */
function prepareElementForPdf(element) {
    // Clone the element
    const clone = element.cloneNode(true);
    
    // Create temporary container with proper styling
    const container = document.createElement('div');
    container.id = 'pdf-export-container-temp';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 1200px;
        z-index: -1;
        opacity: 0;
        pointer-events: none;
    `;
    
    // Append clone to container
    container.appendChild(clone);
    
    // Add temporarily to DOM where it can be rendered
    document.body.appendChild(container);

    // Force browser to render the element
    void container.offsetHeight;

    // Apply consistent styling to clone and all children
    clone.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
        background-color: #ffffff !important;
        color: #000000 !important;
        width: 100% !important;
        height: auto !important;
    `;

    // Process all elements in the clone
    const allElements = clone.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove print:hidden class and display: none
        el.classList.remove('print:hidden');
        el.style.display = '';
        el.style.visibility = 'visible !important';
        el.style.opacity = '1 !important';

        // Check if element should be hidden based on original
        let originalEl = null;
        if (el.id) {
            originalEl = element.querySelector(`#${CSS.escape(el.id)}`);
        }
        if (!originalEl && el.dataset.cloneId) {
            originalEl = element.querySelector(`[data-clone-id="${el.dataset.cloneId}"]`);
        }
        
        if (originalEl) {
            const computedStyle = window.getComputedStyle(originalEl);
            if (computedStyle.display === 'none') {
                el.style.display = 'none !important';
            }
        }

        // Apply font family
        if (!el.style.fontFamily || el.style.fontFamily === '') {
            el.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        }

        // Ensure text has proper color (but not for images)
        if (el.tagName !== 'IMG' && el.tagName !== 'SVG') {
            el.style.color = '#000000';
            el.style.backgroundColor = 'transparent';
        }
    });

    console.log('🎨 Element prepared for PDF conversion');
    return { clone, container };
}

/**
 * Export invoice element as PDF with error handling
 * @param {HTMLElement} element - The invoice element to convert
 * @param {string} filename - The PDF filename
 * @returns {Promise<void>}
 */
export async function exportInvoicePdf(element, filename) {
    if (!element) {
        const error = 'Invoice element not found.';
        console.error('❌', error);
        alert('Error: ' + error);
        throw new Error(error);
    }

    // Validate filename
    const safeFilename = (filename || 'invoice').replace(/[^a-z0-9-_.]/gi, '_');

    console.log('📄 Starting PDF export for:', safeFilename);

    let preparedElements = null;

    try {
        // Step 1: Preload all images
        console.log('🔄 Preloading images...');
        await preloadImages(element);

        // Step 2: Prepare element with proper styling for PDF
        console.log('🎨 Preparing element for PDF conversion...');
        preparedElements = prepareElementForPdf(element);
        const elementToConvert = preparedElements.clone;

        // Wait longer for styles to compute and render
        console.log('⏳ Waiting for render...');
        await new Promise(resolve => setTimeout(resolve, 500));

        // Verify element has content
        const textContent = elementToConvert.textContent?.trim();
        if (!textContent) {
            throw new Error('Cloned element appears to be empty. Content may not have rendered properly.');
        }
        console.log('✅ Element content verified');

        // Step 3: Convert element to canvas with optimized settings
        console.log('🖼️ Converting to canvas...');
        const canvas = await html2canvas(elementToConvert, {
            scale: 2, // Higher scale for better quality
            useCORS: true, // Enable CORS for external images
            allowTaint: true, // Allow tainted canvas (mixed content)
            backgroundColor: '#ffffff',
            logging: true, // Enable logging for debugging
            windowWidth: 1200, // Fixed width for consistent rendering
            letterRendering: true, // Better text rendering
            foreignObjectRendering: true,
        });

        // Check if canvas has content
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error('Canvas conversion produced empty result.');
        }

        console.log('✅ Canvas created successfully, size:', canvas.width, 'x', canvas.height);

        // Step 4: Convert canvas to PDF
        console.log('📝 Generating PDF...');
        const imageData = canvas.toDataURL('image/png');
        
        // Verify image data
        if (!imageData || imageData.length === 0) {
            throw new Error('Failed to convert canvas to image data.');
        }

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imageWidth = pageWidth;
        const imageHeight = (canvas.height * imageWidth) / canvas.width;

        console.log('📐 PDF dimensions:', pageWidth, 'x', pageHeight, 'mm, image:', imageHeight, 'mm');

        // Add image with proper scaling to avoid cutoff
        let heightLeft = imageHeight;
        let position = 0;

        // First page
        pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
        heightLeft -= pageHeight;

        // Additional pages if needed
        let pageCount = 1;
        while (heightLeft > 10) {
            position = heightLeft - imageHeight;
            pdf.addPage();
            pdf.addImage(imageData, 'PNG', 0, position, imageWidth, imageHeight);
            heightLeft -= pageHeight;
            pageCount++;
        }

        console.log('📄 PDF has', pageCount, 'page(s)');

        // Step 5: Save PDF
        console.log('💾 Saving PDF...');
        pdf.save(`${safeFilename}.pdf`);
        console.log('✅ PDF exported successfully:', safeFilename);

    } catch (error) {
        const errorMessage = error?.message || String(error);
        console.error('❌ PDF export failed:', {
            message: errorMessage,
            stack: error?.stack,
            timestamp: new Date().toISOString(),
        });

        // User-friendly error messages
        let userMessage = 'Failed to generate PDF';
        if (errorMessage.includes('canvas') || errorMessage.includes('empty')) {
            userMessage = 'PDF content is empty. Try refreshing the page and downloading again.';
        } else if (errorMessage.includes('image') || errorMessage.includes('Image')) {
            userMessage = 'Failed to load invoice content. Check your internet connection.';
        } else if (errorMessage.includes('timeout')) {
            userMessage = 'PDF generation timed out. Invoice might be too large.';
        }

        // Show error to user
        alert(`Error: ${userMessage}\n\nTechnical: ${errorMessage}`);

        throw error;
    } finally {
        // Clean up: Remove the temporary container
        if (preparedElements?.container) {
            try {
                document.body.removeChild(preparedElements.container);
                console.log('🧹 Cleaned up temporary elements');
            } catch (e) {
                console.warn('⚠️ Could not clean up temporary elements:', e);
            }
        }
    }
}
