// ==================== 
// Professional Poster Generator - Premium Quality
// ==================== 

class PosterGenerator {
    constructor(canvasId) {
        this.canvasElement = document.getElementById(canvasId);
        this.canvas = null;
        this.width = 1080;
        this.height = 1080;
        this.data = null;
        this.uploadedImage = null;
        
        // Layout customization defaults
        this.layout = {
            titlePositionY: 0.15,
            titleSize: 56,
            imagePositionY: 0.48,
            imageScale: 0.38,
            pricePositionY: 0.72,
            priceSize: 52
        };
        
        // Premium color schemes - Professional restaurant/food industry colors
        this.themes = {
            restaurant: {
                bg: ['#6B0F1A', '#450A0F', '#2D0608'], // Deep burgundy/maroon
                accent: ['#D4AF37', '#C9A227', '#B8961F'], // Rich gold
                text: '#FFFFFF',
                highlight: '#FFD700'
            },
            cafe: {
                bg: ['#3D2314', '#2A1810', '#1A0F0A'], // Coffee brown
                accent: ['#C4A77D', '#B8996D', '#A88B5D'], // Cream/latte
                text: '#FFFFFF',
                highlight: '#DEB887'
            },
            supermarket: {
                bg: ['#1B5E20', '#144D17', '#0D3B10'], // Fresh green
                accent: ['#8BC34A', '#7CB342', '#6DAA3A'], // Lime green
                text: '#FFFFFF',
                highlight: '#CDDC39'
            },
            shop: {
                bg: ['#4A148C', '#38107A', '#280B5A'], // Royal purple
                accent: ['#E040FB', '#D030EB', '#C020DB'], // Magenta
                text: '#FFFFFF',
                highlight: '#FF4081'
            },
            online: {
                bg: ['#FF6B00', '#E65C00', '#CC5200'], // Orange
                accent: ['#FFD54F', '#FFC107', '#FFB300'], // Yellow
                text: '#FFFFFF',
                highlight: '#FFF176'
            },
            services: {
                bg: ['#0D47A1', '#0A3780', '#072860'], // Corporate blue
                accent: ['#42A5F5', '#329AE5', '#228AD5'], // Sky blue
                text: '#FFFFFF',
                highlight: '#64B5F6'
            },
            fashion: {
                bg: ['#212121', '#1A1A1A', '#121212'], // Black
                accent: ['#FF5722', '#F44336', '#E91E63'], // Fashion red
                text: '#FFFFFF',
                highlight: '#FFAB91'
            },
            beauty: {
                bg: ['#880E4F', '#6D0B3F', '#520830'], // Deep rose
                accent: ['#F48FB1', '#F07DA1', '#EC6B91'], // Pink
                text: '#FFFFFF',
                highlight: '#FF80AB'
            },
            general: {
                bg: ['#5B21B6', '#4A1B9A', '#3A157E'], // Purple
                accent: ['#A78BFA', '#9B7EEA', '#8F71DA'], // Lavender
                text: '#FFFFFF',
                highlight: '#C4B5FD'
            }
        };
        
        if (this.canvasElement) {
            this.initFabric();
        }
    }
    
    setLayout(layout) {
        this.layout = { ...this.layout, ...layout };
    }
    
    initFabric() {
        this.canvas = new fabric.Canvas(this.canvasElement, {
            width: this.width,
            height: this.height,
            backgroundColor: '#1A1A1A'
        });
    }
    
    init() {
        if (!this.canvas) return;
        this.clear();
    }
    
    clear() {
        if (!this.canvas) return;
        this.canvas.clear();
        this.canvas.renderAll();
    }
    
    setSize(sizeType) {
        switch(sizeType) {
            case 'instagram-post':
                this.width = 1080;
                this.height = 1080;
                break;
            case 'instagram-story':
                this.width = 1080;
                this.height = 1920;
                break;
            case 'facebook-post':
                this.width = 1200;
                this.height = 630;
                break;
            case 'twitter-post':
                this.width = 1200;
                this.height = 675;
                break;
            default:
                this.width = 1080;
                this.height = 1080;
        }
        
        if (this.canvas) {
            this.canvas.setWidth(this.width);
            this.canvas.setHeight(this.height);
            this.canvas.renderAll();
        }
    }
    
    setData(data) {
        this.data = data;
    }
    
    setImage(imageData) {
        return new Promise((resolve, reject) => {
            if (!imageData) {
                this.uploadedImage = null;
                resolve();
                return;
            }
            
            fabric.Image.fromURL(imageData, (img) => {
                if (img) {
                    this.uploadedImage = img;
                    resolve();
                } else {
                    reject(new Error('Failed to load image'));
                }
            }, { crossOrigin: 'anonymous' });
        });
    }
    
    async generate() {
        if (!this.canvas || !this.data) return;
        
        this.canvas.clear();
        
        // Check if user selected a template
        if (this.data.template && this.data.template.image) {
            // Use template-based generation
            await this.generateWithTemplate();
        } else {
            // Use default generation
            await this.generateDefault();
        }
        
        this.canvas.renderAll();
    }
    
    async generateWithTemplate() {
        const template = this.data.template;
        const templateImageUrl = apiService.getImageUrl(template.image);
        
        // Load template as background
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(templateImageUrl, async (templateImg) => {
                if (!templateImg) {
                    // Fallback to default if template fails to load
                    await this.generateDefault();
                    resolve();
                    return;
                }
                
                // Scale template to fit canvas
                const scale = Math.max(
                    this.width / templateImg.width,
                    this.height / templateImg.height
                );
                
                templateImg.set({
                    left: 0,
                    top: 0,
                    scaleX: scale,
                    scaleY: scale,
                    selectable: false
                });
                
                this.canvas.add(templateImg);
                
                // Add semi-transparent overlay for better text visibility
                const overlay = new fabric.Rect({
                    left: 0,
                    top: 0,
                    width: this.width,
                    height: this.height,
                    fill: 'rgba(0, 0, 0, 0.3)',
                    selectable: false
                });
                this.canvas.add(overlay);
                
                // Now add content on top of template
                const theme = this.getTheme();
                
                this.drawBusinessName(theme);
                this.drawProductSection(theme);
                await this.drawProductImage(theme);
                this.drawPriceBadge(theme);
                this.drawOfferBanner(theme);
                this.drawContactSection(theme);
                this.drawCTAButton(theme);
                
                resolve();
            }, { crossOrigin: 'anonymous' });
        });
    }
    
    async generateDefault() {
        const theme = this.getTheme();
        
        // Build the poster layer by layer
        this.drawBackground(theme);
        this.drawTopAccent(theme);
        this.drawBusinessName(theme);
        this.drawProductSection(theme);
        await this.drawProductImage(theme);
        this.drawPriceBadge(theme);
        this.drawOfferBanner(theme);
        this.drawContactSection(theme);
        this.drawCTAButton(theme);
        this.drawCornerDecorations(theme);
    }
    
    getTheme() {
        const category = this.data.category || 'restaurant';
        const theme = this.themes[category] || this.themes.restaurant;
        
        // Override with selected color if any
        const selectedColor = document.querySelector('input[name="color"]:checked')?.value;
        if (selectedColor) {
            theme.bg = [selectedColor, this.darkenColor(selectedColor, 20), this.darkenColor(selectedColor, 40)];
        }
        
        return theme;
    }
    
    // Layer 1: Rich gradient background
    drawBackground(theme) {
        const gradient = new fabric.Gradient({
            type: 'radial',
            coords: {
                x1: this.width / 2,
                y1: this.height * 0.3,
                x2: this.width / 2,
                y2: this.height * 0.3,
                r1: 0,
                r2: this.height
            },
            colorStops: [
                { offset: 0, color: theme.bg[0] },
                { offset: 0.5, color: theme.bg[1] },
                { offset: 1, color: theme.bg[2] }
            ]
        });
        
        const bg = new fabric.Rect({
            left: 0,
            top: 0,
            width: this.width,
            height: this.height,
            fill: gradient,
            selectable: false
        });
        this.canvas.add(bg);
        
        // Add subtle vignette effect
        const vignette = new fabric.Rect({
            left: 0,
            top: 0,
            width: this.width,
            height: this.height,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: this.width/2, y1: this.height/2, x2: this.width/2, y2: this.height/2, r1: 0, r2: this.width * 0.7 },
                colorStops: [
                    { offset: 0, color: 'rgba(0,0,0,0)' },
                    { offset: 0.7, color: 'rgba(0,0,0,0)' },
                    { offset: 1, color: 'rgba(0,0,0,0.4)' }
                ]
            }),
            selectable: false
        });
        this.canvas.add(vignette);
    }
    
    // Layer 2: Elegant gold/accent top section
    drawTopAccent(theme) {
        const accentHeight = this.height * 0.32;
        
        // Main accent shape with curve
        const accentGradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: this.width, y2: accentHeight },
            colorStops: [
                { offset: 0, color: theme.accent[0] },
                { offset: 0.5, color: theme.accent[1] },
                { offset: 1, color: theme.accent[2] }
            ]
        });
        
        // Curved bottom edge
        const curveY = accentHeight;
        const controlY = accentHeight + 60;
        
        const accentPath = new fabric.Path(
            `M 0 0 
             L ${this.width} 0 
             L ${this.width} ${curveY - 40}
             Q ${this.width * 0.75} ${controlY - 20}, ${this.width * 0.5} ${curveY}
             Q ${this.width * 0.25} ${controlY + 20}, 0 ${curveY - 40}
             Z`,
            {
                fill: accentGradient,
                selectable: false
            }
        );
        this.canvas.add(accentPath);
        
        // Add metallic shine effect
        const shineGradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: this.width, y2: 0 },
            colorStops: [
                { offset: 0, color: 'rgba(255,255,255,0)' },
                { offset: 0.2, color: 'rgba(255,255,255,0.1)' },
                { offset: 0.4, color: 'rgba(255,255,255,0.3)' },
                { offset: 0.5, color: 'rgba(255,255,255,0.4)' },
                { offset: 0.6, color: 'rgba(255,255,255,0.3)' },
                { offset: 0.8, color: 'rgba(255,255,255,0.1)' },
                { offset: 1, color: 'rgba(255,255,255,0)' }
            ]
        });
        
        const shine = new fabric.Rect({
            left: 0,
            top: 0,
            width: this.width,
            height: accentHeight * 0.6,
            fill: shineGradient,
            selectable: false
        });
        this.canvas.add(shine);
        
        // Subtle inner glow line
        const glowLine = new fabric.Rect({
            left: 0,
            top: accentHeight * 0.15,
            width: this.width,
            height: 2,
            fill: 'rgba(255,255,255,0.3)',
            selectable: false
        });
        this.canvas.add(glowLine);
    }
    
    // Layer 3: Business name with logo
    drawBusinessName(theme) {
        const businessName = this.data.businessName || 'اسم المتجر';
        const titleFontSize = this.layout.titleSize || 56;
        const titleY = this.height * (this.layout.titlePositionY || 0.15);
        const titleX = this.width * (this.layout.titlePositionX || 0.5);
        
        // Logo circle background
        const logoY = titleY - 40;
        const logoSize = 80;
        
        // Outer glow for logo
        const logoGlow = new fabric.Circle({
            left: titleX,
            top: logoY + logoSize / 2,
            radius: logoSize / 2 + 8,
            fill: 'rgba(0,0,0,0.2)',
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(logoGlow);
        
        const logoBg = new fabric.Circle({
            left: titleX,
            top: logoY + logoSize / 2,
            radius: logoSize / 2,
            fill: theme.bg[0],
            originX: 'center',
            originY: 'center',
            selectable: false,
            stroke: 'rgba(255,255,255,0.3)',
            strokeWidth: 2
        });
        this.canvas.add(logoBg);
        
        // Logo icon (using text symbol for now)
        const logoSymbols = {
            restaurant: '🍽',
            cafe: '☕',
            supermarket: '🛒',
            shop: '🛍',
            online: '🛒',
            services: '💼',
            fashion: '👗',
            beauty: '💎',
            general: '⭐'
        };
        
        const logoIcon = new fabric.Text(logoSymbols[this.data.category] || '⭐', {
            left: titleX,
            top: logoY + logoSize / 2,
            fontSize: 40,
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(logoIcon);
        
        // Business name text with shadow - uses customizable titleSize
        const nameText = new fabric.Text(businessName, {
            left: titleX,
            top: titleY + 50,
            fontSize: titleFontSize,
            fontWeight: 'bold',
            fill: theme.bg[1],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.15)',
                blur: 8,
                offsetY: 3
            })
        });
        this.canvas.add(nameText);
    }
    
    // Layer 4: Product name section
    drawProductSection(theme) {
        const productName = this.data.productName || 'اسم المنتج';
        const productY = this.height * 0.26;
        
        // Product name with elegant styling
        const productText = new fabric.Text(productName, {
            left: this.width / 2,
            top: productY,
            fontSize: 38,
            fontWeight: 'bold',
            fill: theme.accent[0],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.3)',
                blur: 10,
                offsetY: 4
            })
        });
        this.canvas.add(productText);
    }
    
    // Layer 5: Product image with professional effects
    async drawProductImage(theme) {
        // Use layout customization for position and scale
        const imagePositionY = this.layout.imagePositionY || 0.48;
        const imagePositionX = this.layout.imagePositionX || 0.5;
        const imageScale = this.layout.imageScale || 0.38;
        
        const imgCenterX = this.width * imagePositionX;
        const imgCenterY = this.height * imagePositionY;
        const imgSize = Math.min(this.width, this.height) * imageScale;
        
        // Glow behind image
        const glowGradient = new fabric.Gradient({
            type: 'radial',
            coords: { x1: imgSize/2, y1: imgSize/2, x2: imgSize/2, y2: imgSize/2, r1: 0, r2: imgSize * 0.8 },
            colorStops: [
                { offset: 0, color: this.hexToRgba(theme.accent[0], 0.4) },
                { offset: 0.5, color: this.hexToRgba(theme.accent[0], 0.1) },
                { offset: 1, color: 'rgba(0,0,0,0)' }
            ]
        });
        
        const glow = new fabric.Circle({
            left: imgCenterX,
            top: imgCenterY,
            radius: imgSize * 0.7,
            fill: glowGradient,
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(glow);
        
        // Shadow on surface
        const shadowEllipse = new fabric.Ellipse({
            left: imgCenterX,
            top: imgCenterY + imgSize / 2 + 20,
            rx: imgSize / 2,
            ry: imgSize / 6,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: imgSize/2, y1: imgSize/6, x2: imgSize/2, y2: imgSize/6, r1: 0, r2: imgSize/2 },
                colorStops: [
                    { offset: 0, color: 'rgba(0,0,0,0.35)' },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ]
            }),
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(shadowEllipse);
        
        if (this.uploadedImage) {
            // Clone and prepare image
            const img = fabric.util.object.clone(this.uploadedImage);
            const scale = Math.max(imgSize / img.width, imgSize / img.height);
            img.scale(scale);
            
            // Circular clip with border
            const clipCircle = new fabric.Circle({
                radius: imgSize / 2,
                originX: 'center',
                originY: 'center'
            });
            
            img.set({
                left: imgCenterX,
                top: imgCenterY,
                originX: 'center',
                originY: 'center',
                clipPath: clipCircle,
                selectable: false
            });
            
            // White border ring
            const borderRing = new fabric.Circle({
                left: imgCenterX,
                top: imgCenterY,
                radius: imgSize / 2 + 6,
                fill: 'transparent',
                stroke: 'rgba(255,255,255,0.8)',
                strokeWidth: 4,
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(borderRing);
            this.canvas.add(img);
            
            // Highlight arc on top
            const highlightArc = new fabric.Circle({
                left: imgCenterX,
                top: imgCenterY,
                radius: imgSize / 2 - 10,
                fill: 'transparent',
                stroke: new fabric.Gradient({
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: imgSize, y2: 0 },
                    colorStops: [
                        { offset: 0, color: 'rgba(255,255,255,0)' },
                        { offset: 0.3, color: 'rgba(255,255,255,0.4)' },
                        { offset: 0.5, color: 'rgba(255,255,255,0.6)' },
                        { offset: 0.7, color: 'rgba(255,255,255,0.4)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]
                }),
                strokeWidth: 3,
                originX: 'center',
                originY: 'center',
                selectable: false,
                startAngle: -60,
                endAngle: 60
            });
        } else {
            // Placeholder design
            const placeholderBg = new fabric.Circle({
                left: imgCenterX,
                top: imgCenterY,
                radius: imgSize / 2,
                fill: new fabric.Gradient({
                    type: 'radial',
                    coords: { x1: imgSize/2, y1: imgSize/2, x2: imgSize/2, y2: imgSize/2, r1: 0, r2: imgSize/2 },
                    colorStops: [
                        { offset: 0, color: this.hexToRgba(theme.accent[0], 0.3) },
                        { offset: 1, color: this.hexToRgba(theme.accent[0], 0.1) }
                    ]
                }),
                originX: 'center',
                originY: 'center',
                selectable: false,
                stroke: theme.accent[0],
                strokeWidth: 3,
                strokeDashArray: [15, 10]
            });
            this.canvas.add(placeholderBg);
            
            const placeholderIcon = new fabric.Text('📷', {
                left: imgCenterX,
                top: imgCenterY - 20,
                fontSize: 60,
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(placeholderIcon);
            
            const placeholderText = new fabric.Text('ارفع صورة المنتج', {
                left: imgCenterX,
                top: imgCenterY + 50,
                fontSize: 22,
                fill: theme.accent[0],
                fontFamily: 'Cairo, Tajawal, sans-serif',
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(placeholderText);
        }
    }
    
    // Layer 6: Price badge
    drawPriceBadge(theme) {
        const price = this.data.offerPrice || '99';
        const oldPrice = this.data.originalPrice;
        const priceFontSize = this.layout.priceSize || 52;
        const pricePositionY = this.layout.pricePositionY || 0.72;
        const pricePositionX = this.layout.pricePositionX || 0.5;
        
        const badgeX = this.width * pricePositionX;
        const badgeY = this.height * pricePositionY;
        const badgeSize = 75;
        
        // Outer glow
        const outerGlow = new fabric.Circle({
            left: badgeX,
            top: badgeY,
            radius: badgeSize + 15,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: badgeSize, y1: badgeSize, x2: badgeSize, y2: badgeSize, r1: badgeSize - 10, r2: badgeSize + 15 },
                colorStops: [
                    { offset: 0, color: 'rgba(255,255,255,0.3)' },
                    { offset: 1, color: 'rgba(255,255,255,0)' }
                ]
            }),
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(outerGlow);
        
        // Main badge circle
        const badgeBg = new fabric.Circle({
            left: badgeX,
            top: badgeY,
            radius: badgeSize,
            fill: '#FFFFFF',
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.4)',
                blur: 25,
                offsetY: 10
            })
        });
        this.canvas.add(badgeBg);
        
        // Red ring
        const redRing = new fabric.Circle({
            left: badgeX,
            top: badgeY,
            radius: badgeSize - 8,
            fill: 'transparent',
            stroke: '#DC2626',
            strokeWidth: 7,
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(redRing);
        
        // Price text - uses customizable priceSize
        const priceText = new fabric.Text(price, {
            left: badgeX,
            top: badgeY,
            fontSize: priceFontSize,
            fontWeight: 'bold',
            fill: '#1A1A1A',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(priceText);
        
        // Old price (if exists)
        if (oldPrice) {
            const oldPriceX = badgeX + badgeSize - 5;
            const oldPriceY = badgeY - badgeSize + 5;
            
            const oldBadgeBg = new fabric.Circle({
                left: oldPriceX,
                top: oldPriceY,
                radius: 32,
                fill: '#FFFFFF',
                originX: 'center',
                originY: 'center',
                selectable: false,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 10,
                    offsetY: 4
                })
            });
            this.canvas.add(oldBadgeBg);
            
            const oldPriceText = new fabric.Text(oldPrice, {
                left: oldPriceX,
                top: oldPriceY,
                fontSize: 24,
                fontWeight: 'bold',
                fill: '#DC2626',
                fontFamily: 'Cairo, Tajawal, sans-serif',
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(oldPriceText);
            
            // Strike through
            const strikeWidth = 45;
            const strikeLine = new fabric.Line(
                [oldPriceX - strikeWidth/2, oldPriceY, oldPriceX + strikeWidth/2, oldPriceY],
                {
                    stroke: '#DC2626',
                    strokeWidth: 3,
                    selectable: false
                }
            );
            this.canvas.add(strikeLine);
        }
    }
    
    // Layer 7: Offer banner text
    drawOfferBanner(theme) {
        const offerText = this.data.offerText || 'عرض خاص';
        const bannerY = this.height * 0.81;
        
        const text = new fabric.Text(offerText, {
            left: this.width / 2,
            top: bannerY,
            fontSize: 26,
            fontWeight: 'bold',
            fill: theme.accent[0],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.5)',
                blur: 8,
                offsetY: 2
            })
        });
        this.canvas.add(text);
    }
    
    // Layer 8: Contact/WhatsApp section
    drawContactSection(theme) {
        if (!this.data.whatsapp) return;
        
        const contactY = this.height * 0.865;
        const barWidth = 220;
        const barHeight = 42;
        
        // WhatsApp green bar
        const bar = new fabric.Rect({
            left: this.width / 2,
            top: contactY,
            width: barWidth,
            height: barHeight,
            fill: '#25D366',
            rx: barHeight / 2,
            ry: barHeight / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(37, 211, 102, 0.5)',
                blur: 15,
                offsetY: 5
            })
        });
        this.canvas.add(bar);
        
        // WhatsApp icon and number
        const contactText = new fabric.Text('📞 ' + this.data.whatsapp, {
            left: this.width / 2,
            top: contactY,
            fontSize: 18,
            fontWeight: 'bold',
            fill: '#FFFFFF',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(contactText);
    }
    
    // Layer 9: CTA Button
    drawCTAButton(theme) {
        const ctaText = this.data.ctaText || document.getElementById('ctaText')?.value || 'اطلب الآن واستفيد من العرض';
        const buttonY = this.height * 0.94;
        const buttonWidth = this.width * 0.82;
        const buttonHeight = 55;
        
        // Button gradient
        const buttonGradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: buttonWidth, y2: 0 },
            colorStops: [
                { offset: 0, color: theme.accent[2] },
                { offset: 0.3, color: theme.accent[0] },
                { offset: 0.5, color: theme.highlight },
                { offset: 0.7, color: theme.accent[0] },
                { offset: 1, color: theme.accent[2] }
            ]
        });
        
        const button = new fabric.Rect({
            left: this.width / 2,
            top: buttonY,
            width: buttonWidth,
            height: buttonHeight,
            fill: buttonGradient,
            rx: buttonHeight / 2,
            ry: buttonHeight / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: this.hexToRgba(theme.accent[0], 0.6),
                blur: 20,
                offsetY: 8
            })
        });
        this.canvas.add(button);
        
        // Button text
        const buttonTextObj = new fabric.Text(ctaText, {
            left: this.width / 2,
            top: buttonY,
            fontSize: 24,
            fontWeight: 'bold',
            fill: theme.bg[2],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center',
            originY: 'center',
            selectable: false
        });
        this.canvas.add(buttonTextObj);
    }
    
    // Layer 10: Corner decorations
    drawCornerDecorations(theme) {
        // Top left corner accent
        const cornerSize = 120;
        
        const topLeftCorner = new fabric.Triangle({
            left: 0,
            top: 0,
            width: cornerSize,
            height: cornerSize,
            fill: this.hexToRgba(theme.accent[0], 0.2),
            selectable: false,
            angle: 0
        });
        // this.canvas.add(topLeftCorner);
        
        // Subtle sparkle dots
        const sparkles = [
            { x: 60, y: this.height * 0.35 },
            { x: this.width - 60, y: this.height * 0.38 },
            { x: 80, y: this.height * 0.55 },
            { x: this.width - 80, y: this.height * 0.58 },
            { x: 50, y: this.height * 0.75 },
            { x: this.width - 50, y: this.height * 0.72 }
        ];
        
        sparkles.forEach(pos => {
            // Outer glow
            const glow = new fabric.Circle({
                left: pos.x,
                top: pos.y,
                radius: 8,
                fill: new fabric.Gradient({
                    type: 'radial',
                    coords: { x1: 8, y1: 8, x2: 8, y2: 8, r1: 0, r2: 8 },
                    colorStops: [
                        { offset: 0, color: 'rgba(255,255,255,0.8)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]
                }),
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(glow);
            
            // Center dot
            const dot = new fabric.Circle({
                left: pos.x,
                top: pos.y,
                radius: 3,
                fill: '#FFFFFF',
                originX: 'center',
                originY: 'center',
                selectable: false
            });
            this.canvas.add(dot);
        });
        
        // Add subtle curved lines on sides
        const leftCurve = new fabric.Path(
            `M 0 ${this.height * 0.4} Q 30 ${this.height * 0.5} 0 ${this.height * 0.6}`,
            {
                fill: 'transparent',
                stroke: this.hexToRgba(theme.accent[0], 0.3),
                strokeWidth: 2,
                selectable: false
            }
        );
        this.canvas.add(leftCurve);
        
        const rightCurve = new fabric.Path(
            `M ${this.width} ${this.height * 0.4} Q ${this.width - 30} ${this.height * 0.5} ${this.width} ${this.height * 0.6}`,
            {
                fill: 'transparent',
                stroke: this.hexToRgba(theme.accent[0], 0.3),
                strokeWidth: 2,
                selectable: false
            }
        );
        this.canvas.add(rightCurve);
    }
    
    // Utility functions
    hexToRgba(hex, alpha) {
        if (!hex || hex.charAt(0) !== '#') return `rgba(139, 92, 246, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    darkenColor(hex, percent) {
        if (!hex || hex.charAt(0) !== '#') return hex;
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max((num >> 16) - amt, 0);
        const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
        const B = Math.max((num & 0x0000FF) - amt, 0);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
    
    download(filename = 'poster') {
        if (!this.canvas) return;
        
        const link = document.createElement('a');
        link.download = filename + '.png';
        link.href = this.canvas.toDataURL({ format: 'png', quality: 1.0 });
        link.click();
    }
    
    getDataURL() {
        if (!this.canvas) return null;
        return this.canvas.toDataURL({ format: 'png', quality: 1.0 });
    }
}

window.PosterGenerator = PosterGenerator;
