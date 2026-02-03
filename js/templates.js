// ==================== 
// Template Definitions 
// ==================== 

const Templates = {
    // Restaurant Templates
    restaurant: [
        {
            id: 'rest-1',
            name: 'كلاسيك أنيق',
            colors: {
                primary: '#8B0000',
                secondary: '#FFD700',
                background: '#FFFEF5',
                text: '#2C2C2C'
            },
            layout: 'centered'
        },
        {
            id: 'rest-2',
            name: 'عصري حيوي',
            colors: {
                primary: '#FF6B35',
                secondary: '#F7C59F',
                background: '#FFFFFF',
                text: '#1A1A2E'
            },
            layout: 'split'
        },
        {
            id: 'rest-3',
            name: 'فاخر ذهبي',
            colors: {
                primary: '#1A1A2E',
                secondary: '#C9A227',
                background: '#0D0D0D',
                text: '#FFFFFF'
            },
            layout: 'minimal'
        },
        {
            id: 'rest-4',
            name: 'طازج وصحي',
            colors: {
                primary: '#2D5016',
                secondary: '#90BE6D',
                background: '#F8FFF0',
                text: '#1D3557'
            },
            layout: 'organic'
        },
        {
            id: 'rest-5',
            name: 'شرقي أصيل',
            colors: {
                primary: '#7B3F00',
                secondary: '#E8C39E',
                background: '#FFF8F0',
                text: '#3D2914'
            },
            layout: 'traditional'
        }
    ],
    
    // Cafe Templates
    cafe: [
        {
            id: 'cafe-1',
            name: 'قهوة دافئة',
            colors: {
                primary: '#6F4E37',
                secondary: '#D4A574',
                background: '#FFF9F0',
                text: '#2C1810'
            },
            layout: 'cozy'
        },
        {
            id: 'cafe-2',
            name: 'مودرن بسيط',
            colors: {
                primary: '#1A1A1A',
                secondary: '#F5F5F5',
                background: '#FFFFFF',
                text: '#333333'
            },
            layout: 'minimal'
        },
        {
            id: 'cafe-3',
            name: 'باستيل ناعم',
            colors: {
                primary: '#D4A5A5',
                secondary: '#FFE5E5',
                background: '#FFF5F5',
                text: '#5C4033'
            },
            layout: 'soft'
        },
        {
            id: 'cafe-4',
            name: 'خضرة منعشة',
            colors: {
                primary: '#2D6A4F',
                secondary: '#95D5B2',
                background: '#F0FFF4',
                text: '#1B4332'
            },
            layout: 'fresh'
        },
        {
            id: 'cafe-5',
            name: 'كريمي فاخر',
            colors: {
                primary: '#8B7355',
                secondary: '#F5DEB3',
                background: '#FFFEF8',
                text: '#3E2723'
            },
            layout: 'elegant'
        }
    ],
    
    // Supermarket Templates
    supermarket: [
        {
            id: 'super-1',
            name: 'عروض قوية',
            colors: {
                primary: '#E63946',
                secondary: '#FFE066',
                background: '#FFFFFF',
                text: '#1D3557'
            },
            layout: 'bold'
        },
        {
            id: 'super-2',
            name: 'توفير ذكي',
            colors: {
                primary: '#2196F3',
                secondary: '#FFC107',
                background: '#F5F5F5',
                text: '#212121'
            },
            layout: 'smart'
        },
        {
            id: 'super-3',
            name: 'طازج يومياً',
            colors: {
                primary: '#4CAF50',
                secondary: '#8BC34A',
                background: '#FFFFFF',
                text: '#1B5E20'
            },
            layout: 'fresh'
        },
        {
            id: 'super-4',
            name: 'أسعار مخفضة',
            colors: {
                primary: '#FF5722',
                secondary: '#FFEB3B',
                background: '#FFF3E0',
                text: '#E65100'
            },
            layout: 'discount'
        },
        {
            id: 'super-5',
            name: 'عائلي مميز',
            colors: {
                primary: '#9C27B0',
                secondary: '#E1BEE7',
                background: '#F3E5F5',
                text: '#4A148C'
            },
            layout: 'family'
        }
    ],
    
    // Online Shop Templates
    shop: [
        {
            id: 'shop-1',
            name: 'عصري أنيق',
            colors: {
                primary: '#8B5CF6',
                secondary: '#C4B5FD',
                background: '#FAFAFF',
                text: '#1E1B4B'
            },
            layout: 'modern'
        },
        {
            id: 'shop-2',
            name: 'بسيط نظيف',
            colors: {
                primary: '#0EA5E9',
                secondary: '#E0F2FE',
                background: '#FFFFFF',
                text: '#0C4A6E'
            },
            layout: 'clean'
        },
        {
            id: 'shop-3',
            name: 'فاشن راقي',
            colors: {
                primary: '#1A1A1A',
                secondary: '#F5F5F5',
                background: '#FFFFFF',
                text: '#000000'
            },
            layout: 'fashion'
        },
        {
            id: 'shop-4',
            name: 'نابض بالحياة',
            colors: {
                primary: '#EC4899',
                secondary: '#FBCFE8',
                background: '#FDF2F8',
                text: '#831843'
            },
            layout: 'vibrant'
        },
        {
            id: 'shop-5',
            name: 'طبيعي أخضر',
            colors: {
                primary: '#059669',
                secondary: '#A7F3D0',
                background: '#ECFDF5',
                text: '#064E3B'
            },
            layout: 'eco'
        }
    ],
    
    // Services Templates
    services: [
        {
            id: 'serv-1',
            name: 'احترافي',
            colors: {
                primary: '#1E40AF',
                secondary: '#DBEAFE',
                background: '#FFFFFF',
                text: '#1E3A8A'
            },
            layout: 'professional'
        },
        {
            id: 'serv-2',
            name: 'ودود مرحب',
            colors: {
                primary: '#7C3AED',
                secondary: '#EDE9FE',
                background: '#FAF5FF',
                text: '#5B21B6'
            },
            layout: 'friendly'
        },
        {
            id: 'serv-3',
            name: 'تقني حديث',
            colors: {
                primary: '#0891B2',
                secondary: '#CFFAFE',
                background: '#ECFEFF',
                text: '#164E63'
            },
            layout: 'tech'
        },
        {
            id: 'serv-4',
            name: 'موثوق آمن',
            colors: {
                primary: '#0F766E',
                secondary: '#99F6E4',
                background: '#F0FDFA',
                text: '#134E4A'
            },
            layout: 'trust'
        },
        {
            id: 'serv-5',
            name: 'إبداعي',
            colors: {
                primary: '#DB2777',
                secondary: '#FCE7F3',
                background: '#FDF2F8',
                text: '#9D174D'
            },
            layout: 'creative'
        }
    ],
    
    // General/Other Templates
    general: [
        {
            id: 'gen-1',
            name: 'متعدد الاستخدام',
            colors: {
                primary: '#6366F1',
                secondary: '#E0E7FF',
                background: '#FFFFFF',
                text: '#312E81'
            },
            layout: 'universal'
        },
        {
            id: 'gen-2',
            name: 'بسيط وأنيق',
            colors: {
                primary: '#374151',
                secondary: '#F3F4F6',
                background: '#FFFFFF',
                text: '#111827'
            },
            layout: 'simple'
        },
        {
            id: 'gen-3',
            name: 'ملون جذاب',
            colors: {
                primary: '#F59E0B',
                secondary: '#FEF3C7',
                background: '#FFFBEB',
                text: '#92400E'
            },
            layout: 'colorful'
        },
        {
            id: 'gen-4',
            name: 'داكن فاخر',
            colors: {
                primary: '#1F2937',
                secondary: '#D1D5DB',
                background: '#111827',
                text: '#F9FAFB'
            },
            layout: 'dark'
        },
        {
            id: 'gen-5',
            name: 'نابض مشرق',
            colors: {
                primary: '#EF4444',
                secondary: '#FEE2E2',
                background: '#FEF2F2',
                text: '#991B1B'
            },
            layout: 'bright'
        }
    ]
};

// Color Palettes for user selection
const ColorPalettes = [
    {
        id: 'palette-1',
        name: 'كلاسيكي',
        colors: ['#8B0000', '#FFD700', '#FFFFFF', '#2C2C2C']
    },
    {
        id: 'palette-2',
        name: 'عصري',
        colors: ['#8B5CF6', '#06B6D4', '#FFFFFF', '#1E1B4B']
    },
    {
        id: 'palette-3',
        name: 'طبيعي',
        colors: ['#2D5016', '#90BE6D', '#F8FFF0', '#1D3557']
    },
    {
        id: 'palette-4',
        name: 'دافئ',
        colors: ['#6F4E37', '#D4A574', '#FFF9F0', '#2C1810']
    },
    {
        id: 'palette-5',
        name: 'حيوي',
        colors: ['#E63946', '#FFE066', '#FFFFFF', '#1D3557']
    },
    {
        id: 'palette-6',
        name: 'أنيق',
        colors: ['#1A1A2E', '#C9A227', '#0D0D0D', '#FFFFFF']
    },
    {
        id: 'palette-7',
        name: 'ناعم',
        colors: ['#D4A5A5', '#FFE5E5', '#FFF5F5', '#5C4033']
    },
    {
        id: 'palette-8',
        name: 'احترافي',
        colors: ['#1E40AF', '#DBEAFE', '#FFFFFF', '#1E3A8A']
    }
];

// CTA Button texts
const CTATexts = [
    'اطلب الآن',
    'تواصل معنا',
    'احجز الآن',
    'اشترِ الآن',
    'تسوق الآن',
    'اكتشف المزيد',
    'استفد من العرض',
    'سارع بالطلب'
];

// Export for use in other files
window.Templates = Templates;
window.ColorPalettes = ColorPalettes;
window.CTATexts = CTATexts;
