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
let useAIMode = true; // AI mode enabled by default
let selectedAIStyle = 'modern'; // Default AI style

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
    initAIModeToggle();
    
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
            if (useAIMode) {
                // AI mode - no template needed, just style selection
                return true;
            }
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

// ==================== 
// AI Mode Toggle
// ==================== 
function initAIModeToggle() {
    const aiModeBtn = document.getElementById('aiModeBtn');
    const templateModeBtn = document.getElementById('templateModeBtn');
    const aiStyleSection = document.getElementById('aiStyleSection');
    const templatesContainer = document.getElementById('templatesContainer');
    
    if (aiModeBtn) {
        aiModeBtn.addEventListener('click', () => {
            useAIMode = true;
            aiModeBtn.classList.add('active');
            templateModeBtn?.classList.remove('active');
            
            if (aiStyleSection) aiStyleSection.style.display = 'block';
            if (templatesContainer) templatesContainer.style.display = 'none';
            
            // Enable next button (no template needed)
            enableNextButton(2);
        });
    }
    
    if (templateModeBtn) {
        templateModeBtn.addEventListener('click', () => {
            useAIMode = false;
            templateModeBtn.classList.add('active');
            aiModeBtn?.classList.remove('active');
            
            if (aiStyleSection) aiStyleSection.style.display = 'none';
            if (templatesContainer) {
                templatesContainer.style.display = '';
                loadCategoryTemplates();
            }
            
            // Disable next button until template selected
            if (!selectedTemplate) {
                const nextBtn = document.querySelector('#step2 [data-next]');
                if (nextBtn) {
                    nextBtn.disabled = true;
                    nextBtn.style.opacity = '0.5';
                }
            }
        });
    }
    
    // AI Style selection
    document.querySelectorAll('input[name="aiStyle"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            selectedAIStyle = e.target.value;
            if (window.aiGenerator) {
                aiGenerator.setStyle(selectedAIStyle);
            }
            
            // Update active class on parent labels
            document.querySelectorAll('.ai-style-option').forEach(opt => {
                opt.classList.remove('active');
            });
            e.target.closest('.ai-style-option')?.classList.add('active');
        });
    });
    
    // Style card click handler
    document.querySelectorAll('.ai-style-option').forEach(option => {
        option.addEventListener('click', () => {
            const radio = option.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                radio.dispatchEvent(new Event('change'));
            }
        });
    });
    
    // Default: AI mode enabled, enable step 2 next button
    if (useAIMode) {
        enableNextButton(2);
    }
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
        template: selectedTemplate,
        businessName: document.getElementById('businessName')?.value || '',
        productName: document.getElementById('productName')?.value || '',
        offerText: document.getElementById('offerText')?.value || 'عرض لفترة محدودة',
        originalPrice: document.getElementById('originalPrice')?.value || '',
        offerPrice: document.getElementById('offerPrice')?.value || '',
        whatsapp: document.getElementById('whatsapp')?.value || '',
        ctaText: document.getElementById('ctaText')?.value || 'اطلب الآن',
        additionalDescription: document.getElementById('aiCustomPrompt')?.value || ''
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
    
    const generateBtn = document.getElementById('generateBtn');
    
    if (useAIMode) {
        // ===== AI MODE: Real Stable Diffusion generation =====
        await startAIGeneration(generateBtn);
    } else {
        // ===== TEMPLATE MODE: Original generation =====
        await startTemplateGeneration(generateBtn);
    }
}

// ==================== 
// AI Mode Generation (Replicate + Stable Diffusion)
// ==================== 
async function startAIGeneration(generateBtn) {
    // Show AI modal
    const modal = document.getElementById('aiModal');
    if (modal) modal.classList.add('active');
    if (generateBtn) generateBtn.classList.add('generating');
    
    // Reset AI steps
    resetAISteps();
    
    const aiTitle = document.getElementById('aiTitle');
    const progressBar = document.querySelector('.ai-progress-bar');
    
    const stepIds = ['step-analyze', 'step-ai-generate', 'step-load-bg', 'step-text', 'step-compose'];
    
    try {
        const formData = collectFormData();
        const style = selectedAIStyle;
        const customPrompt = document.getElementById('aiCustomPrompt')?.value || null;
        
        // Step 1: Analyze
        activateAIStep(stepIds[0]);
        if (aiTitle) aiTitle.textContent = 'تحليل بيانات العرض...';
        if (progressBar) progressBar.style.width = '10%';
        await sleep(600);
        completeAIStep(stepIds[0]);
        
        // Step 2: Generate AI Background
        activateAIStep(stepIds[1]);
        if (aiTitle) aiTitle.textContent = 'الذكاء الاصطناعي يصمم الخلفية...';
        if (progressBar) progressBar.style.width = '20%';
        
        let bgResult;
        // Combine product info + additional description for relevant backgrounds
        const extraDesc = formData.additionalDescription || '';
        const fullDescription = [formData.offerText, extraDesc].filter(Boolean).join(' - ');
        
        const productInfo = {
            productName: formData.productName || '',
            description: fullDescription
        };
        
        if (customPrompt) {
            // Custom prompt mode - pass product info too
            bgResult = await aiGenerator.smartGenerate(
                formData.category, 
                customPrompt,
                formData.productName,
                fullDescription
            );
        } else {
            // Use generateBackground with product info for relevant AI images
            bgResult = await aiGenerator.generateBackground(
                formData.category, 
                style,
                productInfo
            );
        }
        
        if (progressBar) progressBar.style.width = '55%';
        completeAIStep(stepIds[1]);
        
        // Step 3: Load background to canvas
        activateAIStep(stepIds[2]);
        if (aiTitle) aiTitle.textContent = 'تحميل الخلفية...';
        if (progressBar) progressBar.style.width = '65%';
        
        generator.canvas.clear();
        const sizeType = document.querySelector('input[name="size"]:checked')?.value || 'instagram-post';
        generator.setSize(sizeType);
        generator.setData(formData);
        
        const layoutValues = getLayoutValues();
        generator.setLayout(layoutValues);
        
        // Set uploaded image if any
        await generator.setImage(uploadedImageData);
        
        // Load AI background
        await aiGenerator.loadBackgroundToCanvas(
            generator.canvas, 
            bgResult.imageUrl, 
            generator.width, 
            generator.height
        );
        
        if (progressBar) progressBar.style.width = '75%';
        completeAIStep(stepIds[2]);
        
        // Step 4: Add Arabic text
        activateAIStep(stepIds[3]);
        if (aiTitle) aiTitle.textContent = 'إضافة النصوص العربية...';
        if (progressBar) progressBar.style.width = '82%';
        
        const theme = generator.getTheme();
        generator.drawBusinessName(theme);
        
        if (generator.uploadedImage) {
            await generator.drawProductImage(theme);
        }
        
        generator.drawProductSection(theme);
        generator.drawPriceBadge(theme);
        generator.drawOfferBanner(theme);
        generator.drawContactSection(theme);
        generator.drawCTAButton(theme);
        
        await sleep(300);
        if (progressBar) progressBar.style.width = '90%';
        completeAIStep(stepIds[3]);
        
        // Step 5: Final compose
        activateAIStep(stepIds[4]);
        if (aiTitle) aiTitle.textContent = 'تنسيق التصميم النهائي...';
        generator.canvas.renderAll();
        
        await sleep(500);
        if (progressBar) progressBar.style.width = '100%';
        completeAIStep(stepIds[4]);
        
        if (aiTitle) aiTitle.textContent = 'تم بنجاح! 🎉';
        await sleep(600);
        
        // Show result
        modal?.classList.remove('active');
        if (generateBtn) generateBtn.classList.remove('generating');
        await sleep(300);
        showResultModal();
        
    } catch (error) {
        console.error('AI Generation failed:', error);
        
        if (aiTitle) aiTitle.textContent = 'حدث خطأ...';
        
        // Show error in modal
        let errorDiv = modal?.querySelector('.ai-error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'ai-error-message';
            modal?.querySelector('.ai-modal-content')?.appendChild(errorDiv);
        }
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${error.message || 'فشل في إنشاء التصميم. يتم استخدام القالب البديل...'}`;
        errorDiv.classList.add('show');
        
        await sleep(2000);
        
        // Fallback to template generation
        modal?.classList.remove('active');
        if (generateBtn) generateBtn.classList.remove('generating');
        errorDiv.classList.remove('show');
        
        showNotification('تم التبديل إلى القالب البديل', 'warning');
        updatePreview();
        await sleep(500);
        showResultModal();
    }
}

// ==================== 
// Template Mode Generation (Original)
// ==================== 
async function startTemplateGeneration(generateBtn) {
    // Show AI modal
    const modal = document.getElementById('aiModal');
    if (modal) modal.classList.add('active');
    
    // Animate steps
    const steps = [
        { id: 'step-analyze', duration: 800 },
        { id: 'step-ai-generate', duration: 600 },
        { id: 'step-load-bg', duration: 700 },
        { id: 'step-text', duration: 500 },
        { id: 'step-compose', duration: 900 }
    ];
    
    let progressPercent = 0;
    const progressBar = document.querySelector('.ai-progress-bar');
    
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        activateAIStep(step.id);
        
        await sleep(step.duration);
        progressPercent = ((i + 1) / steps.length) * 100;
        if (progressBar) progressBar.style.width = progressPercent + '%';
        
        completeAIStep(step.id);
    }
    
    // Generate the actual poster
    updatePreview();
    
    // Small delay then show result
    await sleep(500);
    modal?.classList.remove('active');
    await sleep(300);
    showResultModal();
    resetAISteps();
}

// ==================== 
// AI Step Helpers
// ==================== 
function activateAIStep(stepId) {
    const stepEl = document.getElementById(stepId);
    if (stepEl) {
        stepEl.classList.add('active');
        stepEl.classList.remove('completed');
    }
}

function completeAIStep(stepId) {
    const stepEl = document.getElementById(stepId);
    if (stepEl) {
        stepEl.classList.remove('active');
        stepEl.classList.add('completed');
    }
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
    const resultPage = document.getElementById('resultPage');
    const resultCanvas = document.getElementById('resultCanvas');
    
    if (resultPage) {
        resultPage.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Copy poster to result canvas using Fabric.js
    if (resultCanvas && generator.canvas) {
        // Initialize result canvas as Fabric canvas if not already
        if (!resultCanvas.fabricCanvas) {
            resultCanvas.fabricCanvas = new fabric.Canvas(resultCanvas, {
                width: generator.canvas.width,
                height: generator.canvas.height
            });
        } else {
            resultCanvas.fabricCanvas.setDimensions({
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
    
    // Populate editor fields with current form data
    populateEditorFields();
    
    function hideResultPage() {
        if (resultPage) {
            resultPage.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    
    // Download button
    const downloadResultBtn = document.getElementById('downloadBtn');
    if (downloadResultBtn) {
        downloadResultBtn.onclick = () => {
            const businessName = document.getElementById('editBusinessName')?.value || document.getElementById('businessName')?.value || 'poster';
            generator.download(businessName.replace(/\s+/g, '_'));
        };
    }
    
    // Apply edits button
    const applyEditsBtn = document.getElementById('applyEditsBtn');
    if (applyEditsBtn) {
        applyEditsBtn.onclick = async () => {
            await applyEditorChanges();
        };
    }
    
    // New design button
    const newDesignBtn = document.getElementById('newDesignBtn');
    if (newDesignBtn) {
        newDesignBtn.onclick = () => {
            hideResultPage();
            resetForm();
            showStep(1);
        };
    }
    
    // Try another template button
    const tryAnotherBtn = document.getElementById('tryAnotherBtn');
    if (tryAnotherBtn) {
        tryAnotherBtn.onclick = () => {
            hideResultPage();
            showStep(2);
        };
    }
    
    // Back to editor button
    const backBtn = document.getElementById('backToEditor');
    if (backBtn) {
        backBtn.onclick = () => {
            hideResultPage();
        };
    }
}

// Populate editor fields with current values
function populateEditorFields() {
    const formData = collectFormData();
    document.getElementById('editBusinessName').value = formData.businessName;
    document.getElementById('editProductName').value = formData.productName;
    document.getElementById('editOfferText').value = formData.offerText;
    document.getElementById('editOriginalPrice').value = formData.originalPrice;
    document.getElementById('editOfferPrice').value = formData.offerPrice;
    document.getElementById('editWhatsapp').value = formData.whatsapp;
    document.getElementById('editCtaText').value = formData.ctaText;
}

// Apply editor changes - re-render poster with same background but new text
async function applyEditorChanges() {
    const applyBtn = document.getElementById('applyEditsBtn');
    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التطبيق...';
    }
    
    try {
        // Gather edited values
        const editedData = {
            category: selectedCategory,
            businessName: document.getElementById('editBusinessName')?.value || '',
            productName: document.getElementById('editProductName')?.value || '',
            offerText: document.getElementById('editOfferText')?.value || '',
            originalPrice: document.getElementById('editOriginalPrice')?.value || '',
            offerPrice: document.getElementById('editOfferPrice')?.value || '',
            whatsapp: document.getElementById('editWhatsapp')?.value || '',
            ctaText: document.getElementById('editCtaText')?.value || 'اطلب الآن'
        };
        
        // Also update the main form fields so download uses correct name
        if (document.getElementById('businessName')) document.getElementById('businessName').value = editedData.businessName;
        if (document.getElementById('productName')) document.getElementById('productName').value = editedData.productName;
        if (document.getElementById('offerText')) document.getElementById('offerText').value = editedData.offerText;
        if (document.getElementById('originalPrice')) document.getElementById('originalPrice').value = editedData.originalPrice;
        if (document.getElementById('offerPrice')) document.getElementById('offerPrice').value = editedData.offerPrice;
        if (document.getElementById('whatsapp')) document.getElementById('whatsapp').value = editedData.whatsapp;
        if (document.getElementById('ctaText')) document.getElementById('ctaText').value = editedData.ctaText;
        
        // Save the current background image from canvas (first object)
        const bgDataURL = generator.lastAIBackground || null;
        
        // Get all canvas objects - first one is the background
        const objects = generator.canvas.getObjects();
        let bgImage = null;
        if (objects.length > 0 && objects[0].type === 'image') {
            bgImage = objects[0];
        }
        
        // Clear everything except background
        const allObjects = generator.canvas.getObjects().slice();
        for (let i = allObjects.length - 1; i > 0; i--) {
            generator.canvas.remove(allObjects[i]);
        }
        
        // Update data in generator
        generator.setData(editedData);
        
        // Re-draw all text layers on top of existing background
        const theme = generator.getTheme();
        generator.drawBusinessName(theme);
        
        if (generator.uploadedImage) {
            await generator.drawProductImage(theme);
        }
        
        generator.drawProductSection(theme);
        generator.drawPriceBadge(theme);
        generator.drawOfferBanner(theme);
        generator.drawContactSection(theme);
        generator.drawCTAButton(theme);
        generator.drawDecorativeElements(theme);
        
        generator.canvas.renderAll();
        
        // Update result canvas preview
        const resultCanvas = document.getElementById('resultCanvas');
        if (resultCanvas && resultCanvas.fabricCanvas) {
            const dataURL = generator.canvas.toDataURL({ format: 'png', quality: 1.0 });
            fabric.Image.fromURL(dataURL, (img) => {
                resultCanvas.fabricCanvas.clear();
                resultCanvas.fabricCanvas.add(img);
                resultCanvas.fabricCanvas.renderAll();
            });
        }
    } catch (error) {
        console.error('Error applying edits:', error);
        alert('حدث خطأ أثناء تطبيق التعديلات');
    } finally {
        if (applyBtn) {
            applyBtn.disabled = false;
            applyBtn.innerHTML = '<i class="fas fa-sync-alt"></i> تطبيق التعديلات';
        }
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
        showResultModal();
        
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

// Initialize professional features when result page opens
const resultPageEl = document.getElementById('resultPage');
if (resultPageEl) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (resultPageEl.style.display === 'block') {
                setTimeout(() => initProfessionalFeatures(), 100);
            }
        });
    });
    
    observer.observe(resultPageEl, { attributes: true, attributeFilter: ['style'] });
}
