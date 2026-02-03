const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { verifyAdmin } = require('./auth');

const TEMPLATES_FILE = path.join(__dirname, '..', 'data', 'templates.json');

// Cloudinary configuration
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary if credentials are available
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

// Configure multer storage based on environment
const storage = useCloudinary 
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'poster-templates',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1200, height: 1200, crop: 'limit' }]
        }
    })
    : multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '..', 'uploads');
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

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
router.post('/', verifyAdmin, upload.single('image'), (req, res) => {
    try {
        const templates = readTemplates();
        const { name, category, description } = req.body;
        
        if (!name || !category) {
            return res.status(400).json({ 
                success: false, 
                message: 'الاسم والفئة مطلوبان' 
            });
        }
        
        // Get image URL based on storage type
        let imageUrl = null;
        if (req.file) {
            imageUrl = useCloudinary 
                ? req.file.path  // Cloudinary URL
                : `/uploads/${req.file.filename}`;  // Local path
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
router.put('/:id', verifyAdmin, upload.single('image'), (req, res) => {
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
        
        // Get image URL based on storage type
        let imageUrl = templates[index].image;
        if (req.file) {
            imageUrl = useCloudinary 
                ? req.file.path  // Cloudinary URL
                : `/uploads/${req.file.filename}`;  // Local path
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
