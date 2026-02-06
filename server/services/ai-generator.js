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
     */
    buildPrompt(category, style = 'modern', options = {}) {
        // User custom prompt
        if (options.customPrompt) {
            return `${options.customPrompt}. Professional poster background design, absolutely no text, no letters, no words, no writing, no watermarks. Ultra high quality, 4K detailed.`;
        }

        const suffix = '. Absolutely no text, no letters, no words, no numbers, no writing, no watermarks, no logos. Ultra high quality photograph, 4K detailed.';

        const prompts = {
            restaurant: {
                modern: `Luxurious restaurant promotional poster background. Elegant food photography lighting from above, warm amber and deep burgundy rich gradient. Premium fine dining atmosphere with soft golden bokeh lights. Smooth professional commercial design with rich warm textures${suffix}`,
                classic: `Classic fine dining restaurant background. Traditional ornamental gold patterns, warm candlelight glow, vintage mahogany wood textures. Luxurious table setting atmosphere with old world European charm${suffix}`,
                luxury: `Ultra luxury 5-star restaurant interior background. Black marble surfaces with golden veins, crystal chandelier creating beautiful bokeh. Premium VIP dining atmosphere, dark and sophisticated${suffix}`,
                colorful: `Vibrant festive restaurant celebration background. Warm red, orange, and gold gradient swirls. Festive food festival atmosphere with confetti bokeh lights. Joyful and energetic${suffix}`,
                minimal: `Minimalist clean restaurant background. Soft neutral cream and beige gradient, elegant simplicity with lots of negative space. Clean modern Scandinavian design${suffix}`
            },
            cafe: {
                modern: `Modern artisan coffee shop background. Rich warm brown earth tones, latte art cream swirls, cozy warm lighting. Professional barista atmosphere with beautiful coffee bean textures and steam wisps${suffix}`,
                classic: `Vintage European cafe ambiance. Aged rustic wood textures, warm sepia tones, classic Parisian coffeehouse atmosphere with golden candlelight${suffix}`,
                luxury: `Premium luxury coffee lounge. Dark mocha and gold color scheme, elegant marble counter, sophisticated upscale coffeehouse atmosphere${suffix}`,
                colorful: `Trendy colorful cafe background. Pastel pink and mint green gradient, fun modern Instagram-worthy coffeeshop aesthetic, bright and cheerful${suffix}`,
                minimal: `Minimalist Scandinavian coffee shop. Clean white walls, light natural wood tones, simple elegant design with peaceful natural light${suffix}`
            },
            supermarket: {
                modern: `Fresh modern supermarket promotional background. Vibrant green and orange gradient, fresh organic produce colors. Healthy lifestyle aesthetic, clean professional design${suffix}`,
                classic: `Traditional farmers market background. Warm earthy tones, fresh colorful fruits and vegetables palette. Natural wooden crate textures, wholesome market atmosphere${suffix}`,
                luxury: `Premium gourmet delicatessen background. Elegant dark green and gold scheme, exclusive upscale grocery atmosphere with premium quality feeling${suffix}`,
                colorful: `Vibrant colorful supermarket mega sale background. Rainbow of fresh produce colors, festive bright gradients, exciting energetic shopping celebration${suffix}`,
                minimal: `Clean modern organic grocery background. Fresh white and green minimal design, clean healthy aesthetic, natural feeling${suffix}`
            },
            shop: {
                modern: `Modern retail boutique promotional background. Sophisticated purple and magenta gradient atmosphere. Premium shopping experience with elegant lighting${suffix}`,
                classic: `Classic elegant retail shop background. Rich warm wood and brass fixtures, timeless shopping atmosphere, premium leather and fabric textures${suffix}`,
                luxury: `Luxury brand flagship store background. Premium black velvet with gold accent lighting, exclusive VIP shopping atmosphere, high-end retail${suffix}`,
                colorful: `Exciting colorful retail sale event background. Vibrant pink and yellow gradients, festive shopping celebration with confetti and sparkles${suffix}`,
                minimal: `Minimalist clean modern store background. Elegant white space with subtle shadows, contemporary retail simplicity${suffix}`
            },
            fashion: {
                modern: `High fashion editorial photoshoot background. Sleek dramatic lighting on dark backdrop, runway spotlight creating beautiful bokeh. Glamorous fashion week atmosphere${suffix}`,
                classic: `Classic haute couture fashion background. Elegant ivory satin fabric texture, timeless vintage Vogue-style sophisticated atmosphere${suffix}`,
                luxury: `Ultra luxury fashion house background. Rich black leather texture with gold detailing, premium designer brand aesthetic, diamond-like sparkle accents${suffix}`,
                colorful: `Bold trendy fashion pop art background. Vibrant neon gradients, energetic streetwear aesthetic, youthful modern fashion statement${suffix}`,
                minimal: `Minimalist fashion studio background. Clean white professional lighting, subtle gray gradient, elegant negative space for editorial look${suffix}`
            },
            beauty: {
                modern: `Modern beauty salon background. Soft rose pink and gold gradient, luxurious cosmetics aesthetic. Elegant spa atmosphere with pearl-like iridescent lights${suffix}`,
                classic: `Vintage beauty parlor background. Rose and cream palette, elegant floral patterns, sophisticated timeless feminine aesthetic${suffix}`,
                luxury: `Luxury premium spa background. Black marble with rose gold accents, premium cosmetic brand aesthetic, exclusive treatment atmosphere${suffix}`,
                colorful: `Trendy colorful beauty background. Holographic rainbow shimmer gradient, modern Gen-Z beauty aesthetic, playful iridescent effects${suffix}`,
                minimal: `Minimalist natural beauty background. Clean soft pink and white, organic skincare aesthetic, zen spa peaceful simplicity${suffix}`
            },
            services: {
                modern: `Professional corporate business background. Clean blue and white gradient, modern trustworthy design. Subtle geometric patterns, professional commercial atmosphere${suffix}`,
                classic: `Classic professional services background. Navy blue and gold color scheme, corporate excellence with traditional business trust design${suffix}`,
                luxury: `Premium executive consulting background. Dark navy with golden accents, sophisticated VIP boardroom atmosphere, high-end professional${suffix}`,
                colorful: `Modern tech startup background. Vibrant blue and purple gradient, innovative creative energy, dynamic professional design${suffix}`,
                minimal: `Minimalist business services background. Clean white and light blue, professional simplicity, modern corporate zen design${suffix}`
            },
            online: {
                modern: `Modern e-commerce background. Vibrant orange and warm gradient, digital shopping aesthetic. Tech-inspired with subtle glowing UI elements${suffix}`,
                classic: `Classic trusted online store background. Warm amber and brown traditional e-commerce aesthetic, professional reliable shopping platform${suffix}`,
                luxury: `Luxury online boutique background. Premium black and gold digital shopping aesthetic, exclusive VIP online experience${suffix}`,
                colorful: `Exciting mega online sale background. Rainbow gradient with confetti, festive digital shopping celebration, energetic and vibrant${suffix}`,
                minimal: `Minimalist clean e-commerce background. White space modern design, simple elegant online store aesthetic${suffix}`
            },
            general: {
                modern: `Professional versatile poster background. Elegant purple and blue smooth gradient, modern sophisticated design. Premium commercial backdrop with smooth transitions${suffix}`,
                classic: `Timeless universal poster background. Warm neutral elegant tones gradient, professional traditional aesthetic, premium quality${suffix}`,
                luxury: `Premium luxury poster background. Black and gold elegant design, exclusive sophisticated atmosphere with diamond sparkle accents${suffix}`,
                colorful: `Vibrant celebratory poster background. Festive rainbow gradient, joyful energetic atmosphere with confetti and sparkles${suffix}`,
                minimal: `Minimalist clean poster background. Elegant white and soft gray gradient, modern simplicity with professional negative space${suffix}`
            }
        };

        const catPrompts = prompts[category] || prompts.general;
        return catPrompts[style] || catPrompts.modern;
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
