// TrustSell - Modern JavaScript with Firebase Integration

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
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getDatabase, 
    ref, 
    set, 
    get, 
    update, 
    remove, 
    push,
    onValue,
    query,
    orderByChild,
    equalTo,
    limitToFirst
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase App Initialization
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Global State
let currentUser = null;
let listings = [];
let categories = [];
let userData = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkAuthState();
    loadInitialData();
});

// Initialize Application
function initializeApp() {
    console.log('TrustSell initialized');
    
    // Check if user is logged in
    updateAuthUI();
    
    // Initialize any platform-specific features
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
}

// Service Worker Registration
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('ServiceWorker registered');
    } catch (error) {
        console.log('ServiceWorker registration failed:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Search functionality
    setupSearch();
    
    // Auth forms
    setupAuthForms();
    
    // Navigation
    setupNavigation();
    
    // Category selection
    setupCategorySelection();
    
    // Listing interactions
    setupListingInteractions();
}

// Search Functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('#searchInput, .search-input');
    const searchButtons = document.querySelectorAll('.search-btn');
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
    });
    
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchInput = this.closest('.search-bar')?.querySelector('input') || 
                              document.querySelector('#searchInput');
            if (searchInput) {
                performSearch(searchInput.value);
            }
        });
    });
}

function performSearch(query) {
    if (!query.trim()) {
        showNotification('Please enter a search term', 'warning');
        return;
    }
    
    // Log search analytics
    logEvent('search', { search_term: query });
    
    // Redirect to search results page
    window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
}

// Authentication Functions
function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // Social login buttons
    const googleLoginBtn = document.getElementById('googleLogin');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', handleGoogleLogin);
    }
    
    const facebookLoginBtn = document.getElementById('facebookLogin');
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', handleFacebookLogin);
    }
    
    // Toggle between login and signup
    const showSignupLink = document.getElementById('showSignup');
    const showLoginLink = document.getElementById('showLogin');
    
    if (showSignupLink) {
        showSignupLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('.auth-card').classList.add('hidden');
            document.getElementById('signupCard').classList.remove('hidden');
        });
    }
    
    if (showLoginLink) {
        showLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('signupCard').classList.add('hidden');
            document.querySelector('.auth-card').classList.remove('hidden');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Load user data from database
        await loadUserData(user.uid);
        
        showNotification('Login successful!', 'success');
        
        // Redirect to home page or intended destination
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save additional user data to database
        await set(ref(database, 'users/' + user.uid), {
            name: fullName,
            email: email,
            phone: phone,
            createdAt: new Date().toISOString(),
            verified: false,
            profileCompleted: false
        });
        
        showNotification('Account created successfully!', 'success');
        
        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    } finally {
        showLoading(false);
    }
}

async function handleGoogleLogin() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in database, if not create record
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            await set(userRef, {
                name: user.displayName,
                email: user.email,
                createdAt: new Date().toISOString(),
                verified: true,
                profileCompleted: false
            });
        }
        
        showNotification('Google login successful!', 'success');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Google login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    }
}

async function handleFacebookLogin() {
    try {
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        // Check if user exists in database, if not create record
        const userRef = ref(database, 'users/' + user.uid);
        const snapshot = await get(userRef);
        
        if (!snapshot.exists()) {
            await set(userRef, {
                name: user.displayName,
                email: user.email,
                createdAt: new Date().toISOString(),
                verified: true,
                profileCompleted: false
            });
        }
        
        showNotification('Facebook login successful!', 'success');
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Facebook login error:', error);
        showNotification(getAuthErrorMessage(error), 'error');
    }
}

async function handleLogout() {
    try {
        await signOut(auth);
        showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Error logging out', 'error');
    }
}

// Auth State Management
function checkAuthState() {
    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        
        if (user) {
            await loadUserData(user.uid);
        } else {
            userData = null;
        }
        
        updateAuthUI();
    });
}

async function loadUserData(userId) {
    try {
        const userRef = ref(database, 'users/' + userId);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
            userData = snapshot.val();
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function updateAuthUI() {
    const authButtons = document.querySelectorAll('.auth-btn');
    const userElements = document.querySelectorAll('.user-specific');
    
    if (currentUser) {
        // User is logged in
        authButtons.forEach(btn => {
            btn.textContent = 'Account';
            btn.href = 'account.html';
        });
        
        userElements.forEach(el => {
            el.style.display = 'block';
        });
        
        // Update user info if on account page
        updateUserProfile();
    } else {
        // User is logged out
        authButtons.forEach(btn => {
            btn.textContent = 'Login';
            btn.href = 'login.html';
        });
        
        userElements.forEach(el => {
            el.style.display = 'none';
        });
    }
}

function updateUserProfile() {
    if (!currentUser || !userData) return;
    
    const profileName = document.querySelector('.profile-info h2');
    const profileEmail = document.querySelector('.profile-info p');
    
    if (profileName) {
        profileName.textContent = userData.name || currentUser.displayName || 'User';
    }
    
    if (profileEmail && userData.email) {
        profileEmail.textContent = userData.email;
    }
}

// Navigation Setup
function setupNavigation() {
    // Bottom navigation active state
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Category Selection
function setupCategorySelection() {
    const categoryItems = document.querySelectorAll('.category-card, .category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const categoryName = this.querySelector('.category-name')?.textContent || 
                               this.querySelector('h3, h4')?.textContent ||
                               this.textContent.trim();
            selectCategory(categoryName);
        });
    });
}

function selectCategory(categoryName) {
    logEvent('select_category', { category_name: categoryName });
    
    // For demo purposes, redirect to search results
    // In a real app, this would navigate to category-specific page
    window.location.href = `search-results.html?category=${encodeURIComponent(categoryName)}`;
}

// Listing Interactions
function setupListingInteractions() {
    // This would handle favorite, share, and other listing interactions
    // Implementation depends on specific page requirements
}

// Data Loading
async function loadInitialData() {
    await Promise.all([
        loadCategories(),
        loadFeaturedListings()
    ]);
}

async function loadCategories() {
    try {
        const categoriesRef = ref(database, 'categories');
        const snapshot = await get(categoriesRef);
        
        if (snapshot.exists()) {
            categories = snapshot.val();
        } else {
            // Initialize default categories if none exist
            await initializeDefaultCategories();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function initializeDefaultCategories() {
    const defaultCategories = {
        'mobiles': {
            name: 'Mobiles',
            icon: '📱',
            subcategories: ['Smartphones', 'Tablets', 'Accessories']
        },
        'vehicles': {
            name: 'Vehicles',
            icon: '🚗',
            subcategories: ['Cars', 'Bikes', 'Commercial Vehicles']
        },
        'property-sale': {
            name: 'Property for Sale',
            icon: '🏠',
            subcategories: ['Houses', 'Apartments', 'Plots']
        },
        'property-rent': {
            name: 'Property for Rent',
            icon: '🏡',
            subcategories: ['Apartments', 'Houses', 'Rooms']
        }
    };
    
    try {
        await set(ref(database, 'categories'), defaultCategories);
        categories = defaultCategories;
    } catch (error) {
        console.error('Error initializing categories:', error);
    }
}

async function loadFeaturedListings() {
    try {
        const listingsRef = query(
            ref(database, 'listings'),
            orderByChild('featured'),
            equalTo(true),
            limitToFirst(8)
        );
        
        const snapshot = await get(listingsRef);
        if (snapshot.exists()) {
            listings = snapshot.val();
            displayFeaturedListings();
        } else {
            // Load sample listings for demo
            await loadSampleListings();
        }
    } catch (error) {
        console.error('Error loading featured listings:', error);
        await loadSampleListings();
    }
}

async function loadSampleListings() {
    // Sample data for demo purposes
    listings = {
        '1': {
            title: 'iPhone 14 Pro 256GB - Like New',
            price: 280000,
            location: 'Lahore',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPmlQaG9uZSAxNCBQcm88L3RleHQ+PC9zdmc+',
            featured: true,
            createdAt: new Date().toISOString()
        },
        '2': {
            title: 'Honda Civic 2020 Oriel',
            price: 3200000,
            location: 'Karachi',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhvbmRhIENpdmljPC90ZXh0Pjwvc3ZnPg==',
            featured: true,
            createdAt: new Date(Date.now() - 86400000).toISOString()
        }
    };
    
    displayFeaturedListings();
}

function displayFeaturedListings() {
    const container = document.getElementById('featuredListings');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.entries(listings).forEach(([id, listing]) => {
        const listingElement = createListingElement(listing, id);
        container.appendChild(listingElement);
    });
}

function createListingElement(listing, id) {
    const div = document.createElement('div');
    div.className = 'listing-card fade-in';
    div.innerHTML = `
        <img src="${listing.image}" alt="${listing.title}" class="listing-image">
        <div class="listing-info">
            <h3 class="listing-title">${listing.title}</h3>
            <div class="listing-price">Rs ${formatPrice(listing.price)}</div>
            <div class="listing-meta">
                <span>${listing.location}</span>
                <span>${formatTime(listing.createdAt)}</span>
            </div>
        </div>
    `;
    
    div.addEventListener('click', () => {
        viewListing(id);
    });
    
    return div;
}

function viewListing(listingId) {
    window.location.href = `listing.html?id=${listingId}`;
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-PK').format(price);
}

function formatTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = (now - time) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} hours ago`;
    } else {
        return `${Math.floor(diffInHours / 24)} days ago`;
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#0078d4'
    };
    notification.style.background = colors[type] || colors.info;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function showLoading(show) {
    const existingLoaders = document.querySelectorAll('.loading-overlay');
    existingLoaders.forEach(loader => loader.remove());
    
    if (show) {
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Loading...</p>
        `;
        
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        document.body.appendChild(loader);
    }
}

function getAuthErrorMessage(error) {
    const errorMessages = {
        'auth/invalid-email': 'Invalid email address',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password': 'Password is too weak',
        'auth/network-request-failed': 'Network error. Please check your connection.'
    };
    
    return errorMessages[error.code] || error.message || 'An error occurred';
}

function logEvent(eventName, parameters = {}) {
    // In a real app, this would send to analytics service
    console.log(`Event: ${eventName}`, parameters);
}

// Global functions for HTML onclick handlers
window.selectCategory = selectCategory;
window.performSearch = performSearch;

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        performSearch,
        selectCategory,
        formatPrice,
        formatTime
    };
}
