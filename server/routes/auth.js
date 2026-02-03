const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret with fallback
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production-12345';

// Simple admin credentials (in production, use database)
const ADMIN = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login attempt:', { username, hasPassword: !!password });
        console.log('Expected credentials:', { username: ADMIN.username, password: ADMIN.password });
        console.log('JWT_SECRET exists:', !!JWT_SECRET);
        
        // Validate credentials
        if (username !== ADMIN.username || password !== ADMIN.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
            });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { username: ADMIN.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log('Login successful, token generated');
        
        res.json({
            success: true,
            token,
            message: 'تم تسجيل الدخول بنجاح'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في تسجيل الدخول: ' + error.message 
        });
    }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'لا يوجد توكن' 
            });
        }
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'توكن غير صالح' 
                });
            }
            
            res.json({ 
                success: true, 
                user: decoded 
            });
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في التحقق' 
        });
    }
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'غير مصرح' 
            });
        }
        
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'توكن غير صالح' 
                });
            }
            
            req.user = decoded;
            next();
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ في التحقق' 
        });
    }
};

module.exports = router;
module.exports.verifyAdmin = verifyAdmin;
