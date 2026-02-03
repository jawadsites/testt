// ====================
// Professional Export System with Multiple Formats & Sizes
// ====================

class ExportManager {
    constructor(posterGenerator) {
        this.generator = posterGenerator;
        this.canvas = posterGenerator.canvas;
        
        // Social media size presets
        this.presets = {
            instagram_post: { width: 1080, height: 1080, name: 'Instagram Post (1:1)' },
            instagram_story: { width: 1080, height: 1920, name: 'Instagram Story (9:16)' },
            facebook_post: { width: 1200, height: 630, name: 'Facebook Post' },
            facebook_cover: { width: 820, height: 312, name: 'Facebook Cover' },
            twitter_post: { width: 1200, height: 675, name: 'Twitter Post' },
            twitter_header: { width: 1500, height: 500, name: 'Twitter Header' },
            linkedin_post: { width: 1200, height: 627, name: 'LinkedIn Post' },
            pinterest_pin: { width: 1000, height: 1500, name: 'Pinterest Pin (2:3)' },
            youtube_thumbnail: { width: 1280, height: 720, name: 'YouTube Thumbnail' },
            whatsapp_status: { width: 1080, height: 1920, name: 'WhatsApp Status' },
            a4_portrait: { width: 2480, height: 3508, name: 'A4 Portrait (Print)' },
            a4_landscape: { width: 3508, height: 2480, name: 'A4 Landscape (Print)' },
            custom: { width: 1080, height: 1080, name: 'Custom Size' }
        };
        
        // Export formats
        this.formats = {
            png: { ext: 'png', mime: 'image/png', quality: 1 },
            jpg: { ext: 'jpg', mime: 'image/jpeg', quality: 0.92 },
            webp: { ext: 'webp', mime: 'image/webp', quality: 0.9 }
        };
    }
    
    // Export with specific format and size
    exportDesign(options = {}) {
        const {
            format = 'png',
            preset = 'instagram_post',
            filename = 'poster',
            quality = null
        } = options;
        
        const formatConfig = this.formats[format];
        const presetConfig = this.presets[preset];
        
        if (!formatConfig || !presetConfig) {
            console.error('Invalid format or preset');
            return null;
        }
        
        // Save current canvas size
        const originalWidth = this.canvas.width;
        const originalHeight = this.canvas.height;
        const originalZoom = this.canvas.getZoom();
        
        // Calculate scale factor
        const scaleX = presetConfig.width / originalWidth;
        const scaleY = presetConfig.height / originalHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // Apply new dimensions
        this.canvas.setDimensions({
            width: presetConfig.width,
            height: presetConfig.height
        });
        this.canvas.setZoom(scale);
        
        // Export with format
        const dataURL = this.canvas.toDataURL({
            format: format === 'jpg' ? 'jpeg' : format,
            quality: quality || formatConfig.quality,
            multiplier: 1
        });
        
        // Restore original size
        this.canvas.setDimensions({
            width: originalWidth,
            height: originalHeight
        });
        this.canvas.setZoom(originalZoom);
        this.canvas.renderAll();
        
        // Download
        this.downloadImage(dataURL, `${filename}.${formatConfig.ext}`);
        
        return dataURL;
    }
    
    // Batch export - multiple formats/sizes at once
    async batchExport(presets, formats, baseFilename = 'poster') {
        const results = [];
        
        for (const preset of presets) {
            for (const format of formats) {
                const filename = `${baseFilename}_${preset}_${format}`;
                const dataURL = this.exportDesign({ format, preset, filename });
                
                results.push({
                    preset,
                    format,
                    filename,
                    dataURL,
                    size: this.presets[preset]
                });
                
                // Small delay to prevent browser freeze
                await this.delay(100);
            }
        }
        
        return results;
    }
    
    // Download image helper
    downloadImage(dataURL, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Utility delay
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Get available presets for UI
    getPresets() {
        return this.presets;
    }
    
    // Get available formats for UI
    getFormats() {
        return this.formats;
    }
}

// ====================
// QR Code Generator Integration
// ====================

class QRCodeManager {
    constructor(posterGenerator) {
        this.generator = posterGenerator;
        this.canvas = posterGenerator.canvas;
    }
    
    // Add QR code to canvas
    async addQRCode(text, options = {}) {
        const {
            size = 200,
            x = this.canvas.width - 250,
            y = this.canvas.height - 250,
            backgroundColor = '#FFFFFF',
            foregroundColor = '#000000'
        } = options;
        
        try {
            // Generate QR code using qrcode library
            const qrDataURL = await QRCode.toDataURL(text, {
                width: size,
                margin: 1,
                color: {
                    dark: foregroundColor,
                    light: backgroundColor
                }
            });
            
            // Load as fabric image
            fabric.Image.fromURL(qrDataURL, (img) => {
                img.set({
                    left: x,
                    top: y,
                    selectable: true,
                    hasControls: true
                });
                
                this.canvas.add(img);
                this.canvas.renderAll();
            });
            
            return true;
        } catch (error) {
            console.error('QR Code generation failed:', error);
            return false;
        }
    }
}

// ====================
// Design History Manager
// ====================

class DesignHistory {
    constructor() {
        this.storageKey = 'poster_design_history';
        this.maxHistory = 50;
    }
    
    // Save design to history
    saveDesign(design) {
        const history = this.getHistory();
        
        const designData = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            thumbnail: design.thumbnail,
            data: design.data,
            layout: design.layout,
            templateId: design.templateId
        };
        
        history.unshift(designData);
        
        // Keep only last N designs
        if (history.length > this.maxHistory) {
            history.pop();
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(history));
        return designData;
    }
    
    // Get all saved designs
    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }
    
    // Load specific design
    loadDesign(designId) {
        const history = this.getHistory();
        return history.find(d => d.id === designId);
    }
    
    // Delete design from history
    deleteDesign(designId) {
        let history = this.getHistory();
        history = history.filter(d => d.id !== designId);
        localStorage.setItem(this.storageKey, JSON.stringify(history));
    }
    
    // Clear all history
    clearHistory() {
        localStorage.removeItem(this.storageKey);
    }
}

// ====================
// Brand Kit System
// ====================

class BrandKit {
    constructor() {
        this.storageKey = 'poster_brand_kit';
    }
    
    // Save brand kit
    saveBrandKit(brandData) {
        const kit = {
            id: Date.now().toString(),
            name: brandData.name || 'My Brand',
            colors: brandData.colors || [],
            fonts: brandData.fonts || [],
            logo: brandData.logo || null,
            createdAt: new Date().toISOString()
        };
        
        const kits = this.getAllKits();
        kits.push(kit);
        
        localStorage.setItem(this.storageKey, JSON.stringify(kits));
        return kit;
    }
    
    // Get all brand kits
    getAllKits() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            return [];
        }
    }
    
    // Load specific kit
    loadKit(kitId) {
        const kits = this.getAllKits();
        return kits.find(k => k.id === kitId);
    }
    
    // Update kit
    updateKit(kitId, updates) {
        let kits = this.getAllKits();
        const index = kits.findIndex(k => k.id === kitId);
        
        if (index !== -1) {
            kits[index] = { ...kits[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.storageKey, JSON.stringify(kits));
            return kits[index];
        }
        return null;
    }
    
    // Delete kit
    deleteKit(kitId) {
        let kits = this.getAllKits();
        kits = kits.filter(k => k.id !== kitId);
        localStorage.setItem(this.storageKey, JSON.stringify(kits));
    }
}

// Export for use
window.ExportManager = ExportManager;
window.QRCodeManager = QRCodeManager;
window.DesignHistory = DesignHistory;
window.BrandKit = BrandKit;
