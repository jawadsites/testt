// ==================== 
// Admin Login Handler
// ==================== 

const API_URL = 'https://postmaker-ai-backend.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');
    
    // Toggle password visibility
    togglePassword?.addEventListener('click', () => {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        togglePassword.innerHTML = type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    });
    
    // Handle login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        
        // Disable button during request
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        errorMessage.style.display = 'none';
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Save token
                localStorage.setItem('adminToken', data.token);
                
                // Show success and redirect
                submitBtn.innerHTML = '<i class="fas fa-check"></i> تم بنجاح!';
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                // Show error
                errorMessage.textContent = data.message || 'فشل تسجيل الدخول';
                errorMessage.style.display = 'block';
                
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'حدث خطأ في الاتصال بالخادم';
            errorMessage.style.display = 'block';
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> تسجيل الدخول';
        }
    });
    
    // Check if already logged in
    checkAuth();
});

async function checkAuth() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        try {
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                // Already logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
    }
}
