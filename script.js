// ===== TRUST SELL - COMPLETE JAVASCRIPT =====

// Firebase Configuration (Aap apni API key yahan dalenge)
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "trust-sell.firebaseapp.com",
    projectId: "trust-sell",
    storageBucket: "trust-sell.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// AI Security Configuration
const AIConfig = {
    apiKey: "YOUR_CHATGPT_API_KEY",
    securityLevel: "high",
    autoModeration: true
};

// Global State Management
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    userType: null,
    cart: [],
    favorites: [],
    currentPage: 'home'
};

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadInitialData();
});

// ===== INITIALIZATION FUNCTIONS =====
function initializeApp() {
    console.log('🚀 Trust Sell App Initializing...');
    
    // Check authentication status
    checkAuthStatus();
    
    // Initialize animations
    initializeAnimations();
    
    // Load user preferences
    loadUserPreferences();
    
    // Initialize AI security
    initializeAISecurity();
}

function initializeAnimations() {
    // Initialize scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.category-card, .ad-card, .product-card').forEach(card => {
        observer.observe(card);
    });
}

function initializeAISecurity() {
    console.log('🛡️ AI Security System Initialized');
    
    // Monitor for suspicious activities
    monitorUserBehavior();
    
    // Initialize content moderation
    initializeContentModeration();
    
    // Setup fraud detection
    setupFraudDetection();
}

// ===== AUTHENTICATION FUNCTIONS =====
function checkAuthStatus() {
    const savedUser = localStorage.getItem('trustSellUser');
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        AppState.isLoggedIn = true;
        updateUIForAuthState();
    }
}

function updateUIForAuthState() {
    if (AppState.isLoggedIn) {
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'block';
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = 'none';
        });
        
        if (AppState.currentUser) {
            document.querySelectorAll('.user-name').forEach(el => {
                el.textContent = AppState.currentUser.name;
            });
        }
    } else {
        document.querySelectorAll('.auth-required').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.guest-only').forEach(el => {
            el.style.display = 'block';
        });
    }
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Search functionality
    setupSearch();
    
    // Authentication forms
    setupAuthForms();
    
    // Product interactions
    setupProductInteractions();
    
    // Chat system
    setupChatSystem();
    
    // Filter interactions
    setupFilters();
}

function setupSearch() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });

        searchInput.addEventListener('input', debounce(function(e) {
            performSearch(e.target.value);
        }, 300));
    }
}

function setupAuthForms() {
    // Tab switching
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.textContent.toLowerCase().includes('login') ? 'login' : 'signup';
            showAuthTab(tabName);
        });
    });

    // User type selection
    const userTypes = document.querySelectorAll('.user-type');
    userTypes.forEach(type => {
        type.addEventListener('click', function() {
            selectUserType(this);
        });
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
}

function setupProductInteractions() {
    // Product card interactions
    document.querySelectorAll('.ad-card, .product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn')) {
                const productId = this.dataset.productId;
                viewProductDetails(productId);
            }
        });
    });

    // Like/favorite buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(this.dataset.productId);
        });
    });

    // Contact seller buttons
    document.querySelectorAll('.contact-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            contactSeller(this.dataset.sellerId);
        });
    });
}

function setupChatSystem() {
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.send-btn');
    
    if (chatInput && sendBtn) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        sendBtn.addEventListener('click', sendMessage);
    }
}

function setupFilters() {
    const priceRange = document.querySelector('.price-range');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            updatePriceDisplay(this.value);
            filterProducts();
        });
    }

    // Category filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });

    // Location filters
    document.querySelectorAll('.location-filter').forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
}

// ===== CORE FUNCTIONALITY =====
function showAuthTab(tabName) {
    // Update tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.auth-tab').forEach(tab => {
        if (tab.textContent.toLowerCase().includes(tabName)) {
            tab.classList.add('active');
        }
    });

    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Form').classList.add('active');
}

function selectUserType(element) {
    document.querySelectorAll('.user-type').forEach(type => {
        type.classList.remove('selected');
    });
    element.classList.add('selected');
    AppState.userType = element.querySelector('h4').textContent.toLowerCase();
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    showLoading('Logging in...');

    try {
        // Firebase authentication would go here
        const user = await mockLogin(email, password);
        
        AppState.currentUser = user;
        AppState.isLoggedIn = true;
        
        localStorage.setItem('trustSellUser', JSON.stringify(user));
        updateUIForAuthState();
        
        showNotification('Login successful!', 'success');
        window.location.href = 'index.html';
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        password: formData.get('password'),
        city: formData.get('city'),
        userType: AppState.userType || 'standard'
    };

    if (!validateSignupData(userData)) {
        return;
    }

    showLoading('Creating account...');

    try {
        // Firebase signup would go here
        const user = await mockSignup(userData);
        
        AppState.currentUser = user;
        AppState.isLoggedIn = true;
        
        localStorage.setItem('trustSellUser', JSON.stringify(user));
        updateUIForAuthState();
        
        showNotification('Account created successfully!', 'success');
        window.location.href = 'index.html';
        
    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ===== PRODUCT MANAGEMENT =====
async function performSearch(query) {
    if (query.length < 2) return;
    
    showLoading('Searching...');
    
    try {
        const results = await searchProducts(query);
        displaySearchResults(results);
    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    } finally {
        hideLoading();
    }
}

function filterProducts() {
    const price = document.querySelector('.price-range').value;
    const category = document.querySelector('.category-filter:checked')?.value;
    const location = document.querySelector('.location-filter').value;
    
    // Apply filters to products
    document.querySelectorAll('.product-card, .ad-card').forEach(card => {
        let show = true;
        
        if (category && card.dataset.category !== category) {
            show = false;
        }
        
        if (location && card.dataset.location !== location) {
            show = false;
        }
        
        card.style.display = show ? 'block' : 'none';
    });
}

function viewProductDetails(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function toggleFavorite(productId) {
    const index = AppState.favorites.indexOf(productId);
    
    if (index > -1) {
        AppState.favorites.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        AppState.favorites.push(productId);
        showNotification('Added to favorites', 'success');
    }
    
    updateFavoritesUI();
    saveToLocalStorage('favorites', AppState.favorites);
}

function contactSeller(sellerId) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to contact seller', 'warning');
        showAuthTab('login');
        return;
    }
    
    window.location.href = `chat.html?seller=${sellerId}`;
}

// ===== CHAT FUNCTIONALITY =====
function sendMessage() {
    const input = document.querySelector('.chat-input input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!AppState.isLoggedIn) {
        showNotification('Please login to send messages', 'warning');
        return;
    }
    
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = createMessageElement(message, 'sent');
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Clear input
    input.value = '';
    
    // Simulate AI response after delay
    setTimeout(simulateAIResponse, 1000);
}

function createMessageElement(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = text;
    return messageDiv;
}

function simulateAIResponse() {
    const responses = [
        "I'm interested in your product!",
        "Can you tell me more about the condition?",
        "Is the price negotiable?",
        "When can I come see it?",
        "Do you have more pictures?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = createMessageElement(randomResponse, 'received');
    chatMessages.appendChild(messageElement);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== AI SECURITY FUNCTIONS =====
function monitorUserBehavior() {
    // Monitor for rapid clicks (bot behavior)
    let clickCount = 0;
    let lastClickTime = 0;
    
    document.addEventListener('click', function() {
        const now = Date.now();
        if (now - lastClickTime < 100) { // Multiple clicks in 100ms
            clickCount++;
            if (clickCount > 5) {
                console.warn('⚠️ Suspicious activity detected: Rapid clicking');
                // Trigger additional security measures
            }
        } else {
            clickCount = 0;
        }
        lastClickTime = now;
    });
}

function initializeContentModeration() {
    // Monitor user-generated content
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    checkContentForModeration(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function checkContentForModeration(element) {
    // Check text content for inappropriate language
    const text = element.textContent || '';
    const bannedWords = ['spam', 'fraud', 'scam']; // Add more words
    
    bannedWords.forEach(word => {
        if (text.toLowerCase().includes(word)) {
            console.warn(`🚨 Moderated content detected: ${word}`);
            element.style.display = 'none';
            showNotification('Content removed due to policy violation', 'warning');
        }
    });
}

function setupFraudDetection() {
    // Monitor for suspicious patterns
    setInterval(() => {
        checkForSuspiciousActivity();
    }, 30000); // Check every 30 seconds
}

function checkForSuspiciousActivity() {
    // Implement fraud detection logic
    console.log('🔍 Running fraud detection scan...');
}

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoading(message = 'Loading...') {
    // Create or show loading overlay
    let loading = document.getElementById('loadingOverlay');
    if (!loading) {
        loading = document.createElement('div');
        loading.id = 'loadingOverlay';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
        `;
        document.body.appendChild(loading);
    }
    loading.style.display = 'flex';
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) {
        loading.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 2rem;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#004E89'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function validateSignupData(data) {
    if (!data.name || data.name.length < 2) {
        showNotification('Please enter a valid name', 'error');
        return false;
    }
    
    if (!data.email || !isValidEmail(data.email)) {
        showNotification('Please enter a valid email', 'error');
        return false;
    }
    
    if (!data.phone || !isValidPhone(data.phone)) {
        showNotification('Please enter a valid phone number', 'error');
        return false;
    }
    
    if (!data.password || data.password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9+-\s()]{10,}$/;
    return phoneRegex.test(phone);
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(`trustSell_${key}`, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(`trustSell_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
    }
}

// ===== MOCK FUNCTIONS (Firebase ke liye placeholder) =====
async function mockLogin(email, password) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && password) {
                resolve({
                    id: '1',
                    name: 'Test User',
                    email: email,
                    phone: '+923001234567',
                    userType: 'verified',
                    joinDate: new Date().toISOString()
                });
            } else {
                reject(new Error('Invalid email or password'));
            }
        }, 1500);
    });
}

async function mockSignup(userData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userData.email && userData.password) {
                resolve({
                    id: Date.now().toString(),
                    ...userData,
                    joinDate: new Date().toISOString()
                });
            } else {
                reject(new Error('Signup failed. Please try again.'));
            }
        }, 2000);
    });
}

async function searchProducts(query) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock search results
            resolve([
                { id: '1', title: 'iPhone 13 Pro', price: 85000, location: 'Karachi' },
                { id: '2', title: 'Samsung Galaxy S21', price: 65000, location: 'Lahore' }
            ]);
        }, 1000);
    });
}

function displaySearchResults(results) {
    console.log('Search results:', results);
    // Implement search results display
}

function loadInitialData() {
    // Load saved data from localStorage
    const savedFavorites = loadFromLocalStorage('favorites');
    if (savedFavorites) {
        AppState.favorites = savedFavorites;
    }
    
    const savedCart = loadFromLocalStorage('cart');
    if (savedCart) {
        AppState.cart = savedCart;
    }
    
    updateFavoritesUI();
    updateCartUI();
}

function updateFavoritesUI() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        const productId = btn.dataset.productId;
        if (AppState.favorites.includes(productId)) {
            btn.classList.add('liked');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else {
            btn.classList.remove('liked');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

function updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = AppState.cart.length;
    }
}

function updatePriceDisplay(value) {
    const priceDisplay = document.querySelector('.price-display');
    if (priceDisplay) {
        priceDisplay.textContent = `Rs ${value}`;
    }
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.TrustSell = {
    AppState,
    showNotification,
    showLoading,
    hideLoading,
    toggleFavorite,
    contactSeller
};

console.log('✅ Trust Sell JavaScript loaded successfully!');
