const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const axios = require('axios');
const { verifyAdmin } = require('./auth');

const TEMPLATES_FILE = path.join(__dirname, '..', 'data', 'templates.json');

// Upload to ImgBB (Free, works globally)
const uploadToImgBB = async (imageBuffer, filename) => {
    try {
        const formData = new URLSearchParams();
        formData.append('image', imageBuffer.toString('base64'));
        formData.append('name', filename);
        
        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
        
        return response.data.data.url;
    } catch (error) {
        console.error('ImgBB upload failed:', error.message);
        throw error;
    }
};

// Fallback: Store as base64 in JSON (for small images)
const storeImageAsBase64 = (imageBuffer, mimetype) => {
    const base64String = imageBuffer.toString('base64');
    return `data:${mimetype};base64,${base64String}`;
};

// Multi-strategy image upload with fallback
const uploadImageWithFallback = async (file) => {
    // Strategy 1: Try ImgBB if API key exists
    if (process.env.IMGBB_API_KEY) {
        try {
            console.log('📤 Uploading to ImgBB...');
            const url = await uploadToImgBB(file.buffer, file.originalname);
            console.log('✅ ImgBB upload successful');
            return url;
        } catch (error) {
            console.warn('❌ ImgBB failed, using fallback...');
        }
    }
    
    // Strategy 2: Base64 fallback (always works)
    console.log('💾 Using base64 fallback storage');
    return storeImageAsBase64(file.buffer, file.mimetype);
};

// Configure multer for memory storage (since we'll upload to external service)
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('يُسمح فقط بملفات الصور'));
        }
    }
});

// Helper functions
const readTemplates = () => {
    try {
        const data = fs.readFileSync(TEMPLATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeTemplates = (templates) => {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2));
};

// Get all templates (public)
router.get('/', (req, res) => {
    try {
        const templates = readTemplates();
        res.json({ 
            success: true, 
            templates 
        });
    } catch (error) {
        console.error('Error reading templates:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في قراءة القوالب' 
        });
    }
});

// Get single template by ID (public)
router.get('/:id', (req, res) => {
    try {
        const templates = readTemplates();
        const template = templates.find(t => t.id === req.params.id);
        
        if (!template) {
            return res.status(404).json({ 
                success: false, 
                message: 'القالب غير موجود' 
            });
        }
        
        res.json({ 
            success: true, 
            template 
        });
    } catch (error) {
        console.error('Error reading template:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في قراءة القالب' 
        });
    }
});

// Create new template (admin only)
router.post('/', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const templates = readTemplates();
        const { name, category, description } = req.body;
        
        if (!name || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'الاسم والفئة مطلوبان'
            });
        }
        
        // Upload image with fallback strategy
        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadImageWithFallback(req.file);
        }
        
        const newTemplate = {
            id: Date.now().toString(),
            name,
            category,
            description: description || '',
            image: imageUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        templates.push(newTemplate);
        writeTemplates(templates);
        
        res.status(201).json({ 
            success: true, 
            template: newTemplate,
            message: 'تم إضافة القالب بنجاح' 
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في إضافة القالب' 
        });
    }
});

// Update template (admin only)
router.put('/:id', verifyAdmin, upload.single('image'), async (req, res) => {
    try {
        const templates = readTemplates();
        const index = templates.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'القالب غير موجود' 
            });
        }
        
        const { name, category, description } = req.body;
        
        // Upload new image if provided
        let imageUrl = templates[index].image;
        if (req.file) {
            imageUrl = await uploadImageWithFallback(req.file);
        }
        
        templates[index] = {
            ...templates[index],
            name: name || templates[index].name,
            category: category || templates[index].category,
            description: description !== undefined ? description : templates[index].description,
            image: imageUrl,
            updatedAt: new Date().toISOString()
        };
        
        writeTemplates(templates);
        
        res.json({ 
            success: true, 
            template: templates[index],
            message: 'تم تحديث القالب بنجاح' 
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في تحديث القالب' 
        });
    }
});

// Delete template (admin only)
router.delete('/:id', verifyAdmin, (req, res) => {
    try {
        const templates = readTemplates();
        const index = templates.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ 
                success: false, 
                message: 'القالب غير موجود' 
            });
        }
        
        // Delete image file if exists
        const template = templates[index];
        if (template.image) {
            const imagePath = path.join(__dirname, '..', template.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        templates.splice(index, 1);
        writeTemplates(templates);
        
        res.json({ 
            success: true, 
            message: 'تم حذف القالب بنجاح' 
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في حذف القالب' 
        });
    }
});

module.exports = router;
