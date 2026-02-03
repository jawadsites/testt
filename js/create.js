// ==================== 
// Create Page Controller 
// ==================== 

document.addEventListener('DOMContentLoaded', function() {
    initCreatePage();
});

// Global variables
let currentStep = 1;
let totalSteps = 4;
let selectedCategory = null;
let selectedTemplate = null;
let uploadedImageData = null;
let generator = null;
let allTemplates = []; // Templates from backend
let templateCounts = {}; // Count per category
let categoryTemplates = []; // Templates for selected category

// ==================== 
// Initialize 
// ==================== 
async function initCreatePage() {
    // Initialize generator
    generator = new PosterGenerator('posterCanvas');
    generator.init();
    
    // Load templates from backend
    await loadTemplatesFromBackend();
    
    // Initialize event listeners
    initStepNavigation();
    initCategorySelection();
    initTemplateSelection();
    initImageUpload();
    initFormInputs();
    initLayoutControls();
    initPreviewActions();
    
    // Show first step
    showStep(1);
}

// ==================== 
// Load Templates from Backend
// ==================== 
async function loadTemplatesFromBackend() {
    try {
        // Show loading state
        const categoryGrid = document.querySelector('.category-grid');
        if (categoryGrid) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'loading-templates';
            loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري تحميل القوالب...';
            loadingDiv.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 40px; color: #8B5CF6; font-size: 18px;';
            categoryGrid.appendChild(loadingDiv);
        }
        
        // Fetch templates from API
        allTemplates = await apiService.getAllTemplates();
        
        // Count templates per category
        templateCounts = {};
        allTemplates.forEach(template => {
            templateCounts[template.category] = (templateCounts[template.category] || 0) + 1;
        });
        
        // Update category counts in UI
        updateCategoryCounts();
        
        // Remove loading state
        const loadingDiv = document.querySelector('.loading-templates');
        if (loadingDiv) loadingDiv.remove();
        
        console.log('Templates loaded:', allTemplates.length);
    } catch (error) {
        console.error('Error loading templates:', error);
        showNotification('تعذر تحميل القوالب. يتم استخدام القوالب الافتراضية.', 'warning');
    }
}

function updateCategoryCounts() {
    const categoryOptions = document.querySelectorAll('.category-option');
    
    categoryOptions.forEach(option => {
        const radio = option.querySelector('input[type="radio"]');
        const countSpan = option.querySelector('.option-info span');
        
        if (radio && countSpan) {
            const category = radio.value;
            const count = templateCounts[category] || 0;
            countSpan.textContent = `${count} ${count === 1 ? 'قالب' : 'قوالب'}`;
            
            // Disable if no templates
            if (count === 0) {
                option.style.opacity = '0.5';
                option.style.cursor = 'not-allowed';
                radio.disabled = true;
            }
        }
    });
}

// ==================== 
// Step Navigation 
// ==================== 
function initStepNavigation() {
    // Next buttons
    document.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                nextStep();
            }
        });
    });
    
    // Previous buttons
    document.querySelectorAll('[data-prev]').forEach(btn => {
        btn.addEventListener('click', prevStep);
    });
    
    // Generate button
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', startGeneration);
    }
}

function showStep(step) {
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        if (index + 1 < step) {
            indicator.classList.add('completed');
        } else if (index + 1 === step) {
            indicator.classList.add('active');
        }
    });
    
    // Update progress line
    const progressLine = document.querySelector('.steps-line');
    if (progressLine) {
        const progress = ((step - 1) / (totalSteps - 1)) * 100;
        progressLine.style.width = `calc(${progress}% - 25px)`;
    }
    
    // Show/hide form steps
    document.querySelectorAll('.form-step').forEach((formStep, index) => {
        formStep.classList.remove('active');
        if (index + 1 === step) {
            formStep.classList.add('active');
        }
    });
    
    currentStep = step;
}

function nextStep() {
    if (currentStep < totalSteps) {
        // Load templates when moving from step 1 to step 2
        if (currentStep === 1) {
            loadCategoryTemplates();
        }
        
        showStep(currentStep + 1);
        
        // Update preview when moving to step 4
        if (currentStep === 4) {
            updatePreview();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        showStep(currentStep - 1);
    }
}

function validateStep(step) {
    switch(step) {
        case 1:
            if (!selectedCategory) {
                showNotification('الرجاء اختيار فئة', 'error');
                return false;
            }
            return true;
            
        case 2:
            if (!selectedTemplate) {
                showNotification('الرجاء اختيار قالب', 'error');
                return false;
            }
            return true;
            
        case 3:
            const businessName = document.getElementById('businessName')?.value;
            const productName = document.getElementById('productName')?.value;
            const offerPrice = document.getElementById('offerPrice')?.value;
            
            if (!businessName || !productName || !offerPrice) {
                showNotification('الرجاء ملء جميع الحقول المطلوبة', 'error');
                return false;
            }
            return true;
            
        case 4:
            return true;
            
        default:
            return true;
    }
}

// ==================== 
// Category Selection 
// ==================== 
function initCategorySelection() {
    // Handle radio button changes
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedCategory = e.target.value;
            enableNextButton(1);
        });
    });
    
    // Handle clicking on the entire label
    document.querySelectorAll('.category-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedCategory = radio.value;
                enableNextButton(1);
                
                // Trigger change event
                radio.dispatchEvent(new Event('change'));
            }
        });
    });
}

function enableNextButton(step) {
    const nextBtn = document.querySelector(`#step${step} [data-next]`);
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// ==================== 
// Template Selection 
// ==================== 
function initTemplateSelection() {
    // Will be populated when category is selected
}

async function loadCategoryTemplates() {
    const container = document.getElementById('templatesContainer');
    if (!container) return;
    
    // Filter templates by selected category
    categoryTemplates = allTemplates.filter(t => t.category === selectedCategory);
    
    if (categoryTemplates.length === 0) {
        container.innerHTML = `
            <div class="no-templates">
                <i class="fas fa-inbox"></i>
                <h3>لا توجد قوالب متاحة</h3>
                <p>لم يتم إضافة قوالب لهذه الفئة بعد</p>
                <p class="hint">يمكنك الاستمرار بدون اختيار قالب</p>
                <button class="btn btn-outline" onclick="skipTemplateSelection()">
                    <i class="fas fa-forward"></i>
                    تخطي واستمر
                </button>
            </div>
        `;
        return;
    }
    
    // Display templates
    container.innerHTML = categoryTemplates.map(template => `
        <div class="template-card" data-template-id="${template.id}">
            <div class="template-image-wrapper">
                <img src="${apiService.getImageUrl(template.image) || 'https://via.placeholder.com/400x400?text=' + encodeURIComponent(template.name)}" 
                     alt="${template.name}"
                     class="template-image">
                <div class="template-overlay">
                    <button class="btn-select-template" onclick="selectTemplate('${template.id}')">
                        <i class="fas fa-check"></i>
                        اختيار
                    </button>
                </div>
            </div>
            <div class="template-info">
                <h4>${template.name}</h4>
                ${template.description ? `<p>${template.description}</p>` : ''}
            </div>
        </div>
    `).join('');
}

function selectTemplate(templateId) {
    // Remove previous selection
    document.querySelectorAll('.template-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Mark selected
    const selectedCard = document.querySelector(`[data-template-id="${templateId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Store selection
    selectedTemplate = categoryTemplates.find(t => t.id === templateId);
    
    // Enable next button
    enableNextButton(2);
    
    showNotification('تم اختيار القالب بنجاح', 'success');
}

function skipTemplateSelection() {
    selectedTemplate = null;
    showStep(currentStep + 1);
}

function changeTemplate() {
    // Go back to step 2 (template selection)
    showStep(2);
}

// Make functions global
window.selectTemplate = selectTemplate;
window.skipTemplateSelection = skipTemplateSelection;
window.changeTemplate = changeTemplate;

// ==================== 
// Image Upload 
// ==================== 
function initImageUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeImage');
    
    if (!uploadZone || !imageInput) return;
    
    // Click to upload
    uploadZone.addEventListener('click', () => imageInput.click());
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    
    // File input change
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageUpload(file);
        }
    });
    
    // Remove image
    if (removeBtn) {
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            uploadedImageData = null;
            
            const uploadZone = document.getElementById('uploadZone');
            const preview = document.getElementById('imagePreview');
            const imageInput = document.getElementById('productImage');
            
            if (preview) preview.classList.remove('show');
            if (imageInput) imageInput.value = '';
            if (uploadZone) {
                uploadZone.classList.remove('has-image');
                
                // Show upload content again
                const uploadIcon = uploadZone.querySelector('.upload-icon');
                const uploadTitle = uploadZone.querySelector('h4');
                const uploadText = uploadZone.querySelector('p');
                
                if (uploadIcon) uploadIcon.style.display = 'flex';
                if (uploadTitle) uploadTitle.style.display = 'block';
                if (uploadText) uploadText.style.display = 'block';
            }
        });
    }
}

function handleImageUpload(file) {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('الرجاء اختيار ملف صورة صحيح', 'error');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        uploadedImageData = e.target.result;
        
        const uploadZone = document.getElementById('uploadZone');
        const preview = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        
        if (preview && previewImg && uploadZone) {
            previewImg.src = uploadedImageData;
            preview.classList.add('show');
            uploadZone.classList.add('has-image');
            
            // Hide upload content
            const uploadContent = uploadZone.querySelector('.upload-icon, h4, p');
            if (uploadContent) {
                uploadContent.style.display = 'none';
            }
            
            // Show success notification
            showNotification('تم رفع الصورة بنجاح!', 'success');
            
            // Update preview if on step 3
            if (currentStep === 3) {
                updatePreview();
            }
        }
    };
    
    reader.onerror = () => {
        showNotification('حدث خطأ أثناء قراءة الصورة', 'error');
    };
    
    reader.readAsDataURL(file);
}

// ==================== 
// Form Inputs 
// ==================== 
function initFormInputs() {
    // Real-time preview update on input change
    const inputs = ['businessName', 'productName', 'originalPrice', 'offerPrice', 'offerText', 'whatsapp'];
    
    inputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', debounce(updatePreview, 500));
        }
    });
    
    // Color palette selection
    document.querySelectorAll('input[name="palette"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });
    
    // CTA text selection
    document.querySelectorAll('input[name="cta"]').forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });
    
    // Size selection
    document.querySelectorAll('input[name="size"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const size = e.target.value;
            updateCanvasSize(size);
            updatePreview();
        });
    });
}

// Update canvas dimensions based on selected size
function updateCanvasSize(sizeType) {
    const canvas = document.getElementById('posterCanvas');
    if (!canvas) return;
    
    let width, height;
    
    switch(sizeType) {
        case 'instagram-post':
            width = 1080;
            height = 1080;
            break;
        case 'instagram-story':
            width = 1080;
            height = 1920;
            break;
        case 'facebook-post':
            width = 1200;
            height = 630;
            break;
        case 'twitter-post':
            width = 1200;
            height = 675;
            break;
        default:
            width = 1080;
            height = 1080;
    }
    
    // Use generator's setSize method
    if (generator) {
        generator.setSize(sizeType);
    }
}

// ==================== 
// Preview 
// ==================== 
function updatePreview() {
    const data = collectFormData();
    const layoutValues = getLayoutValues();
    
    generator.setData(data);
    generator.setLayout(layoutValues);
    
    // Get selected size
    const sizeType = document.querySelector('input[name="size"]:checked')?.value || 'instagram-post';
    generator.setSize(sizeType);

    // Set image if uploaded
    generator.setImage(uploadedImageData)
        .then(() => {
            return generator.generate();
        })
        .then(() => {
            // Show preview, hide placeholder
            const placeholder = document.querySelector('.preview-placeholder');
            const canvasWrapper = document.querySelector('.canvas-wrapper');
            
            if (placeholder) placeholder.classList.add('hidden');
            if (canvasWrapper) canvasWrapper.classList.remove('hidden');
            
            console.log('Preview updated successfully');
        })
        .catch((error) => {
            console.error('Error updating preview:', error);
            showNotification('حدث خطأ أثناء إنشاء المعاينة', 'error');
        });
}

function collectFormData() {
    return {
        category: selectedCategory,
        template: selectedTemplate, // Include selected template
        businessName: document.getElementById('businessName')?.value || '',
        productName: document.getElementById('productName')?.value || '',
        offerText: document.getElementById('offerText')?.value || 'عرض لفترة محدودة',
        originalPrice: document.getElementById('originalPrice')?.value || '',
        offerPrice: document.getElementById('offerPrice')?.value || '',
        whatsapp: document.getElementById('whatsapp')?.value || '',
        ctaText: document.getElementById('ctaText')?.value || 'اطلب الآن'
    };
}

function getSelectedTemplate() {
    const paletteId = document.querySelector('input[name="palette"]:checked')?.value || 'palette-1';
    const palette = ColorPalettes.find(p => p.id === paletteId);
    
    if (!palette) return null;
    
    return {
        id: paletteId,
        name: palette.name,
        colors: {
            primary: palette.colors[0],
            secondary: palette.colors[1],
            background: palette.colors[2],
            text: palette.colors[3]
        }
    };
}

// ==================== 
// Preview Actions 
// ==================== 
function initPreviewActions() {
    // Download button
    const downloadBtn = document.getElementById('downloadPreview');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const businessName = document.getElementById('businessName')?.value || 'poster';
            generator.download(businessName.replace(/\s+/g, '_'));
        });
    }
    
    // Refresh preview
    const refreshBtn = document.getElementById('refreshPreview');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', updatePreview);
    }
}

// ==================== 
// Layout Controls 
// ==================== 
function initLayoutControls() {
    // Debounced version of updatePreview for sliders
    const debouncedUpdate = debounce(updatePreview, 300);
    
    // Title position Y slider
    const titlePositionYSlider = document.getElementById('titlePositionY');
    if (titlePositionYSlider) {
        titlePositionYSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('titlePositionYValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Title position X slider
    const titlePositionXSlider = document.getElementById('titlePositionX');
    if (titlePositionXSlider) {
        titlePositionXSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('titlePositionXValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Title size slider
    const titleSizeSlider = document.getElementById('titleSize');
    if (titleSizeSlider) {
        titleSizeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('titleSizeValue');
            if (display) display.textContent = value + 'px';
            debouncedUpdate();
        });
    }
    
    // Image position Y slider
    const imagePositionYSlider = document.getElementById('imagePositionY');
    if (imagePositionYSlider) {
        imagePositionYSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('imagePositionYValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Image position X slider
    const imagePositionXSlider = document.getElementById('imagePositionX');
    if (imagePositionXSlider) {
        imagePositionXSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('imagePositionXValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Image scale slider
    const imageScaleSlider = document.getElementById('imageScale');
    if (imageScaleSlider) {
        imageScaleSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('imageScaleValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Price position Y slider
    const pricePositionYSlider = document.getElementById('pricePositionY');
    if (pricePositionYSlider) {
        pricePositionYSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('pricePositionYValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Price position X slider
    const pricePositionXSlider = document.getElementById('pricePositionX');
    if (pricePositionXSlider) {
        pricePositionXSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('pricePositionXValue');
            if (display) display.textContent = Math.round(value * 100) + '%';
            debouncedUpdate();
        });
    }
    
    // Price size slider
    const priceSizeSlider = document.getElementById('priceSize');
    if (priceSizeSlider) {
        priceSizeSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            const display = document.getElementById('priceSizeValue');
            if (display) display.textContent = value + 'px';
            debouncedUpdate();
        });
    }
    
    // Update template info display when step 4 is shown
    document.querySelectorAll('[data-next]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep === 3) { // Just moved from step 3 to step 4
                setTimeout(updateTemplateInfoDisplay, 100);
            }
        });
    });
}

function updateTemplateInfoDisplay() {
    const templateInfoBox = document.getElementById('templateInfoBox');
    const templateInfoDisplay = document.querySelector('.template-info-display');
    if (!templateInfoDisplay) return;
    
    if (selectedTemplate) {
        // Show the template info box
        if (templateInfoBox) templateInfoBox.style.display = 'block';
        
        templateInfoDisplay.innerHTML = `
            <img src="${apiService.getImageUrl(selectedTemplate.image) || 'https://via.placeholder.com/80x80?text=' + encodeURIComponent(selectedTemplate.name)}" 
                 alt="${selectedTemplate.name}" 
                 class="selected-template-thumb">
            <div class="selected-template-info">
                <strong>${selectedTemplate.name}</strong>
                <span>${selectedTemplate.category}</span>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="changeTemplate()">
                <i class="fas fa-exchange-alt"></i>
                تغيير
            </button>
        `;
    } else {
        // Hide the template info box when no template selected
        if (templateInfoBox) templateInfoBox.style.display = 'none';
    }
}

function getLayoutValues() {
    return {
        titlePositionY: parseFloat(document.getElementById('titlePositionY')?.value) || 0.15,
        titlePositionX: parseFloat(document.getElementById('titlePositionX')?.value) || 0.5,
        titleSize: parseInt(document.getElementById('titleSize')?.value) || 56,
        imagePositionY: parseFloat(document.getElementById('imagePositionY')?.value) || 0.48,
        imagePositionX: parseFloat(document.getElementById('imagePositionX')?.value) || 0.5,
        imageScale: parseFloat(document.getElementById('imageScale')?.value) || 0.38,
        pricePositionY: parseFloat(document.getElementById('pricePositionY')?.value) || 0.72,
        pricePositionX: parseFloat(document.getElementById('pricePositionX')?.value) || 0.5,
        priceSize: parseInt(document.getElementById('priceSize')?.value) || 52
    };
}

// ==================== 
// Generation with AI Animation 
// ==================== 
async function startGeneration() {
    if (!validateStep(3)) return;
    
    // Show AI modal
    const modal = document.getElementById('aiModal');
    if (modal) {
        modal.classList.add('active');
    }
    
    // Animate steps
    const steps = [
        { id: 'step-analyze', duration: 800 },
        { id: 'step-colors', duration: 600 },
        { id: 'step-text', duration: 700 },
        { id: 'step-image', duration: 500 },
        { id: 'step-compose', duration: 900 }
    ];
    
    let progressPercent = 0;
    const progressBar = document.querySelector('.ai-progress-bar');
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const stepEl = document.getElementById(step.id);
        
        // Activate current step
        if (stepEl) {
            stepEl.classList.add('active');
        }
        
        // Update progress
        await sleep(step.duration);
        progressPercent = ((i + 1) / steps.length) * 100;
        if (progressBar) {
            progressBar.style.width = progressPercent + '%';
        }
        
        // Complete current step
        if (stepEl) {
            stepEl.classList.remove('active');
            stepEl.classList.add('completed');
        }
    }
    
    // Generate the actual poster
    updatePreview();
    
    // Small delay then show result
    await sleep(500);
    
    // Hide AI modal, show result modal
    modal?.classList.remove('active');
    
    // Wait for generation to complete
    await sleep(300);
    showResultModal();
    
    // Reset AI steps for next time
    resetAISteps();
}

function resetAISteps() {
    document.querySelectorAll('.ai-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    const progressBar = document.querySelector('.ai-progress-bar');
    if (progressBar) {
        progressBar.style.width = '0%';
    }
}

function showResultModal() {
    const resultModal = document.getElementById('resultModal');
    const resultCanvas = document.getElementById('resultCanvas');
    
    if (resultModal) {
        resultModal.classList.add('active');
    }
    
    // Copy poster to result canvas using Fabric.js
    if (resultCanvas && generator.canvas) {
        // Initialize result canvas as Fabric canvas if not already
        if (!resultCanvas.fabricCanvas) {
            resultCanvas.fabricCanvas = new fabric.Canvas(resultCanvas, {
                width: generator.canvas.width,
                height: generator.canvas.height
            });
        }
        
        // Clone the main canvas to result canvas
        const dataURL = generator.canvas.toDataURL({ format: 'png', quality: 1.0 });
        fabric.Image.fromURL(dataURL, (img) => {
            resultCanvas.fabricCanvas.clear();
            resultCanvas.fabricCanvas.add(img);
            resultCanvas.fabricCanvas.renderAll();
        });
    }
    
    // Download button in result modal
    const downloadResultBtn = document.getElementById('downloadBtn');
    if (downloadResultBtn) {
        downloadResultBtn.onclick = () => {
            const businessName = document.getElementById('businessName')?.value || 'poster';
            generator.download(businessName.replace(/\s+/g, '_'));
        };
    }
    
    // New design button
    const newDesignBtn = document.getElementById('newDesignBtn');
    if (newDesignBtn) {
        newDesignBtn.onclick = () => {
            resultModal?.classList.remove('active');
            resetForm();
            showStep(1);
        };
    }
    
    // Try another template button
    const tryAnotherBtn = document.getElementById('tryAnotherBtn');
    if (tryAnotherBtn) {
        tryAnotherBtn.onclick = () => {
            resultModal?.classList.remove('active');
            showStep(2);
        };
    }
    
    // Close button
    const closeBtn = resultModal?.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            resultModal.classList.remove('active');
        };
    }
}

function resetForm() {
    // Reset all form fields
    document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
        input.value = '';
    });
    
    // Reset category selection
    selectedCategory = null;
    document.querySelectorAll('input[name="category"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reset image
    uploadedImageData = null;
    document.getElementById('imagePreview')?.classList.remove('show');
    
    // Reset preview
    generator.clear();
    document.querySelector('.preview-placeholder')?.classList.remove('hidden');
    document.querySelector('.canvas-wrapper')?.classList.add('hidden');
}

// ==================== 
// Utility Functions 
// ==================== 
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not exist
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 0.75rem;
                z-index: 3000;
                opacity: 0;
                animation: notificationIn 0.3s ease forwards;
            }
            
            .notification-error {
                border-right: 4px solid #EF4444;
            }
            
            .notification-error i {
                color: #EF4444;
            }
            
            .notification-success {
                border-right: 4px solid #10B981;
            }
            
            .notification-success i {
                color: #10B981;
            }
            
            @keyframes notificationIn {
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'notificationIn 0.3s ease reverse forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ====================
// Professional Features Integration
// ====================

// Initialize professional features managers
let exportManager, qrCodeManager, designHistory, brandKit;

function initProfessionalFeatures() {
    if (!generator || !generator.canvas) return;
    
    // Initialize managers
    exportManager = new ExportManager(generator);
    qrCodeManager = new QRCodeManager(generator);
    designHistory = new DesignHistory();
    brandKit = new BrandKit();
    
    // Setup event listeners
    setupExportFeatures();
    setupHistoryFeatures();
}

// Setup advanced export features
function setupExportFeatures() {
    const exportAdvancedBtn = document.getElementById('exportAdvancedBtn');
    const exportOptions = document.getElementById('exportOptions');
    const executeExport = document.getElementById('executeExport');
    const batchExport = document.getElementById('batchExport');
    
    if (exportAdvancedBtn) {
        exportAdvancedBtn.addEventListener('click', () => {
            exportOptions.style.display = exportOptions.style.display === 'none' ? 'block' : 'none';
        });
    }
    
    if (executeExport) {
        executeExport.addEventListener('click', () => {
            const preset = document.getElementById('exportPreset').value;
            const format = document.getElementById('exportFormat').value;
            const filename = `poster_${Date.now()}`;
            
            exportManager.exportDesign({ format, preset, filename });
            showNotification('✅ تم تحميل التصميم بنجاح!', 'success');
        });
    }
    
    if (batchExport) {
        batchExport.addEventListener('click', async () => {
            const format = document.getElementById('exportFormat').value;
            const presets = ['instagram_post', 'facebook_post', 'twitter_post'];
            
            showNotification('⏳ جاري تحميل جميع المقاسات...', 'success');
            
            await exportManager.batchExport(presets, [format], `poster_${Date.now()}`);
            
            showNotification('✅ تم تحميل جميع المقاسات بنجاح!', 'success');
        });
    }
}

// Setup design history features
function setupHistoryFeatures() {
    const saveDesignBtn = document.getElementById('saveDesignBtn');
    const showHistoryBtn = document.getElementById('showHistoryBtn');
    
    if (saveDesignBtn) {
        saveDesignBtn.addEventListener('click', () => {
            const thumbnail = generator.canvas.toDataURL({ format: 'png', quality: 0.5, multiplier: 0.3 });
            
            const designData = {
                thumbnail: thumbnail,
                data: {
                    businessName: document.getElementById('businessName')?.value || '',
                    productName: document.getElementById('productName')?.value || '',
                    price: document.getElementById('price')?.value || '',
                    category: selectedCategory
                },
                layout: generator.layout,
                templateId: selectedTemplate?.id
            };
            
            designHistory.saveDesign(designData);
            showNotification('💾 تم حفظ التصميم بنجاح!', 'success');
        });
    }
    
    if (showHistoryBtn) {
        showHistoryBtn.addEventListener('click', () => {
            showDesignHistoryModal();
        });
    }
}

// Show design history modal
function showDesignHistoryModal() {
    const history = designHistory.getHistory();
    
    if (history.length === 0) {
        showNotification('ℹ️ لا توجد تصاميم محفوظة بعد', 'info');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="history-modal">
            <div class="modal-header">
                <h3><i class="fas fa-history"></i> التصاميم السابقة</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="history-grid">
                ${history.map(design => `
                    <div class="history-item" data-design-id="${design.id}">
                        <img src="${design.thumbnail}" alt="Design">
                        <div class="history-item-info">
                            <small>${new Date(design.timestamp).toLocaleDateString('ar')}</small>
                            <div class="history-actions">
                                <button class="btn btn-sm btn-primary" onclick="loadHistoryDesign('${design.id}')">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-sm btn-outline" onclick="deleteHistoryDesign('${design.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Load design from history
window.loadHistoryDesign = function(designId) {
    const design = designHistory.loadDesign(designId);
    if (design) {
        // Populate form with saved data
        if (design.data.businessName) document.getElementById('businessName').value = design.data.businessName;
        if (design.data.productName) document.getElementById('productName').value = design.data.productName;
        if (design.data.price) document.getElementById('price').value = design.data.price;
        
        // Update layout
        if (design.layout) {
            generator.setLayout(design.layout);
        }
        
        // Regenerate
        generator.generate(design.data);
        
        // Close modal and show result
        document.querySelector('.history-modal')?.closest('.modal-overlay').remove();
        document.getElementById('resultModal').classList.add('active');
        
        showNotification('✅ تم تحميل التصميم بنجاح!', 'success');
    }
};

// Delete design from history
window.deleteHistoryDesign = function(designId) {
    if (confirm('هل أنت متأكد من حذف هذا التصميم؟')) {
        designHistory.deleteDesign(designId);
        document.querySelector(`[data-design-id="${designId}"]`)?.remove();
        showNotification('🗑️ تم حذف التصميم', 'success');
    }
};

// Initialize professional features when result modal opens
const resultModal = document.getElementById('resultModal');
if (resultModal) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('active')) {
                setTimeout(() => initProfessionalFeatures(), 100);
            }
        });
    });
    
    observer.observe(resultModal, { attributes: true, attributeFilter: ['class'] });
}
