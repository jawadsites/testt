// ==================== 
// Professional Poster Generator V2 - Premium Quality
// Complete rewrite for truly professional designs
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
            titlePositionY: 0.12,
            titlePositionX: 0.5,
            titleSize: 58,
            imagePositionY: 0.46,
            imagePositionX: 0.5,
            imageScale: 0.35,
            pricePositionY: 0.73,
            pricePositionX: 0.5,
            priceSize: 52
        };
        
        // Professional category-specific themes
        this.themes = {
            restaurant: {
                bg: ['#8B0000', '#5C0000', '#3A0000'],
                accent: ['#D4AF37', '#C9A227', '#B8961F'],
                text: '#FFFFFF',
                highlight: '#FFD700',
                gradient: ['#8B0000', '#2D0000'],
                categoryLabel: 'مطعم'
            },
            cafe: {
                bg: ['#3E2723', '#2C1A12', '#1A0F0A'],
                accent: ['#D7A574', '#C49362', '#B18150'],
                text: '#FFFFFF',
                highlight: '#F5DEB3',
                gradient: ['#4E342E', '#1A0F0A'],
                categoryLabel: 'كافيه'
            },
            supermarket: {
                bg: ['#1B5E20', '#0D3B10', '#062507'],
                accent: ['#76FF03', '#64DD17', '#4CAF50'],
                text: '#FFFFFF',
                highlight: '#CCFF90',
                gradient: ['#2E7D32', '#0D3B10'],
                categoryLabel: 'سوبر ماركت'
            },
            shop: {
                bg: ['#311B92', '#1A0F5A', '#0D0735'],
                accent: ['#B388FF', '#9C64FF', '#7C4DFF'],
                text: '#FFFFFF',
                highlight: '#E8D5FF',
                gradient: ['#4527A0', '#1A0F5A'],
                categoryLabel: 'متجر'
            },
            online: {
                bg: ['#E65100', '#BF360C', '#8D1F00'],
                accent: ['#FFD54F', '#FFC107', '#FFB300'],
                text: '#FFFFFF',
                highlight: '#FFF9C4',
                gradient: ['#EF6C00', '#8D1F00'],
                categoryLabel: 'متجر إلكتروني'
            },
            services: {
                bg: ['#0D47A1', '#072D6A', '#041B40'],
                accent: ['#42A5F5', '#2196F3', '#1976D2'],
                text: '#FFFFFF',
                highlight: '#BBDEFB',
                gradient: ['#1565C0', '#041B40'],
                categoryLabel: 'خدمات'
            },
            fashion: {
                bg: ['#1A1A1A', '#0D0D0D', '#000000'],
                accent: ['#FF4081', '#F50057', '#C51162'],
                text: '#FFFFFF',
                highlight: '#FF80AB',
                gradient: ['#212121', '#000000'],
                categoryLabel: 'أزياء'
            },
            beauty: {
                bg: ['#880E4F', '#5C0A37', '#3A0623'],
                accent: ['#F8BBD0', '#F48FB1', '#EC407A'],
                text: '#FFFFFF',
                highlight: '#FCE4EC',
                gradient: ['#AD1457', '#3A0623'],
                categoryLabel: 'تجميل وعناية'
            },
            general: {
                bg: ['#4A148C', '#310C63', '#1A063A'],
                accent: ['#B39DDB', '#9575CD', '#7E57C2'],
                text: '#FFFFFF',
                highlight: '#D1C4E9',
                gradient: ['#6A1B9A', '#1A063A'],
                categoryLabel: 'عام'
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
                this.width = 1080; this.height = 1080; break;
            case 'instagram-story':
                this.width = 1080; this.height = 1920; break;
            case 'facebook-post':
                this.width = 1200; this.height = 630; break;
            case 'twitter-post':
                this.width = 1200; this.height = 675; break;
            default:
                this.width = 1080; this.height = 1080;
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
        
        if (this.data.template && this.data.template.image) {
            await this.generateWithTemplate();
        } else {
            await this.generateDefault();
        }
        
        this.canvas.renderAll();
    }
    
    async generateWithTemplate() {
        const template = this.data.template;
        const templateImageUrl = apiService.getImageUrl(template.image);
        
        return new Promise((resolve, reject) => {
            fabric.Image.fromURL(templateImageUrl, async (templateImg) => {
                if (!templateImg) {
                    await this.generateDefault();
                    resolve();
                    return;
                }
                
                const scale = Math.max(this.width / templateImg.width, this.height / templateImg.height);
                templateImg.set({
                    left: 0, top: 0,
                    scaleX: scale, scaleY: scale,
                    selectable: false
                });
                this.canvas.add(templateImg);
                
                // Darker overlay for better text readability
                const overlay = new fabric.Rect({
                    left: 0, top: 0,
                    width: this.width, height: this.height,
                    fill: 'rgba(0, 0, 0, 0.4)',
                    selectable: false
                });
                this.canvas.add(overlay);
                
                const theme = this.getTheme();
                this.drawBusinessName(theme);
                await this.drawProductImage(theme);
                this.drawProductSection(theme);
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
        
        // Build professional poster layer by layer
        this.drawProfessionalBackground(theme);
        this.drawTopSection(theme);
        this.drawBusinessName(theme);
        await this.drawProductImage(theme);
        this.drawProductSection(theme);
        this.drawPriceBadge(theme);
        this.drawOfferBanner(theme);
        this.drawContactSection(theme);
        this.drawCTAButton(theme);
        this.drawDecorativeElements(theme);
        this.drawBorderFrame(theme);
    }
    
    getTheme() {
        const category = this.data.category || 'restaurant';
        // Deep clone to avoid mutating original
        const src = this.themes[category] || this.themes.restaurant;
        const theme = {
            bg: [...src.bg],
            accent: [...src.accent],
            text: src.text,
            highlight: src.highlight,
            gradient: [...src.gradient],
            categoryLabel: src.categoryLabel
        };
        
        const selectedColor = document.querySelector('input[name="color"]:checked')?.value;
        if (selectedColor) {
            theme.bg = [selectedColor, this.darkenColor(selectedColor, 25), this.darkenColor(selectedColor, 50)];
            theme.gradient = [selectedColor, this.darkenColor(selectedColor, 50)];
        }
        
        return theme;
    }
    
    // ==========================================
    // LAYER 1: Professional Full Background
    // ==========================================
    drawProfessionalBackground(theme) {
        // Deep rich gradient background
        const bg = new fabric.Rect({
            left: 0, top: 0,
            width: this.width, height: this.height,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: this.height },
                colorStops: [
                    { offset: 0, color: theme.gradient[0] },
                    { offset: 0.35, color: theme.bg[1] },
                    { offset: 1, color: theme.gradient[1] }
                ]
            }),
            selectable: false
        });
        this.canvas.add(bg);
        
        // Radial spotlight from top center
        const spotlight = new fabric.Rect({
            left: 0, top: 0,
            width: this.width, height: this.height,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { 
                    x1: this.width / 2, y1: this.height * 0.15,
                    x2: this.width / 2, y2: this.height * 0.15,
                    r1: 0, r2: this.width * 0.7 
                },
                colorStops: [
                    { offset: 0, color: 'rgba(255,255,255,0.08)' },
                    { offset: 0.4, color: 'rgba(255,255,255,0.03)' },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ]
            }),
            selectable: false
        });
        this.canvas.add(spotlight);
        
        // Subtle scattered soft circles for texture
        for (let i = 0; i < 10; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = 30 + Math.random() * 80;
            const opacity = 0.015 + Math.random() * 0.03;
            
            this.canvas.add(new fabric.Circle({
                left: x, top: y, radius: size,
                fill: `rgba(255,255,255,${opacity})`,
                originX: 'center', originY: 'center',
                selectable: false
            }));
        }
    }
    
    // ==========================================
    // LAYER 2: Top Header Section - Curved Accent
    // ==========================================
    drawTopSection(theme) {
        const headerH = this.height * 0.22;
        
        // Curved accent header
        const headerPath = new fabric.Path(
            `M 0 0 
             L ${this.width} 0 
             L ${this.width} ${headerH * 0.75}
             Q ${this.width * 0.75} ${headerH + 35}, ${this.width * 0.5} ${headerH}
             Q ${this.width * 0.25} ${headerH - 35}, 0 ${headerH * 0.75}
             Z`,
            {
                fill: new fabric.Gradient({
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: this.width, y2: headerH },
                    colorStops: [
                        { offset: 0, color: theme.accent[0] },
                        { offset: 0.5, color: theme.accent[1] },
                        { offset: 1, color: theme.accent[2] }
                    ]
                }),
                selectable: false,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 25,
                    offsetY: 10
                })
            }
        );
        this.canvas.add(headerPath);
        
        // Metallic shine overlay on top half
        const shine = new fabric.Path(
            `M 0 0 
             L ${this.width} 0 
             L ${this.width} ${headerH * 0.38}
             L 0 ${headerH * 0.32}
             Z`,
            {
                fill: new fabric.Gradient({
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: this.width, y2: 0 },
                    colorStops: [
                        { offset: 0, color: 'rgba(255,255,255,0)' },
                        { offset: 0.3, color: 'rgba(255,255,255,0.12)' },
                        { offset: 0.5, color: 'rgba(255,255,255,0.22)' },
                        { offset: 0.7, color: 'rgba(255,255,255,0.12)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]
                }),
                selectable: false
            }
        );
        this.canvas.add(shine);
    }
    
    // ==========================================
    // LAYER 3: Business Name - Large Professional
    // ==========================================
    drawBusinessName(theme) {
        const businessName = this.fixArabicText(this.data.businessName || 'اسم النشاط');
        const titleFontSize = this.layout.titleSize || 58;
        const titleY = this.height * (this.layout.titlePositionY || 0.12);
        const titleX = this.width * (this.layout.titlePositionX || 0.5);
        
        // Deep shadow for 3D depth
        this.canvas.add(new fabric.Text(businessName, {
            left: titleX + 2, top: titleY + 3,
            fontSize: titleFontSize,
            fontWeight: '900',
            fill: 'rgba(0,0,0,0.5)',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false
        }));
        
        // Main business name
        this.canvas.add(new fabric.Text(businessName, {
            left: titleX, top: titleY,
            fontSize: titleFontSize,
            fontWeight: '900',
            fill: theme.bg[2],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.2)',
                blur: 4, offsetY: 2
            }),
            charSpacing: 50
        }));
    }
    
    // ==========================================
    // LAYER 4: Product Name - Glowing Featured
    // ==========================================
    drawProductSection(theme) {
        const productName = this.fixArabicText(this.data.productName || 'اسم المنتج');
        const productY = this.height * 0.54;
        
        // Separator line with diamond
        const lineW = this.width * 0.4;
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: productY - 28,
            width: lineW, height: 2,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: lineW, y2: 0 },
                colorStops: [
                    { offset: 0, color: 'rgba(255,255,255,0)' },
                    { offset: 0.3, color: this.hexToRgba(theme.accent[0], 0.6) },
                    { offset: 0.5, color: theme.accent[0] },
                    { offset: 0.7, color: this.hexToRgba(theme.accent[0], 0.6) },
                    { offset: 1, color: 'rgba(255,255,255,0)' }
                ]
            }),
            originX: 'center', originY: 'center',
            selectable: false
        }));
        
        // Diamond decoration
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: productY - 28,
            width: 10, height: 10,
            fill: theme.accent[0],
            originX: 'center', originY: 'center',
            angle: 45, selectable: false
        }));
        
        // Product name text - white, glowing
        this.canvas.add(new fabric.Text(productName, {
            left: this.width / 2, top: productY,
            fontSize: 42, fontWeight: '800',
            fill: '#FFFFFF',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false,
            shadow: new fabric.Shadow({
                color: this.hexToRgba(theme.accent[0], 0.5),
                blur: 15, offsetY: 0
            }),
            charSpacing: 30
        }));
    }
    
    // ==========================================
    // LAYER 5: Product Image - Professional Frame
    // ==========================================
    async drawProductImage(theme) {
        const imgPosY = this.layout.imagePositionY || 0.33;
        const imgPosX = this.layout.imagePositionX || 0.5;
        const imgScale = this.layout.imageScale || 0.35;
        
        const cx = this.width * imgPosX;
        const cy = this.height * imgPosY;
        const imgSize = Math.min(this.width, this.height) * imgScale;
        
        // Ambient glow
        this.canvas.add(new fabric.Circle({
            left: cx, top: cy,
            radius: imgSize * 0.75,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: imgSize*0.75, y1: imgSize*0.75, x2: imgSize*0.75, y2: imgSize*0.75, r1: 0, r2: imgSize*0.75 },
                colorStops: [
                    { offset: 0, color: this.hexToRgba(theme.accent[0], 0.2) },
                    { offset: 0.6, color: this.hexToRgba(theme.accent[0], 0.06) },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ]
            }),
            originX: 'center', originY: 'center',
            selectable: false
        }));
        
        if (this.uploadedImage) {
            const img = fabric.util.object.clone(this.uploadedImage);
            const scale = Math.max(imgSize / img.width, imgSize / img.height);
            img.scale(scale);
            
            // Accent ring
            this.canvas.add(new fabric.Circle({
                left: cx, top: cy,
                radius: imgSize / 2 + 10,
                fill: 'transparent',
                stroke: theme.accent[0],
                strokeWidth: 5,
                originX: 'center', originY: 'center',
                selectable: false,
                shadow: new fabric.Shadow({
                    color: this.hexToRgba(theme.accent[0], 0.4),
                    blur: 15, offsetY: 0
                })
            }));
            
            // White ring
            this.canvas.add(new fabric.Circle({
                left: cx, top: cy,
                radius: imgSize / 2 + 4,
                fill: 'transparent',
                stroke: 'rgba(255,255,255,0.85)',
                strokeWidth: 3,
                originX: 'center', originY: 'center',
                selectable: false
            }));
            
            img.set({
                left: cx, top: cy,
                originX: 'center', originY: 'center',
                clipPath: new fabric.Circle({
                    radius: imgSize / 2,
                    originX: 'center', originY: 'center'
                }),
                selectable: false
            });
            this.canvas.add(img);
            
        } else {
            // Placeholder
            this.canvas.add(new fabric.Circle({
                left: cx, top: cy,
                radius: imgSize / 2,
                fill: this.hexToRgba(theme.accent[0], 0.08),
                originX: 'center', originY: 'center',
                selectable: false,
                stroke: this.hexToRgba(theme.accent[0], 0.25),
                strokeWidth: 3,
                strokeDashArray: [15, 10]
            }));
            
            this.canvas.add(new fabric.Text('📷', {
                left: cx, top: cy - 15,
                fontSize: 50,
                originX: 'center', originY: 'center',
                selectable: false
            }));
            
            this.canvas.add(new fabric.Text(this.fixArabicText('ارفع صورة المنتج'), {
                left: cx, top: cy + 40,
                fontSize: 20, fill: theme.accent[0],
                fontFamily: 'Cairo, Tajawal, sans-serif',
                originX: 'center', originY: 'center',
                textAlign: 'center',
                direction: 'rtl',
                selectable: false, opacity: 0.6
            }));
        }
    }
    
    // ==========================================
    // LAYER 6: Price Badge - Bold & Eye-catching
    // ==========================================
    drawPriceBadge(theme) {
        const price = this.data.offerPrice || '99';
        const oldPrice = this.data.originalPrice;
        const priceFontSize = this.layout.priceSize || 52;
        const priceY = this.height * (this.layout.pricePositionY || 0.73);
        const priceX = this.width * (this.layout.pricePositionX || 0.5);
        const badgeR = 70;
        
        // Large outer glow
        this.canvas.add(new fabric.Circle({
            left: priceX, top: priceY,
            radius: badgeR + 25,
            fill: new fabric.Gradient({
                type: 'radial',
                coords: { x1: badgeR+25, y1: badgeR+25, x2: badgeR+25, y2: badgeR+25, r1: badgeR-10, r2: badgeR+25 },
                colorStops: [
                    { offset: 0, color: this.hexToRgba(theme.accent[0], 0.35) },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ]
            }),
            originX: 'center', originY: 'center',
            selectable: false
        }));
        
        // White badge
        this.canvas.add(new fabric.Circle({
            left: priceX, top: priceY,
            radius: badgeR,
            fill: '#FFFFFF',
            originX: 'center', originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.3)',
                blur: 30, offsetY: 8
            })
        }));
        
        // Colored ring
        this.canvas.add(new fabric.Circle({
            left: priceX, top: priceY,
            radius: badgeR - 7,
            fill: 'transparent',
            stroke: theme.accent[0],
            strokeWidth: 5,
            originX: 'center', originY: 'center',
            selectable: false
        }));
        
        // Price number
        this.canvas.add(new fabric.Text(price, {
            left: priceX, top: priceY,
            fontSize: priceFontSize,
            fontWeight: '900',
            fill: theme.bg[0],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false
        }));
        
        // Old price with red badge
        if (oldPrice) {
            const ox = priceX + badgeR - 10;
            const oy = priceY - badgeR + 10;
            
            this.canvas.add(new fabric.Circle({
                left: ox, top: oy, radius: 30,
                fill: '#EF4444',
                originX: 'center', originY: 'center',
                selectable: false,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.3)',
                    blur: 8, offsetY: 3
                })
            }));
            
            this.canvas.add(new fabric.Text(oldPrice, {
                left: ox, top: oy,
                fontSize: 20, fontWeight: '700',
                fill: '#FFFFFF',
                fontFamily: 'Cairo, Tajawal, sans-serif',
                originX: 'center', originY: 'center',
                textAlign: 'center',
                direction: 'rtl',
                selectable: false
            }));
            
            this.canvas.add(new fabric.Line(
                [ox - 22, oy, ox + 22, oy],
                { stroke: '#FFFFFF', strokeWidth: 2.5, selectable: false }
            ));
        }
    }
    
    // ==========================================
    // LAYER 7: Offer Banner
    // ==========================================
    drawOfferBanner(theme) {
        const offerText = this.fixArabicText(this.data.offerText || 'عرض خاص');
        const bannerY = this.height * 0.835;
        const bannerW = this.width * 0.55;
        const bannerH = 46;
        
        // Pill background
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: bannerY,
            width: bannerW, height: bannerH,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: bannerW, y2: 0 },
                colorStops: [
                    { offset: 0, color: this.hexToRgba(theme.accent[0], 0.1) },
                    { offset: 0.5, color: this.hexToRgba(theme.accent[0], 0.2) },
                    { offset: 1, color: this.hexToRgba(theme.accent[0], 0.1) }
                ]
            }),
            rx: bannerH / 2, ry: bannerH / 2,
            originX: 'center', originY: 'center',
            selectable: false,
            stroke: this.hexToRgba(theme.accent[0], 0.3),
            strokeWidth: 1
        }));
        
        this.canvas.add(new fabric.Text('✨ ' + offerText + ' ✨', {
            left: this.width / 2, top: bannerY,
            fontSize: 24, fontWeight: '700',
            fill: theme.accent[0],
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false,
            shadow: new fabric.Shadow({
                color: this.hexToRgba(theme.accent[0], 0.4),
                blur: 10, offsetY: 0
            }),
            charSpacing: 40
        }));
    }
    
    // ==========================================
    // LAYER 8: WhatsApp Contact
    // ==========================================
    drawContactSection(theme) {
        if (!this.data.whatsapp) return;
        
        const contactY = this.height * 0.895;
        const barW = 240;
        const barH = 42;
        
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: contactY,
            width: barW, height: barH,
            fill: '#25D366',
            rx: barH / 2, ry: barH / 2,
            originX: 'center', originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: 'rgba(37, 211, 102, 0.5)',
                blur: 15, offsetY: 5
            })
        }));
        
        this.canvas.add(new fabric.Text('📱 ' + this.data.whatsapp, {
            left: this.width / 2, top: contactY,
            fontSize: 17, fontWeight: '700',
            fill: '#FFFFFF',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false
        }));
    }
    
    // ==========================================
    // LAYER 9: CTA Button - Full Width
    // ==========================================
    drawCTAButton(theme) {
        const ctaText = this.fixArabicText(this.data.ctaText || document.getElementById('ctaText')?.value || 'اطلب الآن');
        const btnY = this.height * 0.955;
        const btnW = this.width * 0.88;
        const btnH = 56;
        
        // Shadow
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: btnY + 3,
            width: btnW, height: btnH,
            fill: 'rgba(0,0,0,0.3)',
            rx: btnH / 2, ry: btnH / 2,
            originX: 'center', originY: 'center',
            selectable: false
        }));
        
        // Main button
        this.canvas.add(new fabric.Rect({
            left: this.width / 2, top: btnY,
            width: btnW, height: btnH,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: btnW, y2: 0 },
                colorStops: [
                    { offset: 0, color: theme.accent[2] || theme.accent[0] },
                    { offset: 0.5, color: theme.accent[0] },
                    { offset: 1, color: theme.accent[2] || theme.accent[0] }
                ]
            }),
            rx: btnH / 2, ry: btnH / 2,
            originX: 'center', originY: 'center',
            selectable: false,
            shadow: new fabric.Shadow({
                color: this.hexToRgba(theme.accent[0], 0.5),
                blur: 20, offsetY: 5
            })
        }));
        
        // Button text
        this.canvas.add(new fabric.Text(ctaText, {
            left: this.width / 2, top: btnY,
            fontSize: 26, fontWeight: '800',
            fill: theme.bg[2] || '#000000',
            fontFamily: 'Cairo, Tajawal, sans-serif',
            originX: 'center', originY: 'center',
            textAlign: 'center',
            direction: 'rtl',
            selectable: false,
            charSpacing: 60
        }));
    }
    
    // ==========================================
    // LAYER 10: Decorative Sparkles
    // ==========================================
    drawDecorativeElements(theme) {
        const positions = [
            { x: 0.08, y: 0.35, s: 4 },
            { x: 0.92, y: 0.38, s: 3 },
            { x: 0.1, y: 0.55, s: 3 },
            { x: 0.9, y: 0.6, s: 4 },
            { x: 0.06, y: 0.75, s: 2 },
            { x: 0.94, y: 0.72, s: 3 },
            { x: 0.15, y: 0.43, s: 2 },
            { x: 0.85, y: 0.48, s: 2 }
        ];
        
        positions.forEach(p => {
            const px = this.width * p.x;
            const py = this.height * p.y;
            
            // Glow
            this.canvas.add(new fabric.Circle({
                left: px, top: py,
                radius: p.s * 3,
                fill: new fabric.Gradient({
                    type: 'radial',
                    coords: { x1: p.s*3, y1: p.s*3, x2: p.s*3, y2: p.s*3, r1: 0, r2: p.s*3 },
                    colorStops: [
                        { offset: 0, color: 'rgba(255,255,255,0.5)' },
                        { offset: 1, color: 'rgba(255,255,255,0)' }
                    ]
                }),
                originX: 'center', originY: 'center',
                selectable: false
            }));
            
            this.canvas.add(new fabric.Circle({
                left: px, top: py,
                radius: p.s,
                fill: '#FFFFFF', opacity: 0.6,
                originX: 'center', originY: 'center',
                selectable: false
            }));
        });
    }
    
    // ==========================================
    // LAYER 11: Border Frame
    // ==========================================
    drawBorderFrame(theme) {
        const pad = 16;
        const cr = 20;
        
        this.canvas.add(new fabric.Rect({
            left: pad, top: pad,
            width: this.width - pad * 2,
            height: this.height - pad * 2,
            fill: 'transparent',
            stroke: this.hexToRgba(theme.accent[0], 0.2),
            strokeWidth: 1.5,
            rx: cr, ry: cr,
            selectable: false
        }));
        
        this.canvas.add(new fabric.Rect({
            left: pad + 6, top: pad + 6,
            width: this.width - (pad + 6) * 2,
            height: this.height - (pad + 6) * 2,
            fill: 'transparent',
            stroke: this.hexToRgba(theme.accent[0], 0.08),
            strokeWidth: 1,
            rx: cr - 4, ry: cr - 4,
            selectable: false
        }));
    }
    
    // ==========================================
    // Utility functions
    // ==========================================
    
    // Fix Arabic text direction for Fabric.js
    fixArabicText(text) {
        if (!text) return text;
        // Add Unicode RTL embedding marks for proper direction
        const RTL_EMBED = '\u202B'; // Right-to-Left Embedding
        const POP_DIR = '\u202C';   // Pop Directional Formatting
        // Check if text contains Arabic characters
        const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
        if (hasArabic) {
            return RTL_EMBED + text + POP_DIR;
        }
        return text;
    }
    
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
    
    lightenColor(hex, percent) {
        if (!hex || hex.charAt(0) !== '#') return hex;
        const num = parseInt(hex.slice(1), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min((num >> 16) + amt, 255);
        const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
        const B = Math.min((num & 0x0000FF) + amt, 255);
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
