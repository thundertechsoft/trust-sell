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
    currentLocation: 'All Pakistan',
    favorites: [],
    cart: []
};

// Voice Recognition
let recognition = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    initializeVoiceSearch();
});

function initializeApp() {
    console.log('🚀 Trust Sell App Initializing...');
    
    // Check authentication status
    checkAuthStatus();
    
    // Load user preferences
    loadUserPreferences();
    
    // Initialize location
    initializeLocation();
}

function checkAuthStatus() {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            AppState.currentUser = user;
            AppState.isLoggedIn = true;
            
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
    const authIcons = document.querySelectorAll('.fa-user');
    
    authIcons.forEach(icon => {
        if (AppState.isLoggedIn) {
            icon.className = 'fas fa-user';
        } else {
            icon.className = 'far fa-user';
        }
    });
    
    authLinks.forEach(link => {
        if (AppState.isLoggedIn) {
            link.textContent = 'Profile';
            link.href = 'profile.html';
        } else {
            link.textContent = 'Login';
            link.href = 'auth.html';
        }
    });
}

function setupEventListeners() {
    // Search functionality
    setupSearch();
    
    // Navigation
    setupNavigation();
    
    // Voice search
    setupVoiceSearch();
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
                    searchProducts(query);
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
    
    // Bottom nav active states
    const currentPage = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });
}

function setupVoiceSearch() {
    const voiceButtons = document.querySelectorAll('.voice-search');
    voiceButtons.forEach(button => {
        button.addEventListener('click', startVoiceRecognition);
    });
}

// ===== VOICE SEARCH =====
function initializeVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = function() {
            showVoiceModal();
        };
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            processVoiceResult(transcript);
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error', event.error);
            showNotification('Voice search error: ' + event.error, 'error');
            hideVoiceModal();
        };
        
        recognition.onend = function() {
            hideVoiceModal();
        };
    } else {
        console.warn('Voice search not supported in this browser');
    }
}

function startVoiceRecognition() {
    if (recognition) {
        recognition.start();
    } else {
        showNotification('Voice search not supported in your browser', 'warning');
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function showVoiceModal() {
    const modal = document.getElementById('voiceModal') || createVoiceModal();
    modal.classList.add('active');
}

function hideVoiceModal() {
    const modal = document.getElementById('voiceModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function createVoiceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal voice-modal';
    modal.id = 'voiceModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="voice-icon">
                <i class="fas fa-microphone"></i>
            </div>
            <h3>Speak Now</h3>
            <p>Say what you're looking for...</p>
            <div id="voiceResult" class="mt-1"></div>
            <button class="btn btn-primary mt-1" onclick="stopVoiceRecognition()">
                Stop Listening
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function processVoiceResult(transcript) {
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.value = transcript;
    });
    
    const voiceResult = document.getElementById('voiceResult');
    if (voiceResult) {
        voiceResult.innerHTML = `<p>You said: <strong>${transcript}</strong></p>`;
    }
    
    // Auto-search after 1 second
    setTimeout(() => {
        searchProducts(transcript);
    }, 1000);
}

// ===== LOCATION SYSTEM =====
function initializeLocation() {
    const savedLocation = localStorage.getItem('trustSell_location');
    if (savedLocation) {
        AppState.currentLocation = savedLocation;
    } else {
        // Try to get approximate location
        getApproximateLocation();
    }
    updateLocationUI();
}

function getApproximateLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // This is a simplified version - in production, you'd use a geocoding service
                    const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad'];
                    const randomCity = cities[Math.floor(Math.random() * cities.length)];
                    AppState.currentLocation = randomCity;
                    updateLocationUI();
                    localStorage.setItem('trustSell_location', randomCity);
                } catch (error) {
                    console.error('Error getting location:', error);
                    setDefaultLocation();
                }
            },
            () => {
                setDefaultLocation();
            }
        );
    } else {
        setDefaultLocation();
    }
}

function setDefaultLocation() {
    AppState.currentLocation = 'All Pakistan';
    updateLocationUI();
    localStorage.setItem('trustSell_location', 'All Pakistan');
}

function updateLocationUI() {
    const locationElements = document.querySelectorAll('#currentLocation');
    locationElements.forEach(element => {
        element.textContent = AppState.currentLocation;
    });
}

function changeLocation(province, city) {
    const newLocation = city ? `${city}, ${province}` : province;
    AppState.currentLocation = newLocation;
    localStorage.setItem('trustSell_location', newLocation);
    updateLocationUI();
    showNotification(`Location changed to ${newLocation}`, 'success');
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
            query = query.where('city', '==', filters.location.toLowerCase());
        }
        
        if (filters.sellerVerified) {
            query = query.where('sellerVerified', '==', true);
        }
        
        const querySnapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
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
                ${product.sellerVerified ? '<div class="product-badge">Verified</div>' : ''}
                ${product.features && product.features.includes('featured') ? '<div class="product-badge premium-badge">Featured</div>' : ''}
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-price">${formatPrice(product.price)}</div>
                <div class="product-location">
                    <i class="fas fa-map-marker-alt"></i> 
                    ${product.city ? product.city.charAt(0).toUpperCase() + product.city.slice(1) : product.location}
                </div>
                <div class="product-meta">
                    <div class="seller-info">
                        <div class="seller-avatar">${getInitials(product.sellerName)}</div>
                        <span>${product.sellerName}</span>
                        ${product.sellerVerified ? '<i class="fas fa-badge-check verified-icon"></i>' : ''}
                    </div>
                    <div class="product-actions">
                        <button class="action-btn" onclick="event.stopPropagation(); toggleFavorite('${product.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

async function toggleFavorite(productId) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to add favorites', 'warning');
        setTimeout(() => {
            window.location.href = 'auth.html';
        }, 2000);
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

function viewProduct(productId) {
    window.location.href = `product-detail.html?id=${productId}`;
}

function searchProducts(query) {
    if (query.trim()) {
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

function filterByCategory(category) {
    window.location.href = `products.html?category=${category}`;
}

// ===== AUTHENTICATION FUNCTIONS =====
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
        const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
        const user = userCredential.user;
        
        await db.collection('users').doc(user.uid).set({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            province: userData.province,
            city: userData.city,
            userType: userData.userType,
            verified: userData.userType === 'verified',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
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
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

async function resetPassword(email) {
    try {
        await auth.sendPasswordResetEmail(email);
        showNotification('Password reset email sent!', 'success');
    } catch (error) {
        showNotification(getAuthErrorMessage(error), 'error');
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
            <div class="loading-spinner"></div>
            <p class="mt-1">${message}</p>
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
    if (!price) return 'Rs 0';
    return 'Rs ' + parseInt(price).toLocaleString();
}

function formatDate(timestamp) {
    if (!timestamp) return 'Recently';
    try {
        const date = timestamp.toDate();
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
        return date.toLocaleDateString();
    } catch (error) {
        return 'Recently';
    }
}

function getCategoryIcon(category) {
    const icons = {
        'cars': 'car',
        'mobiles': 'mobile-alt',
        'property': 'home',
        'jobs': 'briefcase',
        'bikes': 'motorcycle',
        'electronics': 'laptop',
        'fashion': 'tshirt',
        'furniture': 'couch',
        'services': 'tools',
        'animals': 'paw',
        'books': 'book',
        'sports': 'futbol'
    };
    
    if (!category) return 'tag';
    
    for (const [key, icon] of Object.entries(icons)) {
        if (category.toLowerCase().includes(key)) {
            return icon;
        }
    }
    return 'tag';
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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

// ===== CHAT FUNCTIONS =====
async function sendMessage(chatId, message) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to send messages', 'warning');
        return;
    }
    
    try {
        await db.collection('chats').doc(chatId).collection('messages').add({
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

async function startNewChat(sellerId, productId = null) {
    if (!AppState.isLoggedIn) {
        showNotification('Please login to start a chat', 'warning');
        return null;
    }
    
    try {
        // Check if chat already exists
        const existingChat = await db.collection('chats')
            .where('participants', 'array-contains', AppState.currentUser.uid)
            .get();

        let chatId = null;
        existingChat.forEach(doc => {
            const chat = doc.data();
            if (chat.participants.includes(sellerId)) {
                chatId = doc.id;
            }
        });

        if (!chatId) {
            // Get seller data
            const sellerDoc = await db.collection('users').doc(sellerId).get();
            const sellerData = sellerDoc.data();
            
            // Create new chat
            const chatData = {
                participants: [AppState.currentUser.uid, sellerId],
                participantsData: {
                    [AppState.currentUser.uid]: {
                        name: AppState.userData.name,
                        avatar: getInitials(AppState.userData.name)
                    },
                    [sellerId]: {
                        name: sellerData.name,
                        avatar: getInitials(sellerData.name)
                    }
                },
                lastMessage: '',
                lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
                productId: productId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const chatRef = await db.collection('chats').add(chatData);
            chatId = chatRef.id;
        }
        
        return chatId;
    } catch (error) {
        console.error('Error starting chat:', error);
        showNotification('Error starting chat', 'error');
        return null;
    }
}

// ===== IMAGE UPLOAD =====
async function uploadImage(file) {
    try {
        const storageRef = storage.ref();
        const imageRef = storageRef.child(`products/${Date.now()}_${file.name}`);
        const snapshot = await imageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function uploadMultipleImages(files) {
    const uploadPromises = Array.from(files).map(file => uploadImage(file));
    return Promise.all(uploadPromises);
}

// ===== EXPORT FOR GLOBAL ACCESS =====
window.TrustSell = {
    AppState,
    auth,
    db,
    storage,
    
    // Utility Functions
    showNotification,
    showLoading,
    hideLoading,
    formatPrice,
    formatDate,
    getCategoryIcon,
    getInitials,
    
    // Product Functions
    loadProducts,
    displayProducts,
    toggleFavorite,
    viewProduct,
    searchProducts,
    filterByCategory,
    
    // Auth Functions
    loginUser,
    registerUser,
    logoutUser,
    resetPassword,
    
    // Chat Functions
    sendMessage,
    startNewChat,
    
    // Voice Search
    startVoiceRecognition,
    stopVoiceRecognition
};

console.log('✅ Trust Sell JavaScript loaded successfully!');

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
