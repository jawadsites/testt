// ==================== 
// AI Hybrid Generator - Replicate + Canvas Arabic Text
// Generates AI backgrounds via Stable Diffusion XL
// Then renders Arabic text using Fabric.js Canvas
// ==================== 

class AIHybridGenerator {
    constructor() {
        this.apiBase = API_BASE_URL;
        this.isGenerating = false;
        this.lastGeneratedBg = null;
        this.aiEnabled = true;
        this.selectedStyle = 'modern';
        this.customPrompt = '';
        this.generationHistory = [];
    }

    // ==================== 
    // AI Status Check
    // ==================== 
    async checkStatus() {
        try {
            const response = await fetch(`${this.apiBase}/ai/status`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('AI Status check failed:', error);
            return { success: false, status: 'offline' };
        }
    }

    // ==================== 
    // Generate AI Background
    // Now accepts productName and description for relevant backgrounds
    // ==================== 
    async generateBackground(category, style = null, options = {}) {
        if (this.isGenerating) {
            throw new Error('جاري إنشاء تصميم بالفعل');
        }

        this.isGenerating = true;

        try {
            const requestBody = {
                category: category,
                style: style || this.selectedStyle,
                width: 1024,
                height: 1024
            };

            // Add product info if provided
            if (options.productName) {
                requestBody.productName = options.productName;
            }
            if (options.description) {
                requestBody.description = options.description;
            }
            if (options.customPrompt) {
                requestBody.customPrompt = options.customPrompt;
            }

            const response = await fetch(`${this.apiBase}/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success) {
                this.lastGeneratedBg = data.imageUrl;
                this.generationHistory.push({
                    url: data.imageUrl,
                    category: category,
                    style: style || this.selectedStyle,
                    timestamp: new Date().toISOString()
                });
                return data;
            } else {
                throw new Error(data.message || 'فشل في إنشاء الخلفية');
            }
        } catch (error) {
            console.error('AI generation error:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    // ==================== 
    // Smart Generate (auto-detect style from Arabic text)
    // Accepts productName and description for relevant backgrounds
    // ==================== 
    async smartGenerate(category, customPrompt, productName = '', offerText = '') {
        if (this.isGenerating) {
            throw new Error('جاري إنشاء تصميم بالفعل');
        }

        this.isGenerating = true;

        try {
            const response = await fetch(`${this.apiBase}/ai/smart-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category,
                    description: customPrompt,
                    productName: productName,
                    offerText: offerText,
                    width: 1024,
                    height: 1024
                })
            });

            const data = await response.json();

            if (data.success) {
                this.lastGeneratedBg = data.imageUrl;
                this.selectedStyle = data.detectedStyle || this.selectedStyle;
                this.generationHistory.push({
                    url: data.imageUrl,
                    category: category,
                    style: data.detectedStyle,
                    description: customPrompt,
                    timestamp: new Date().toISOString()
                });
                return data;
            } else {
                throw new Error(data.message || 'فشل في إنشاء الخلفية الذكية');
            }
        } catch (error) {
            console.error('Smart generation error:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    // ==================== 
    // Generate Multiple Style Variations
    // ==================== 
    async generateVariations(category, styles = null) {
        try {
            const response = await fetch(`${this.apiBase}/ai/generate-multiple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category,
                    styles: styles || ['modern', 'luxury', 'colorful'],
                    width: 1024,
                    height: 1024
                })
            });

            const data = await response.json();

            if (data.success) {
                data.results.forEach(result => {
                    if (result.success) {
                        this.generationHistory.push({
                            url: result.imageUrl,
                            category: category,
                            style: result.style,
                            timestamp: new Date().toISOString()
                        });
                    }
                });
                return data;
            } else {
                throw new Error(data.message || 'فشل في إنشاء التنويعات');
            }
        } catch (error) {
            console.error('Multi-generation error:', error);
            throw error;
        }
    }

    // ==================== 
    // Load AI Background into Fabric.js Canvas
    // ==================== 
    loadBackgroundToCanvas(canvas, imageUrl, width, height) {
        return new Promise((resolve, reject) => {
            // Proxy the image through our server to avoid CORS issues
            const proxyUrl = `${this.apiBase.replace('/api', '')}/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
            console.log('Loading AI background via proxy:', proxyUrl);
            
            fabric.Image.fromURL(proxyUrl, (img) => {
                if (!img || !img.width) {
                    console.error('Fabric.js failed to load image, trying direct URL...');
                    // Fallback: try direct URL
                    fabric.Image.fromURL(imageUrl, (img2) => {
                        if (!img2 || !img2.width) {
                            reject(new Error('فشل في تحميل الخلفية'));
                            return;
                        }
                        this._addBackgroundToCanvas(canvas, img2, width, height);
                        resolve(img2);
                    }, { crossOrigin: 'anonymous' });
                    return;
                }

                this._addBackgroundToCanvas(canvas, img, width, height);
                resolve(img);
            }, { crossOrigin: 'anonymous' });
        });
    }

    _addBackgroundToCanvas(canvas, img, width, height) {
        // Scale to fill canvas
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        const scale = Math.max(scaleX, scaleY);

        img.set({
            left: width / 2,
            top: height / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            selectable: false,
            evented: false
        });

        canvas.add(img);

        // Add subtle overlay for text readability
        const overlay = new fabric.Rect({
            left: 0,
            top: 0,
            width: width,
            height: height,
            fill: 'rgba(0, 0, 0, 0.25)',
            selectable: false,
            evented: false
        });
        canvas.add(overlay);
    }

    // ==================== 
    // Full Hybrid Generation: AI Background + Arabic Text
    // ==================== 
    async generateHybridPoster(generator, formData, style, onProgress) {
        const steps = [
            { id: 'analyze', label: 'تحليل بيانات العرض', progress: 10 },
            { id: 'ai-generate', label: 'إنشاء خلفية بالذكاء الاصطناعي', progress: 50 },
            { id: 'load-bg', label: 'تحميل الخلفية على التصميم', progress: 70 },
            { id: 'text', label: 'إضافة النصوص العربية', progress: 85 },
            { id: 'compose', label: 'تنسيق العناصر النهائية', progress: 100 }
        ];

        try {
            // Step 1: Analyze
            if (onProgress) onProgress(steps[0]);
            await this._sleep(400);

            // Step 2: Generate AI Background
            if (onProgress) onProgress(steps[1]);
            
            let bgResult;
            if (formData.productName && formData.productName.length > 3) {
                // Use smart generate with product description
                bgResult = await this.smartGenerate(
                    formData.category,
                    formData.productName + ' ' + (formData.offerText || '')
                );
            } else {
                bgResult = await this.generateBackground(
                    formData.category,
                    style || this.selectedStyle
                );
            }

            // Step 3: Load background into canvas
            if (onProgress) onProgress(steps[2]);
            generator.canvas.clear();
            
            await this.loadBackgroundToCanvas(
                generator.canvas,
                bgResult.imageUrl,
                generator.width,
                generator.height
            );

            // Step 4: Add Arabic text layers
            if (onProgress) onProgress(steps[3]);
            await this._sleep(200);

            const theme = generator.getTheme();
            generator.drawBusinessName(theme);
            generator.drawProductSection(theme);
            
            if (generator.uploadedImage) {
                await generator.drawProductImage(theme);
            }
            
            generator.drawPriceBadge(theme);
            generator.drawOfferBanner(theme);
            generator.drawContactSection(theme);
            generator.drawCTAButton(theme);

            // Step 5: Final compose
            if (onProgress) onProgress(steps[4]);
            generator.canvas.renderAll();
            await this._sleep(300);

            return {
                success: true,
                imageUrl: bgResult.imageUrl,
                style: bgResult.detectedStyle || style || this.selectedStyle
            };

        } catch (error) {
            console.error('Hybrid generation failed:', error);
            throw error;
        }
    }

    // ==================== 
    // Get Available Styles
    // ==================== 
    getStyles() {
        return [
            { id: 'modern', name: 'عصري', icon: 'fas fa-bolt', description: 'تصميم حديث وأنيق' },
            { id: 'classic', name: 'كلاسيكي', icon: 'fas fa-crown', description: 'تصميم تقليدي راقي' },
            { id: 'luxury', name: 'فاخر', icon: 'fas fa-gem', description: 'تصميم فخم وراقي' },
            { id: 'colorful', name: 'ملون', icon: 'fas fa-palette', description: 'تصميم مشرق وحيوي' },
            { id: 'minimal', name: 'بسيط', icon: 'fas fa-minus-circle', description: 'تصميم نظيف ومبسط' }
        ];
    }

    // ==================== 
    // Get Style Categories Map (Arabic names)
    // ==================== 
    getCategories() {
        return [
            { id: 'restaurant', name: 'مطاعم', icon: 'fas fa-utensils' },
            { id: 'cafe', name: 'كافيهات', icon: 'fas fa-coffee' },
            { id: 'supermarket', name: 'سوبر ماركت', icon: 'fas fa-shopping-cart' },
            { id: 'shop', name: 'متاجر', icon: 'fas fa-store' },
            { id: 'fashion', name: 'أزياء', icon: 'fas fa-shirt' },
            { id: 'beauty', name: 'تجميل', icon: 'fas fa-spa' },
            { id: 'services', name: 'خدمات', icon: 'fas fa-briefcase' },
            { id: 'online', name: 'متاجر إلكترونية', icon: 'fas fa-globe' },
            { id: 'general', name: 'عام', icon: 'fas fa-th-large' }
        ];
    }

    // ==================== 
    // Utility
    // ==================== 
    setStyle(style) {
        this.selectedStyle = style;
    }

    getLastBackground() {
        return this.lastGeneratedBg;
    }

    getHistory() {
        return this.generationHistory;
    }

    clearHistory() {
        this.generationHistory = [];
    }

    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Create global instance
const aiGenerator = new AIHybridGenerator();
window.aiGenerator = aiGenerator;
