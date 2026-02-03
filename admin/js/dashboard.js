// ==================== 
// Admin Dashboard Handler
// ==================== 

const API_URL = 'http://localhost:3000/api';
let currentTemplateId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuth();
    
    // Load templates
    loadTemplates();
    
    // Event listeners
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    document.getElementById('addTemplateBtn')?.addEventListener('click', openAddModal);
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelBtn')?.addEventListener('click', closeModal);
    document.getElementById('templateForm')?.addEventListener('submit', handleTemplateSubmit);
    document.getElementById('templateImage')?.addEventListener('change', handleImagePreview);
    
    // Delete modal
    document.getElementById('closeDeleteModal')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDelete);
    
    // Close modal on outside click
    document.getElementById('templateModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'templateModal') closeModal();
    });
    document.getElementById('deleteModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'deleteModal') closeDeleteModal();
    });
});

async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (!data.success) {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('adminToken');
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.href = 'login.html';
}

async function loadTemplates() {
    try {
        const response = await fetch(`${API_URL}/templates`);
        const data = await response.json();
        
        if (data.success) {
            displayTemplates(data.templates);
        }
    } catch (error) {
        console.error('Error loading templates:', error);
        alert('حدث خطأ في تحميل القوالب');
    }
}

function displayTemplates(templates) {
    const grid = document.getElementById('templatesGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (templates.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    grid.innerHTML = templates.map(template => `
        <div class="template-card">
            <img 
                src="${template.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                alt="${template.name}" 
                class="template-image"
            >
            <div class="template-body">
                <div class="template-header">
                    <div>
                        <h3 class="template-name">${template.name}</h3>
                        <span class="template-category">${getCategoryName(template.category)}</span>
                    </div>
                </div>
                ${template.description ? `<p class="template-description">${template.description}</p>` : ''}
                <div class="template-actions">
                    <button class="btn-icon btn-edit" onclick="editTemplate('${template.id}')">
                        <i class="fas fa-edit"></i>
                        تعديل
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteTemplate('${template.id}')">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getCategoryName(category) {
    const categories = {
        restaurant: 'مطعم',
        cafe: 'كافيه',
        supermarket: 'سوبرماركت',
        shop: 'متجر',
        services: 'خدمات',
        beauty: 'تجميل',
        general: 'عام'
    };
    return categories[category] || category;
}

function openAddModal() {
    currentTemplateId = null;
    document.getElementById('modalTitle').textContent = 'إضافة قالب جديد';
    document.getElementById('templateForm').reset();
    document.getElementById('templateId').value = '';
    document.getElementById('imagePreview').innerHTML = `
        <button type="button" class="btn-upload" onclick="document.getElementById('templateImage').click()">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>اختر صورة</span>
        </button>
        <p class="upload-hint">PNG, JPG, GIF حتى 5MB</p>
    `;
    document.getElementById('templateModal').classList.add('active');
}

async function editTemplate(id) {
    try {
        const response = await fetch(`${API_URL}/templates/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const template = data.template;
            currentTemplateId = id;
            
            document.getElementById('modalTitle').textContent = 'تعديل القالب';
            document.getElementById('templateId').value = id;
            document.getElementById('templateName').value = template.name;
            document.getElementById('templateCategory').value = template.category;
            document.getElementById('templateDescription').value = template.description || '';
            
            if (template.image) {
                document.getElementById('imagePreview').innerHTML = `
                    <img src="${template.image}" alt="${template.name}">
                    <button type="button" class="btn-upload" onclick="document.getElementById('templateImage').click()">
                        <i class="fas fa-cloud-upload-alt"></i>
                        <span>تغيير الصورة</span>
                    </button>
                `;
            }
            
            document.getElementById('templateModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading template:', error);
        alert('حدث خطأ في تحميل القالب');
    }
}

function deleteTemplate(id) {
    currentTemplateId = id;
    document.getElementById('deleteModal').classList.add('active');
}

async function confirmDelete() {
    if (!currentTemplateId) return;
    
    const token = localStorage.getItem('adminToken');
    const btn = document.getElementById('confirmDeleteBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحذف...';
    
    try {
        const response = await fetch(`${API_URL}/templates/${currentTemplateId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDeleteModal();
            loadTemplates();
            alert('تم حذف القالب بنجاح');
        } else {
            alert(data.message || 'فشل حذف القالب');
        }
    } catch (error) {
        console.error('Error deleting template:', error);
        alert('حدث خطأ في حذف القالب');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-trash"></i> حذف';
    }
}

function closeModal() {
    document.getElementById('templateModal').classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    currentTemplateId = null;
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <button type="button" class="btn-upload" onclick="document.getElementById('templateImage').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>تغيير الصورة</span>
                </button>
            `;
        };
        reader.readAsDataURL(file);
    }
}

async function handleTemplateSubmit(e) {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const templateId = document.getElementById('templateId').value;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
    
    const formData = new FormData();
    formData.append('name', document.getElementById('templateName').value);
    formData.append('category', document.getElementById('templateCategory').value);
    formData.append('description', document.getElementById('templateDescription').value);
    
    const imageFile = document.getElementById('templateImage').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }
    
    try {
        const url = templateId 
            ? `${API_URL}/templates/${templateId}` 
            : `${API_URL}/templates`;
        
        const method = templateId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal();
            loadTemplates();
            alert(data.message || 'تم حفظ القالب بنجاح');
        } else {
            alert(data.message || 'فشل حفظ القالب');
        }
    } catch (error) {
        console.error('Error saving template:', error);
        alert('حدث خطأ في حفظ القالب');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ القالب';
    }
}
