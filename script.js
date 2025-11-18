// ===== TRUST SELL - COMPLETE JAVASCRIPT =====

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBJ9mLHHQxnJKtixZrOYy_Vtf-TuwED2dE",
    authDomain: "trustsell-78c18.firebaseapp.com",
    databaseURL: "https://trustsell-78c18-default-rtdb.firebaseio.com",
    projectId: "trustsell-78c18",
    storageBucket: "trustsell-78c18.firebasestorage.app",
    messagingSenderId: "909095926042",
    appId: "1:909095926042:web:3c6eee4f055d21fda794a3",
    measurementId: "G-4V0DBSRYKW"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global State Management
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    userData: null,
    cart: [],
    favorites: []
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    console.log('🚀 Trust Sell App Initializing...');
    
    // Check authentication status
    checkAuthStatus();
    
    // Initialize animations
    initializeAnimations();
    
    // Load user preferences
    loadUserPreferences();
}

function checkAuthStatus() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            AppState.currentUser = user;
            AppState.isLoggedIn = true;
            
            // Load user data from Firestore
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    AppState.userData = userDoc.data();
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
            
            updateAuthUI();
        } else {
            AppState.currentUser = null;
            AppState.isLoggedIn = false;
            AppState.userData = null;
            updateAuthUI();
        }
    });
}

function updateAuthUI() {
    const authLinks = document.querySelectorAll('.auth-link');
    const profileLinks = document.querySelectorAll('.profile-link');
    
    if (AppState.isLoggedIn) {
        authLinks.forEach(link => {
            link.textContent = 'My Profile';
            link.href = 'profile.html';
        });
        
        profileLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Update user name if available
        if (AppState.userData) {
            document.querySelectorAll('.user-name').forEach(element => {
                element.textContent = AppState.userData.name;
            });
        }
    } else {
        authLinks.forEach(link => {
            link.textContent = 'Login';
            link.href = 'auth.html';
        });
        
        profileLinks.forEach(link => {
            link.style.display = 'none';
        });
    }
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

function setupEventListeners() {
    // Search functionality
    setupSearch();
    
    // Navigation
    setupNavigation();
}

function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });

        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });

        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    window.location.href = `products.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    });
}

function setupNavigation() {
    // Logo click
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    });
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showLoading(message = 'Loading...') {
    // Remove existing loading
    const existingLoading = document.querySelector('.loading-overlay');
    if (existingLoading) {
        existingLoading.remove();
    }

    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="text-center">
            <div class="loading"></div>
            <p class="mt-2">${message}</p>
        </div>
    `;
    
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading-overlay');
    if (loading) {
        loading.remove();
    }
}

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

function formatPrice(price) {
    return 'Rs ' + parseInt(price).toLocaleString();
}

function formatDate(timestamp) {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
}

function getCategoryIcon(category) {
    const icons = {
        'cars': 'car',
        'mobiles': 'mobile-alt',
        'property': 'home',
        'jobs': 'briefcase',
        'electronics': 'laptop',
        'bikes': 'motorcycle',
        'fashion': 'tshirt',
        'furniture': 'couch'
    };
    return icons[category] || 'tag';
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
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

// ===== PRODUCT FUNCTIONS =====
async function loadProducts(filters = {}) {
    showLoading('Loading products...');
    
    try {
        let query = db.collection('products').where('status', '==', 'active');
        
        // Apply filters
        if (filters.category) {
            query = query.where('category', '==', filters.category);
        }
        
        if (filters.maxPrice) {
            query = query.where('price', '<=', parseInt(filters.maxPrice));
        }
        
        if (filters.location) {
            query = query.where('location', '==', filters.location);
        }
        
        const querySnapshot = await query.orderBy('createdAt', 'desc').get();
        const products = [];
        
        querySnapshot.forEach((doc) => {
            products.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
        return [];
    } finally {
        hideLoading();
    }
}

function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: #666;">
                <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ddd;"></i>
                <h3>No products found</h3>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.onclick = () => viewProduct(product.id);
        
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-${getCategoryIcon(product.category)}"></i>
                ${product.verified ? '<div class="product-badge">Verified</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> ${product.location}
                </div>
                <div class="product-meta">
                    <div class="seller-info">
                        <div class="seller-avatar">${getInitials(product.sellerName)}</div>
                        <span>${product.sellerName}</span>
                        ${product.sellerVerified ? '<i class="fas fa-badge-check verified-icon"></i>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn like-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="action-btn" onclick="event.stopPropagation(); contactSeller('${product.sellerId}')">
                            <i class="far fa-envelope"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

async function toggleFavorite(productId) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to add favorites', 'warning');
        return;
    }
    
    try {
        const favoriteRef = db.collection('favorites').doc(`${AppState.currentUser.uid}_${productId}`);
        const favoriteDoc = await favoriteRef.get();
        
        if (favoriteDoc.exists) {
            await favoriteRef.delete();
            showNotification('Removed from favorites', 'success');
        } else {
            await favoriteRef.set({
                userId: AppState.currentUser.uid,
                productId: productId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            showNotification('Added to favorites', 'success');
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
        showNotification('Error updating favorites', 'error');
    }
}

function contactSeller(sellerId) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to contact seller', 'warning');
        window.location.href = 'auth.html';
        return;
    }
    
    window.location.href = `messages.html?seller=${sellerId}`;
}

// ===== AUTH FUNCTIONS =====
async function loginUser(email, password) {
    showLoading('Logging in...');
    
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        showNotification('Login successful!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
        return userCredential;
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function registerUser(userData) {
    showLoading('Creating account...');
    
    try {
        // Create auth user
        const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await db.collection('users').doc(user.uid).set({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            city: userData.city,
            userType: userData.userType,
            verified: userData.userType === 'verified',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showNotification('Account created successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
        return userCredential;
    } catch (error) {
        console.error('Registration error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
        throw error;
    } finally {
        hideLoading();
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        showNotification('Logged out successfully', 'success');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

function getAuthErrorMessage(error) {
    switch (error.code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
            return error.message || 'An error occurred. Please try again.';
    }
}

// ===== MESSAGING FUNCTIONS =====
async function sendMessage(chatId, message) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to send messages', 'warning');
        return;
    }
    
    try {
        await db.collection('messages').doc(chatId).collection('conversation').add({
            senderId: AppState.currentUser.uid,
            senderName: AppState.userData.name,
            message: message,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update last message in chat document
        await db.collection('chats').doc(chatId).update({
            lastMessage: message,
            lastMessageTime: firebase.firestore.FieldValue.serverTimestamp()
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        showNotification('Error sending message', 'error');
    }
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.TrustSell = {
    AppState,
    auth,
    db,
    storage,
    showNotification,
    showLoading,
    hideLoading,
    loadProducts,
    displayProducts,
    loginUser,
    registerUser,
    logoutUser,
    toggleFavorite,
    contactSeller
};

console.log('✅ Trust Sell JavaScript loaded successfully!');
