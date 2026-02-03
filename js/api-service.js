// ==================== 
// API Service - Backend Connection
// ==================== 

const API_BASE_URL = 'http://localhost:3000/api';

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
        return `http://localhost:3000${imagePath}`;
    }
}

// Create global instance
const apiService = new APIService();

// Export for use in other files
window.apiService = apiService;
