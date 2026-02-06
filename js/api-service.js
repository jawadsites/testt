// ==================== 
// API Service - Backend Connection
// ==================== 

const API_BASE_URL = 'https://postmaker-ai-backend.onrender.com/api';

class APIService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }
    
    // ==================== 
    // Templates API
    // ==================== 
    
    async getAllTemplates() {
        try {
            const response = await fetch(`${this.baseURL}/templates`);
            const data = await response.json();
            
            if (data.success) {
                return data.templates;
            } else {
                throw new Error(data.message || 'Failed to fetch templates');
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            return [];
        }
    }
    
    async getTemplateById(id) {
        try {
            const response = await fetch(`${this.baseURL}/templates/${id}`);
            const data = await response.json();
            
            if (data.success) {
                return data.template;
            } else {
                throw new Error(data.message || 'Failed to fetch template');
            }
        } catch (error) {
            console.error('Error fetching template:', error);
            return null;
        }
    }
    
    async getTemplatesByCategory(category) {
        try {
            const templates = await this.getAllTemplates();
            return templates.filter(t => t.category === category);
        } catch (error) {
            console.error('Error filtering templates:', error);
            return [];
        }
    }
    
    // ==================== 
    // Helper Methods
    // ==================== 
    
    getImageUrl(imagePath) {
        if (!imagePath) return null;
        
        // If it's already a full URL, return it
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        // Otherwise, construct full URL
        return `https://postmaker-ai-backend.onrender.com${imagePath}`;
    }

    // ==================== 
    // AI Generation API
    // ==================== 

    async checkAIStatus() {
        try {
            const response = await fetch(`${this.baseURL}/ai/status`);
            return await response.json();
        } catch (error) {
            console.error('AI status check failed:', error);
            return { success: false, status: 'offline' };
        }
    }

    async generateAIBackground(category, style, customPrompt = null) {
        try {
            const body = { category, style, width: 1024, height: 1024 };
            if (customPrompt) body.customPrompt = customPrompt;

            const response = await fetch(`${this.baseURL}/ai/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return await response.json();
        } catch (error) {
            console.error('AI generation failed:', error);
            return { success: false, message: error.message };
        }
    }

    async smartGenerate(category, description) {
        try {
            const response = await fetch(`${this.baseURL}/ai/smart-generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, description, width: 1024, height: 1024 })
            });
            return await response.json();
        } catch (error) {
            console.error('Smart generation failed:', error);
            return { success: false, message: error.message };
        }
    }

    async generateMultipleStyles(category, styles) {
        try {
            const response = await fetch(`${this.baseURL}/ai/generate-multiple`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, styles, width: 1024, height: 1024 })
            });
            return await response.json();
        } catch (error) {
            console.error('Multiple generation failed:', error);
            return { success: false, message: error.message };
        }
    }
}

// Create global instance
const apiService = new APIService();

// Export for use in other files
window.apiService = apiService;
