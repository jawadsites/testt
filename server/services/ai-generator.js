// ====================
// AI Background Generator Service
// Flux 1.1 Pro via Replicate API (Best quality model)
// ====================

const Replicate = require('replicate');

class AIGenerator {
    constructor() {
        this.replicate = null;
        this.initialized = false;
        this.model = 'black-forest-labs/flux-1.1-pro';
        this.init();
    }

    init() {
        const token = process.env.REPLICATE_API_TOKEN;
        if (token) {
            this.replicate = new Replicate({ auth: token });
            this.initialized = true;
            console.log('✅ AI Generator initialized with Flux 1.1 Pro');
        } else {
            console.warn('⚠️ REPLICATE_API_TOKEN not set - AI features disabled');
        }
    }

    /**
     * Extract URL from Replicate output (handles various formats)
     */
    extractUrl(output) {
        // Flux 1.1 Pro returns a single URL string or ReadableStream
        if (typeof output === 'string') {
            return output;
        }
        // Array of URLs
        if (Array.isArray(output) && output.length > 0) {
            return typeof output[0] === 'string' ? output[0] : output[0].url || output[0];
        }
        // Object with url property
        if (output && output.url) {
            return output.url;
        }
        // FileOutput object (newer Replicate SDK)
        if (output && typeof output.toString === 'function') {
            const str = output.toString();
            if (str.startsWith('http')) return str;
        }
        throw new Error('Unexpected output format from Replicate');
    }

    /**
     * Generate professional background without text
     */
    async generateBackground(category = 'general', style = 'modern', options = {}) {
        if (!this.initialized) {
            throw new Error('AI Generator not initialized. Set REPLICATE_API_TOKEN.');
        }

        const prompt = this.buildPrompt(category, style, options);

        try {
            console.log(`🎨 Generating AI background [Flux 1.1 Pro]: ${category}/${style}`);
            const startTime = Date.now();

            const output = await this.replicate.run(
                this.model,
                {
                    input: {
                        prompt: prompt,
                        aspect_ratio: this.getAspectRatio(options.width, options.height),
                        output_format: "png",
                        output_quality: 90,
                        safety_tolerance: 2,
                        prompt_upsampling: true
                    }
                }
            );

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            const url = this.extractUrl(output);
            console.log(`✅ AI background generated in ${elapsed}s → ${url.substring(0, 60)}...`);
            return url;

        } catch (error) {
            console.error('❌ AI Generation Error:', error.message);
            throw error;
        }
    }

    /**
     * Generate multiple backgrounds (sequential for Flux)
     */
    async generateMultiple(category, style, count = 3) {
        if (!this.initialized) {
            throw new Error('AI Generator not initialized');
        }

        const results = [];
        const actualCount = Math.min(count, 3);

        for (let i = 0; i < actualCount; i++) {
            try {
                const url = await this.generateBackground(category, style);
                results.push(url);
            } catch (err) {
                console.error(`Failed to generate image ${i + 1}:`, err.message);
            }
        }

        if (results.length === 0) {
            throw new Error('All generation attempts failed');
        }

        return results;
    }

    /**
     * Get aspect ratio string from dimensions
     */
    getAspectRatio(width, height) {
        if (!width || !height) return '1:1';
        const ratio = width / height;
        if (ratio > 1.7) return '16:9';
        if (ratio > 1.4) return '3:2';
        if (ratio > 1.1) return '4:3';
        if (ratio < 0.6) return '9:16';
        if (ratio < 0.75) return '2:3';
        if (ratio < 0.9) return '3:4';
        return '1:1';
    }

    /**
     * Build optimized prompt for Flux 1.1 Pro
     * Flux doesn't use negative prompts - everything goes in the main prompt
     * Now includes product name and description for relevant backgrounds
     */
    buildPrompt(category, style = 'modern', options = {}) {
        const suffix = '. Absolutely no text, no letters, no words, no numbers, no writing, no watermarks, no logos. Ultra high quality photograph, 4K detailed.';

        // User custom prompt
        if (options.customPrompt) {
            return `${options.customPrompt}. Professional poster background design${suffix}`;
        }

        // Build product-specific context if available
        let productContext = '';
        if (options.productName || options.description) {
            const name = options.productName || '';
            const desc = options.description || '';
            
            // Translate common Arabic product types to English for better AI understanding
            const productHints = this.extractProductHints(name, desc, category);
            if (productHints) {
                productContext = ` featuring ${productHints},`;
            }
        }

        const prompts = {
            restaurant: {
                modern: `Luxurious restaurant promotional poster background${productContext} elegant food photography lighting from above, warm amber and deep burgundy rich gradient. Premium fine dining atmosphere with soft golden bokeh lights. Smooth professional commercial design with rich warm textures${suffix}`,
                classic: `Classic fine dining restaurant background${productContext} traditional ornamental gold patterns, warm candlelight glow, vintage mahogany wood textures. Luxurious table setting atmosphere with old world European charm${suffix}`,
                luxury: `Ultra luxury 5-star restaurant interior background${productContext} black marble surfaces with golden veins, crystal chandelier creating beautiful bokeh. Premium VIP dining atmosphere, dark and sophisticated${suffix}`,
                colorful: `Vibrant festive restaurant celebration background${productContext} warm red, orange, and gold gradient swirls. Festive food festival atmosphere with confetti bokeh lights. Joyful and energetic${suffix}`,
                minimal: `Minimalist clean restaurant background${productContext} soft neutral cream and beige gradient, elegant simplicity with lots of negative space. Clean modern Scandinavian design${suffix}`
            },
            cafe: {
                modern: `Modern artisan coffee shop background${productContext} rich warm brown earth tones, latte art cream swirls, cozy warm lighting. Professional barista atmosphere with beautiful coffee bean textures and steam wisps${suffix}`,
                classic: `Vintage European cafe ambiance${productContext} aged rustic wood textures, warm sepia tones, classic Parisian coffeehouse atmosphere with golden candlelight${suffix}`,
                luxury: `Premium luxury coffee lounge${productContext} dark mocha and gold color scheme, elegant marble counter, sophisticated upscale coffeehouse atmosphere${suffix}`,
                colorful: `Trendy colorful cafe background${productContext} pastel pink and mint green gradient, fun modern Instagram-worthy coffeeshop aesthetic, bright and cheerful${suffix}`,
                minimal: `Minimalist Scandinavian coffee shop${productContext} clean white walls, light natural wood tones, simple elegant design with peaceful natural light${suffix}`
            },
            supermarket: {
                modern: `Fresh modern supermarket promotional background${productContext} vibrant green and orange gradient, fresh organic produce colors. Healthy lifestyle aesthetic, clean professional design${suffix}`,
                classic: `Traditional farmers market background${productContext} warm earthy tones, fresh colorful fruits and vegetables palette. Natural wooden crate textures, wholesome market atmosphere${suffix}`,
                luxury: `Premium gourmet delicatessen background${productContext} elegant dark green and gold scheme, exclusive upscale grocery atmosphere with premium quality feeling${suffix}`,
                colorful: `Vibrant colorful supermarket mega sale background${productContext} rainbow of fresh produce colors, festive bright gradients, exciting energetic shopping celebration${suffix}`,
                minimal: `Clean modern organic grocery background${productContext} fresh white and green minimal design, clean healthy aesthetic, natural feeling${suffix}`
            },
            shop: {
                modern: `Modern retail boutique promotional background${productContext} sophisticated purple and magenta gradient atmosphere. Premium shopping experience with elegant lighting${suffix}`,
                classic: `Classic elegant retail shop background${productContext} rich warm wood and brass fixtures, timeless shopping atmosphere, premium leather and fabric textures${suffix}`,
                luxury: `Luxury brand flagship store background${productContext} premium black velvet with gold accent lighting, exclusive VIP shopping atmosphere, high-end retail${suffix}`,
                colorful: `Exciting colorful retail sale event background${productContext} vibrant pink and yellow gradients, festive shopping celebration with confetti and sparkles${suffix}`,
                minimal: `Minimalist clean modern store background${productContext} elegant white space with subtle shadows, contemporary retail simplicity${suffix}`
            },
            fashion: {
                modern: `High fashion editorial photoshoot background${productContext} sleek dramatic lighting on dark backdrop, runway spotlight creating beautiful bokeh. Glamorous fashion week atmosphere${suffix}`,
                classic: `Classic haute couture fashion background${productContext} elegant ivory satin fabric texture, timeless vintage Vogue-style sophisticated atmosphere${suffix}`,
                luxury: `Ultra luxury fashion house background${productContext} rich black leather texture with gold detailing, premium designer brand aesthetic, diamond-like sparkle accents${suffix}`,
                colorful: `Bold trendy fashion pop art background${productContext} vibrant neon gradients, energetic streetwear aesthetic, youthful modern fashion statement${suffix}`,
                minimal: `Minimalist fashion studio background${productContext} clean white professional lighting, subtle gray gradient, elegant negative space for editorial look${suffix}`
            },
            beauty: {
                modern: `Modern beauty salon background${productContext} soft rose pink and gold gradient, luxurious cosmetics aesthetic. Elegant spa atmosphere with pearl-like iridescent lights${suffix}`,
                classic: `Vintage beauty parlor background${productContext} rose and cream palette, elegant floral patterns, sophisticated timeless feminine aesthetic${suffix}`,
                luxury: `Luxury premium spa background${productContext} black marble with rose gold accents, premium cosmetic brand aesthetic, exclusive treatment atmosphere${suffix}`,
                colorful: `Trendy colorful beauty background${productContext} holographic rainbow shimmer gradient, modern Gen-Z beauty aesthetic, playful iridescent effects${suffix}`,
                minimal: `Minimalist natural beauty background${productContext} clean soft pink and white, organic skincare aesthetic, zen spa peaceful simplicity${suffix}`
            },
            services: {
                modern: `Professional corporate business background${productContext} clean blue and white gradient, modern trustworthy design. Subtle geometric patterns, professional commercial atmosphere${suffix}`,
                classic: `Classic professional services background${productContext} navy blue and gold color scheme, corporate excellence with traditional business trust design${suffix}`,
                luxury: `Premium executive consulting background${productContext} dark navy with golden accents, sophisticated VIP boardroom atmosphere, high-end professional${suffix}`,
                colorful: `Modern tech startup background${productContext} vibrant blue and purple gradient, innovative creative energy, dynamic professional design${suffix}`,
                minimal: `Minimalist business services background${productContext} clean white and light blue, professional simplicity, modern corporate zen design${suffix}`
            },
            online: {
                modern: `Modern e-commerce background${productContext} vibrant orange and warm gradient, digital shopping aesthetic. Tech-inspired with subtle glowing UI elements${suffix}`,
                classic: `Classic trusted online store background${productContext} warm amber and brown traditional e-commerce aesthetic, professional reliable shopping platform${suffix}`,
                luxury: `Luxury online boutique background${productContext} premium black and gold digital shopping aesthetic, exclusive VIP online experience${suffix}`,
                colorful: `Exciting mega online sale background${productContext} rainbow gradient with confetti, festive digital shopping celebration, energetic and vibrant${suffix}`,
                minimal: `Minimalist clean e-commerce background${productContext} white space modern design, simple elegant online store aesthetic${suffix}`
            },
            general: {
                modern: `Professional versatile poster background${productContext} elegant purple and blue smooth gradient, modern sophisticated design. Premium commercial backdrop with smooth transitions${suffix}`,
                classic: `Timeless universal poster background${productContext} warm neutral elegant tones gradient, professional traditional aesthetic, premium quality${suffix}`,
                luxury: `Premium luxury poster background${productContext} black and gold elegant design, exclusive sophisticated atmosphere with diamond sparkle accents${suffix}`,
                colorful: `Vibrant celebratory poster background${productContext} festive rainbow gradient, joyful energetic atmosphere with confetti and sparkles${suffix}`,
                minimal: `Minimalist clean poster background${productContext} elegant white and soft gray gradient, modern simplicity with professional negative space${suffix}`
            }
        };

        const catPrompts = prompts[category] || prompts.general;
        return catPrompts[style] || catPrompts.modern;
    }

    /**
     * Extract product hints from Arabic text to English for AI
     */
    extractProductHints(productName, description, category) {
        const text = `${productName} ${description}`.toLowerCase();
        const hints = [];

        // Food items (restaurant/cafe)
        const foodMap = {
            'بيتزا': 'delicious pizza',
            'برجر|برغر|همبرغر|همبرجر|بيرغر|بيرجر': 'gourmet burger',
            'شاورما': 'shawarma wrap',
            'كباب': 'grilled kebab',
            'مشاوي': 'grilled meats',
            'ستيك': 'premium steak',
            'دجاج': 'chicken dish',
            'سمك|أسماك': 'fresh fish seafood',
            'سوشي': 'sushi platter',
            'باستا|معكرونة': 'pasta dish',
            'سلطة': 'fresh salad',
            'شوربة|حساء': 'warm soup',
            'فطور|إفطار': 'breakfast spread',
            'حلويات|حلى|كيك|تورتة': 'delicious desserts',
            'آيس كريم|ايسكريم|مثلجات': 'ice cream',
            'قهوة|كابتشينو|لاتيه|اسبريسو': 'artisan coffee',
            'شاي': 'premium tea',
            'عصير|سموذي': 'fresh juice smoothie',
            'ساندويش': 'gourmet sandwich',
            'فلافل': 'falafel',
            'حمص': 'hummus',
            'منسف': 'traditional mansaf',
            'كبسة|مندي|مظبي': 'arabic rice dish',
            'فتة': 'fatteh dish',
            'كنافة': 'kunafa dessert',
            'بقلاوة': 'baklava sweets'
        };

        // Fashion/clothing items
        const fashionMap = {
            'فستان': 'elegant dress',
            'عباية': 'luxurious abaya',
            'ثوب': 'traditional thobe',
            'قميص': 'stylish shirt',
            'بنطلون|بنطال': 'trousers pants',
            'جاكيت': 'jacket coat',
            'حذاء|أحذية': 'fashionable shoes',
            'حقيبة|شنطة': 'designer handbag',
            'ساعة|ساعات': 'luxury watch',
            'نظارة|نظارات': 'stylish eyewear',
            'مجوهرات|ذهب|خاتم': 'fine jewelry gold',
            'عطر|بخور': 'luxury perfume fragrance'
        };

        // Beauty items
        const beautyMap = {
            'مكياج|ميكب': 'makeup cosmetics',
            'كريم|مرطب': 'skincare cream',
            'شامبو': 'hair shampoo',
            'صبغة|صبغ': 'hair color dye',
            'أظافر': 'nail art manicure',
            'بشرة': 'skincare treatment',
            'شعر': 'hair styling',
            'عناية': 'beauty care products'
        };

        // Electronics/tech
        const techMap = {
            'موبايل|جوال|هاتف|آيفون|سامسونج': 'smartphone mobile phone',
            'لابتوب|حاسوب|كمبيوتر': 'laptop computer',
            'تلفزيون|شاشة': 'TV screen display',
            'سماعة|سماعات|ايربودز': 'headphones earbuds',
            'كاميرا': 'camera photography',
            'ألعاب|بلايستيشن|اكسبوكس': 'gaming console'
        };

        // Choose map based on category
        let maps = [foodMap];
        if (category === 'fashion') maps = [fashionMap];
        else if (category === 'beauty') maps = [beautyMap];
        else if (category === 'shop' || category === 'online') maps = [techMap, fashionMap, beautyMap];
        else if (category === 'restaurant' || category === 'cafe') maps = [foodMap];
        else maps = [foodMap, fashionMap, beautyMap, techMap];

        for (const map of maps) {
            for (const [pattern, hint] of Object.entries(map)) {
                const regex = new RegExp(pattern, 'i');
                if (regex.test(text)) {
                    hints.push(hint);
                    if (hints.length >= 2) break;
                }
            }
            if (hints.length >= 2) break;
        }

        return hints.length > 0 ? hints.join(' and ') : '';
    }

    getAvailableStyles() {
        return ['modern', 'classic', 'luxury', 'colorful', 'minimal'];
    }

    getAvailableCategories() {
        return ['restaurant', 'cafe', 'supermarket', 'shop', 'fashion', 'beauty', 'services', 'online', 'general'];
    }

    isReady() {
        return this.initialized;
    }
}

module.exports = new AIGenerator();
