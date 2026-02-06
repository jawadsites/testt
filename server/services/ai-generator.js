// ====================
// AI Background Generator Service
// Stable Diffusion XL via Replicate API
// ====================

const Replicate = require('replicate');

class AIGenerator {
    constructor() {
        this.replicate = null;
        this.initialized = false;
        this.init();
    }

    init() {
        const token = process.env.REPLICATE_API_TOKEN;
        if (token) {
            this.replicate = new Replicate({ auth: token });
            this.initialized = true;
            console.log('✅ AI Generator initialized with Replicate API');
        } else {
            console.warn('⚠️ REPLICATE_API_TOKEN not set - AI features disabled');
        }
    }

    /**
     * Generate professional background without text
     * @param {string} category - Business category
     * @param {string} style - Design style
     * @param {object} options - Additional options
     * @returns {string} URL of generated image
     */
    async generateBackground(category = 'general', style = 'modern', options = {}) {
        if (!this.initialized) {
            throw new Error('AI Generator not initialized. Set REPLICATE_API_TOKEN.');
        }

        const prompt = this.buildPrompt(category, style, options);

        try {
            console.log(`🎨 Generating AI background: ${category}/${style}`);
            const startTime = Date.now();

            const output = await this.replicate.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                {
                    input: {
                        prompt: prompt.positive,
                        negative_prompt: prompt.negative,
                        width: options.width || 1024,
                        height: options.height || 1024,
                        num_outputs: 1,
                        scheduler: "K_EULER",
                        num_inference_steps: 30,
                        guidance_scale: 7.5,
                        prompt_strength: 0.8,
                        refine: "expert_ensemble_refiner",
                        high_noise_frac: 0.8
                    }
                }
            );

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ AI background generated in ${elapsed}s`);

            // Replicate returns array of URLs
            if (Array.isArray(output) && output.length > 0) {
                return output[0];
            }
            
            // Sometimes returns ReadableStream or string
            if (typeof output === 'string') {
                return output;
            }

            throw new Error('Unexpected output format from Replicate');

        } catch (error) {
            console.error('❌ AI Generation Error:', error.message);
            throw error;
        }
    }

    /**
     * Generate multiple backgrounds for selection
     */
    async generateMultiple(category, style, count = 4) {
        if (!this.initialized) {
            throw new Error('AI Generator not initialized');
        }

        const prompt = this.buildPrompt(category, style);

        try {
            const output = await this.replicate.run(
                "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
                {
                    input: {
                        prompt: prompt.positive,
                        negative_prompt: prompt.negative,
                        width: 1024,
                        height: 1024,
                        num_outputs: Math.min(count, 4),
                        scheduler: "K_EULER",
                        num_inference_steps: 25,
                        guidance_scale: 7.5,
                        refine: "expert_ensemble_refiner",
                        high_noise_frac: 0.8
                    }
                }
            );

            return Array.isArray(output) ? output : [output];
        } catch (error) {
            console.error('❌ Multi-generation Error:', error.message);
            throw error;
        }
    }

    /**
     * Build optimized prompt based on category and style
     */
    buildPrompt(category, style = 'modern', options = {}) {
        const baseNegative = "text, words, letters, numbers, watermark, logo, signature, writing, alphabet, arabic text, english text, chinese text, font, typography, label, caption, title, subtitle, heading, paragraph, sentence, character, symbol, sign, banner text, blurry, low quality, ugly, distorted, deformed";

        const categoryPrompts = {
            restaurant: {
                modern: {
                    positive: "luxurious restaurant poster background, elegant food photography lighting, warm amber and deep burgundy gradient, premium dining atmosphere, soft bokeh lights, golden hour warm tones, professional commercial design, smooth gradient transitions, rich textures, 4k ultra detailed, masterpiece quality",
                    negative: baseNegative + ", cold colors, industrial, cheap"
                },
                classic: {
                    positive: "classic fine dining ambiance background, traditional ornamental patterns, warm candlelight glow, vintage elegant textures, mahogany and gold color scheme, luxurious tablecloth fabric texture, old world charm atmosphere, premium quality, 4k detailed",
                    negative: baseNegative + ", modern, minimalist, neon"
                },
                luxury: {
                    positive: "ultra luxury restaurant interior background, golden marble textures, crystal chandelier bokeh lights, premium black and gold color scheme, sophisticated VIP dining atmosphere, velvet textures, premium commercial backdrop, 4k masterpiece",
                    negative: baseNegative + ", casual, cheap, simple, bright"
                },
                colorful: {
                    positive: "vibrant colorful food festival background, festive warm colors, red yellow orange gradient swirls, celebration atmosphere, confetti bokeh, joyful energetic design, professional poster backdrop, 4k quality",
                    negative: baseNegative + ", dark, gloomy, monochrome"
                },
                minimal: {
                    positive: "minimalist clean restaurant background, soft neutral tones, subtle gradient beige to cream, elegant simplicity, negative space, professional modern design, smooth clean backdrop, premium quality, 4k",
                    negative: baseNegative + ", cluttered, busy, complex, ornate"
                }
            },
            cafe: {
                modern: {
                    positive: "modern artisan coffee shop background, warm brown earth tones gradient, coffee bean textures, steam wisps, cozy warm lighting, latte art aesthetic, professional barista atmosphere, bokeh cafe lights, 4k ultra detailed",
                    negative: baseNegative + ", cold, industrial, harsh"
                },
                classic: {
                    positive: "vintage European cafe ambiance background, aged wood textures, warm sepia tones, classic coffeehouse atmosphere, rustic charm, antique feeling, warm golden light, 4k quality",
                    negative: baseNegative + ", modern, neon, plastic"
                },
                luxury: {
                    positive: "luxury premium coffee lounge background, dark mocha and gold color scheme, elegant marble counter texture, sophisticated coffeehouse atmosphere, premium beans aesthetic, 4k masterpiece",
                    negative: baseNegative + ", cheap, casual, bright colors"
                },
                colorful: {
                    positive: "colorful trendy cafe background, pastel pink and mint gradient, fun modern coffeeshop aesthetic, Instagram-worthy design, vibrant kawaii atmosphere, 4k quality",
                    negative: baseNegative + ", dark, gloomy, traditional"
                },
                minimal: {
                    positive: "minimalist Scandinavian cafe background, clean white and light wood tones, simple elegant design, natural light, zen simplicity, professional backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, ornate, dark"
                }
            },
            supermarket: {
                modern: {
                    positive: "fresh modern supermarket promotional background, vibrant green and orange gradient, fresh produce colors, healthy lifestyle aesthetic, clean professional design, organic natural feeling, 4k detailed",
                    negative: baseNegative + ", dark, gloomy, artificial"
                },
                classic: {
                    positive: "traditional market background, warm earthy colors, fresh vegetables and fruits color palette, farmers market atmosphere, natural wooden textures, wholesome feeling, 4k quality",
                    negative: baseNegative + ", modern, neon, industrial"
                },
                luxury: {
                    positive: "premium gourmet market background, elegant dark green and gold scheme, exclusive delicatessen aesthetic, upscale grocery atmosphere, premium quality feeling, 4k masterpiece",
                    negative: baseNegative + ", cheap, discount, bright"
                },
                colorful: {
                    positive: "vibrant colorful supermarket sale background, rainbow of fresh produce colors, festive bright gradients, exciting shopping atmosphere, energetic design, 4k quality",
                    negative: baseNegative + ", dull, monochrome, dark"
                },
                minimal: {
                    positive: "clean modern grocery background, fresh white and green minimal design, organic clean aesthetic, professional commercial backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, busy, dark"
                }
            },
            shop: {
                modern: {
                    positive: "modern retail store promotional background, sophisticated purple and magenta gradient, premium shopping aesthetic, luxury boutique atmosphere, professional commercial design, 4k ultra detailed",
                    negative: baseNegative + ", cheap, discount, cluttered"
                },
                classic: {
                    positive: "classic elegant shop background, traditional retail warmth, rich wood and brass aesthetic, timeless shopping experience, premium textures, 4k quality",
                    negative: baseNegative + ", modern, cold, industrial"
                },
                luxury: {
                    positive: "luxury brand flagship store background, premium black velvet texture, gold accent lighting, exclusive VIP shopping atmosphere, high-end retail backdrop, 4k masterpiece",
                    negative: baseNegative + ", cheap, common, bright"
                },
                colorful: {
                    positive: "colorful exciting retail sale background, vibrant pink and yellow gradient, shopping celebration atmosphere, festive confetti, energetic commercial design, 4k quality",
                    negative: baseNegative + ", dark, gloomy, boring"
                },
                minimal: {
                    positive: "minimalist clean store background, elegant white space, subtle shadows, modern retail simplicity, professional backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, ornate, busy"
                }
            },
            fashion: {
                modern: {
                    positive: "high fashion editorial background, sleek black with dramatic lighting, runway spotlight bokeh, fashion week atmosphere, premium editorial aesthetic, glamorous modern design, 4k ultra detailed",
                    negative: baseNegative + ", casual, cheap, colorful"
                },
                classic: {
                    positive: "classic haute couture background, elegant ivory satin fabric texture, timeless fashion aesthetic, vintage Vogue atmosphere, refined luxurious backdrop, 4k quality",
                    negative: baseNegative + ", modern, neon, casual"
                },
                luxury: {
                    positive: "ultra luxury fashion house background, black leather and gold detailing, premium designer brand aesthetic, exclusive VIP collection atmosphere, diamond-like sparkles, 4k masterpiece",
                    negative: baseNegative + ", everyday, cheap, discount"
                },
                colorful: {
                    positive: "vibrant fashion pop art background, bold neon colors gradient, trendy streetwear aesthetic, energetic youthful design, modern fashion statement, 4k quality",
                    negative: baseNegative + ", dull, traditional, boring"
                },
                minimal: {
                    positive: "minimalist fashion editorial background, clean white studio lighting, subtle gray gradient, elegant negative space, professional model backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, ornate, busy"
                }
            },
            beauty: {
                modern: {
                    positive: "modern beauty salon background, soft rose pink and gold gradient, luxurious cosmetics aesthetic, elegant spa atmosphere, premium skincare design, pearl-like bokeh lights, 4k ultra detailed",
                    negative: baseNegative + ", masculine, industrial, harsh"
                },
                classic: {
                    positive: "classic beauty parlor background, vintage rose and cream palette, elegant floral patterns, sophisticated feminine aesthetic, timeless beauty atmosphere, 4k quality",
                    negative: baseNegative + ", modern, neon, harsh"
                },
                luxury: {
                    positive: "luxury spa and beauty background, black marble with rose gold accents, premium cosmetic brand aesthetic, exclusive beauty treatment atmosphere, crystal clear elegant, 4k masterpiece",
                    negative: baseNegative + ", cheap, casual, bright"
                },
                colorful: {
                    positive: "colorful trendy beauty background, holographic rainbow gradient, modern Gen-Z beauty aesthetic, playful cosmetics design, iridescent shimmer effects, 4k quality",
                    negative: baseNegative + ", dark, dull, traditional"
                },
                minimal: {
                    positive: "minimalist beauty background, clean soft pink and white, natural skincare aesthetic, zen spa simplicity, professional beauty backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, dark, ornate"
                }
            },
            services: {
                modern: {
                    positive: "professional corporate services background, clean blue and white gradient, modern business aesthetic, trust-inspiring design, professional commercial backdrop, geometric subtle patterns, 4k ultra detailed",
                    negative: baseNegative + ", casual, playful, colorful"
                },
                classic: {
                    positive: "classic professional services background, navy blue and gold color scheme, corporate excellence atmosphere, traditional business trust design, premium textures, 4k quality",
                    negative: baseNegative + ", casual, modern, playful"
                },
                luxury: {
                    positive: "premium consulting services background, dark navy with golden accents, executive boardroom atmosphere, high-end professional aesthetic, sophisticated corporate design, 4k masterpiece",
                    negative: baseNegative + ", cheap, casual, bright"
                },
                colorful: {
                    positive: "modern tech services background, vibrant blue purple gradient, innovative startup aesthetic, creative professional design, dynamic energy, 4k quality",
                    negative: baseNegative + ", dull, traditional, boring"
                },
                minimal: {
                    positive: "minimalist business services background, clean white and light blue, professional simplicity, corporate zen design, modern office aesthetic, 4k quality",
                    negative: baseNegative + ", cluttered, ornate, dark"
                }
            },
            online: {
                modern: {
                    positive: "modern e-commerce background, vibrant orange and warm gradient, digital shopping aesthetic, online store professional design, tech-inspired backdrop, glowing elements, 4k ultra detailed",
                    negative: baseNegative + ", offline, traditional, cold"
                },
                classic: {
                    positive: "classic online shopping background, warm amber and brown traditional e-commerce aesthetic, trusted shopping platform design, premium online retail atmosphere, 4k quality",
                    negative: baseNegative + ", modern, neon, cold"
                },
                luxury: {
                    positive: "luxury online boutique background, premium black and gold e-commerce aesthetic, exclusive digital shopping atmosphere, VIP online experience, 4k masterpiece",
                    negative: baseNegative + ", cheap, discount, bright"
                },
                colorful: {
                    positive: "colorful exciting online sale background, rainbow gradient, mega sale atmosphere, festive digital shopping design, confetti celebration, 4k quality",
                    negative: baseNegative + ", dark, dull, boring"
                },
                minimal: {
                    positive: "minimalist clean e-commerce background, white space modern design, simple elegant online store aesthetic, professional digital backdrop, 4k quality",
                    negative: baseNegative + ", cluttered, busy, ornate"
                }
            },
            general: {
                modern: {
                    positive: "universal professional poster background, elegant purple and blue gradient, versatile modern design, premium commercial backdrop, smooth color transitions, sophisticated atmosphere, 4k ultra detailed masterpiece",
                    negative: baseNegative + ", specific, themed"
                },
                classic: {
                    positive: "classic universal poster background, timeless elegant design, warm neutral tones gradient, professional traditional aesthetic, premium quality backdrop, 4k quality",
                    negative: baseNegative + ", modern, neon, specific"
                },
                luxury: {
                    positive: "luxury premium poster background, black and gold elegant design, exclusive VIP atmosphere, sophisticated commercial backdrop, diamond sparkle accents, 4k masterpiece",
                    negative: baseNegative + ", cheap, casual, bright"
                },
                colorful: {
                    positive: "vibrant colorful poster background, festive rainbow gradient, celebration atmosphere, joyful energetic design, confetti and sparkles, 4k quality",
                    negative: baseNegative + ", dark, dull, monochrome"
                },
                minimal: {
                    positive: "minimalist clean poster background, elegant white and gray gradient, modern simplicity, professional negative space design, 4k quality",
                    negative: baseNegative + ", cluttered, ornate, busy, dark"
                }
            }
        };

        // Custom prompt from user
        if (options.customPrompt) {
            return {
                positive: options.customPrompt + ", professional poster background, no text, no letters, no words, 4k ultra detailed",
                negative: baseNegative
            };
        }

        const catPrompts = categoryPrompts[category] || categoryPrompts.general;
        const stylePrompts = catPrompts[style] || catPrompts.modern;

        return {
            positive: stylePrompts.positive,
            negative: stylePrompts.negative
        };
    }

    /**
     * Get available styles for a category
     */
    getAvailableStyles() {
        return ['modern', 'classic', 'luxury', 'colorful', 'minimal'];
    }

    /**
     * Get available categories
     */
    getAvailableCategories() {
        return ['restaurant', 'cafe', 'supermarket', 'shop', 'fashion', 'beauty', 'services', 'online', 'general'];
    }

    /**
     * Check if the service is ready
     */
    isReady() {
        return this.initialized;
    }
}

module.exports = new AIGenerator();
