// ====================
// AI Routes - Background Generation API
// ====================

const express = require('express');
const router = express.Router();
const aiGenerator = require('../services/ai-generator');

/**
 * GET /api/ai/status
 * Check AI service status
 */
router.get('/status', (req, res) => {
    res.json({
        success: true,
        ready: aiGenerator.isReady(),
        categories: aiGenerator.getAvailableCategories(),
        styles: aiGenerator.getAvailableStyles()
    });
});

/**
 * POST /api/ai/generate
 * Generate a single AI background
 * Body: { category, style, width, height, customPrompt }
 */
router.post('/generate', async (req, res) => {
    try {
        if (!aiGenerator.isReady()) {
            return res.status(503).json({
                success: false,
                message: 'خدمة AI غير متاحة حالياً. تأكد من إضافة REPLICATE_API_TOKEN.'
            });
        }

        const { category, style, width, height, customPrompt } = req.body;

        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'يجب تحديد الفئة (category)'
            });
        }

        const backgroundUrl = await aiGenerator.generateBackground(
            category,
            style || 'modern',
            { width, height, customPrompt }
        );

        res.json({
            success: true,
            backgroundUrl,
            category,
            style: style || 'modern',
            message: 'تم توليد الخلفية بنجاح'
        });

    } catch (error) {
        console.error('AI Generate Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'حدث خطأ في توليد الخلفية'
        });
    }
});

/**
 * POST /api/ai/generate-multiple
 * Generate multiple AI backgrounds for selection
 * Body: { category, style, count }
 */
router.post('/generate-multiple', async (req, res) => {
    try {
        if (!aiGenerator.isReady()) {
            return res.status(503).json({
                success: false,
                message: 'خدمة AI غير متاحة حالياً'
            });
        }

        const { category, style, count } = req.body;

        const backgrounds = await aiGenerator.generateMultiple(
            category || 'general',
            style || 'modern',
            Math.min(count || 4, 4)
        );

        res.json({
            success: true,
            backgrounds,
            count: backgrounds.length,
            message: `تم توليد ${backgrounds.length} خلفيات`
        });

    } catch (error) {
        console.error('AI Multi-Generate Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'حدث خطأ في توليد الخلفيات'
        });
    }
});

/**
 * POST /api/ai/smart-generate
 * Smart generation based on form data
 * Body: { data: { category, businessName, productName, offerText } }
 */
router.post('/smart-generate', async (req, res) => {
    try {
        if (!aiGenerator.isReady()) {
            return res.status(503).json({
                success: false,
                message: 'خدمة AI غير متاحة حالياً'
            });
        }

        const { data } = req.body;
        if (!data) {
            return res.status(400).json({
                success: false,
                message: 'يجب إرسال بيانات التصميم'
            });
        }

        // Smart style detection from data
        let style = 'modern';
        const text = `${data.businessName || ''} ${data.productName || ''} ${data.offerText || ''}`.toLowerCase();

        if (text.includes('فاخر') || text.includes('premium') || text.includes('vip') || text.includes('حصري')) {
            style = 'luxury';
        } else if (text.includes('تقليدي') || text.includes('أصيل') || text.includes('تراث')) {
            style = 'classic';
        } else if (text.includes('عرض') || text.includes('تخفيض') || text.includes('خصم') || text.includes('sale')) {
            style = 'colorful';
        } else if (text.includes('بسيط') || text.includes('نظيف') || text.includes('clean')) {
            style = 'minimal';
        }

        const backgroundUrl = await aiGenerator.generateBackground(
            data.category || 'general',
            style
        );

        res.json({
            success: true,
            backgroundUrl,
            detectedStyle: style,
            category: data.category || 'general',
            message: 'تم التوليد الذكي بنجاح'
        });

    } catch (error) {
        console.error('AI Smart Generate Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'حدث خطأ في التوليد الذكي'
        });
    }
});

module.exports = router;
