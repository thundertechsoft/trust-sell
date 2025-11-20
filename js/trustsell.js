// TrustSell JavaScript - Complete Functionality with Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    FacebookAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc,
    query,
    where,
    orderBy,
    limit,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "firebase/firestore";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "firebase/storage";

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Global State
let currentUser = null;
let categories = [];
let locations = [];

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateUIForAuthState();
});

// Update UI based on auth state
function updateUIForAuthState() {
    const loginBtn = document.querySelector('.btn-login');
    const accountLinks = document.querySelectorAll('a[href="account.html"]');
    
    if (currentUser) {
        if (loginBtn) loginBtn.textContent = 'My Account';
        accountLinks.forEach(link => {
            link.href = 'account.html';
            link.textContent = 'My Account';
        });
    } else {
        if (loginBtn) loginBtn.textContent = 'Login';
        accountLinks.forEach(link => {
            link.href = 'login.html';
            link.textContent = 'Login';
        });
    }
}

// Authentication Functions
export async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Google login error:', error);
        throw error;
    }
}

export async function loginWithFacebook() {
    const provider = new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        console.error('Facebook login error:', error);
        throw error;
    }
}

export async function loginWithEmail(email, password) {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    } catch (error) {
        console.error('Email login error:', error);
        throw error;
    }
}

export async function registerWithEmail(email, password, userData) {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Save additional user data to Firestore
        await addDoc(collection(db, 'users'), {
            uid: result.user.uid,
            email: result.user.email,
            ...userData,
            createdAt: new Date()
        });
        return result.user;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

export async function logout() {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}

// Ad Management Functions
export async function createAd(adData) {
    if (!currentUser) throw new Error('User must be logged in');
    
    try {
        const docRef = await addDoc(collection(db, 'ads'), {
            ...adData,
            userId: currentUser.uid,
            createdAt: new Date(),
            status: 'active',
            views: 0
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating ad:', error);
        throw error;
    }
}

export async function getAds(filters = {}, limitCount = 20) {
    try {
        let q = collection(db, 'ads');
        
        // Apply filters
        const constraints = [];
        if (filters.category) {
            constraints.push(where('category', '==', filters.category));
        }
        if (filters.location) {
            constraints.push(where('location.city', '==', filters.location));
        }
        if (filters.maxPrice) {
            constraints.push(where('price', '<=', parseInt(filters.maxPrice)));
        }
        if (filters.minPrice) {
            constraints.push(where('price', '>=', parseInt(filters.minPrice)));
        }
        
        constraints.push(orderBy('createdAt', 'desc'));
        constraints.push(limit(limitCount));
        
        q = query(q, ...constraints);
        const querySnapshot = await getDocs(q);
        
        const ads = [];
        querySnapshot.forEach((doc) => {
            ads.push({ id: doc.id, ...doc.data() });
        });
        
        return ads;
    } catch (error) {
        console.error('Error getting ads:', error);
        throw error;
    }
}

export async function getAdById(adId) {
    try {
        const docRef = doc(db, 'ads', adId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            throw new Error('Ad not found');
        }
    } catch (error) {
        console.error('Error getting ad:', error);
        throw error;
    }
}

export async function updateAd(adId, updates) {
    try {
        const docRef = doc(db, 'ads', adId);
        await updateDoc(docRef, updates);
    } catch (error) {
        console.error('Error updating ad:', error);
        throw error;
    }
}

export async function deleteAd(adId) {
    try {
        await deleteDoc(doc(db, 'ads', adId));
    } catch (error) {
        console.error('Error deleting ad:', error);
        throw error;
    }
}

// Image Upload Function
export async function uploadImage(file) {
    if (!currentUser) throw new Error('User must be logged in');
    
    try {
        const storageRef = ref(storage, `ads/${currentUser.uid}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Chat Functions
export async function sendMessage(chatId, message) {
    if (!currentUser) throw new Error('User must be logged in');
    
    try {
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            senderId: currentUser.uid,
            message: message,
            timestamp: new Date(),
            read: false
        });
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

export async function getChats(userId) {
    try {
        const q = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', userId)
        );
        const querySnapshot = await getDocs(q);
        
        const chats = [];
        querySnapshot.forEach((doc) => {
            chats.push({ id: doc.id, ...doc.data() });
        });
        
        return chats;
    } catch (error) {
        console.error('Error getting chats:', error);
        throw error;
    }
}

// Search Functions
export function performSearch(query, filters = {}) {
    return getAds({ ...filters, search: query });
}

// Categories Data
export const categoriesData = {
    mobiles: {
        name: 'Mobiles & Tablets',
        subcategories: ['Smartphones', 'Tablets', 'Mobile Accessories', 'Wearables']
    },
    vehicles: {
        name: 'Vehicles',
        subcategories: ['Cars', 'Motorcycles', 'Auto Parts', 'Bicycles', 'Commercial Vehicles']
    },
    property: {
        name: 'Property',
        subcategories: ['Houses', 'Apartments', 'Plots', 'Commercial Property', 'Rooms']
    },
    electronics: {
        name: 'Electronics & Home Appliances',
        subcategories: ['Computers', 'TVs', 'Cameras', 'Kitchen Appliances', 'ACs']
    },
    jobs: {
        name: 'Jobs',
        subcategories: ['IT & Telecom', 'Sales & Marketing', 'Accounting', 'Engineering', 'Teaching']
    },
    services: {
        name: 'Services',
        subcategories: ['Home Services', 'Tuitions', 'Events', 'Repairs', 'Beauty']
    }
};

// Locations Data
export const locationsData = {
    punjab: {
        name: 'Punjab',
        cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan', 'Sialkot', 'Bahawalpur', 'Sargodha']
    },
    sindh: {
        name: 'Sindh',
        cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana', 'Nawabshah']
    },
    kpk: {
        name: 'Khyber Pakhtunkhwa',
        cities: ['Peshawar', 'Abbottabad', 'Mardan', 'Swat', 'Kohat']
    },
    balochistan: {
        name: 'Balochistan',
        cities: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar']
    },
    islamabad: {
        name: 'Islamabad',
        cities: ['Islamabad']
    }
};

// Utility Functions
export function formatPrice(price) {
    return 'PKR ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

export function debounce(func, wait) {
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

// DOM Content Loaded Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    try {
        switch(page) {
            case 'index.html':
                await loadFeaturedAds();
                break;
            case 'sell.html':
                initializeSellPage();
                break;
            case 'login.html':
                initializeLoginPage();
                break;
            case 'search-results.html':
                initializeSearchPage();
                break;
            case 'chat.html':
                initializeChatPage();
                break;
            case 'account.html':
                initializeAccountPage();
                break;
            case 'my-ads.html':
                initializeMyAdsPage();
                break;
            case 'listing.html':
                initializeListingPage();
                break;
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Page-specific Initialization Functions
async function loadFeaturedAds() {
    const featuredAdsContainer = document.getElementById('featuredAds');
    if (!featuredAdsContainer) return;
    
    try {
        const ads = await getAds({}, 8);
        featuredAdsContainer.innerHTML = ads.map(ad => `
            <div class="ad-card" onclick="window.location.href='listing.html?id=${ad.id}'">
                <img src="${ad.images?.[0] || '/placeholder.jpg'}" alt="${ad.title}" class="ad-image">
                <div class="ad-details">
                    <div class="ad-price">${formatPrice(ad.price)}</div>
                    <h3 class="ad-title">${ad.title}</h3>
                    <div class="ad-location">${ad.location?.city || 'Unknown'}</div>
                    <div class="ad-date">${formatDate(ad.createdAt)}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        featuredAdsContainer.innerHTML = '<p>Error loading featured ads</p>';
    }
}

function initializeSellPage() {
    const categorySelect = document.getElementById('mainCategory');
    const subCategorySelect = document.getElementById('subCategory');
    const provinceSelect = document.getElementById('province');
    const citySelect = document.getElementById('city');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const adForm = document.getElementById('adForm');
    
    let uploadedImages = [];
    
    // Category change handler
    if (categorySelect) {
        categorySelect.addEventListener('change', function() {
            const category = this.value;
            subCategorySelect.innerHTML = '<option value="">Select Sub Category</option>';
            
            if (category && categoriesData[category]) {
                categoriesData[category].subcategories.forEach(sub => {
                    const option = document.createElement('option');
                    option.value = sub.toLowerCase();
                    option.textContent = sub;
                    subCategorySelect.appendChild(option);
                });
            }
        });
    }
    
    // Province change handler
    if (provinceSelect) {
        provinceSelect.addEventListener('change', function() {
            const province = this.value;
            citySelect.innerHTML = '<option value="">Select City</option>';
            
            if (province && locationsData[province]) {
                locationsData[province].cities.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.toLowerCase();
                    option.textContent = city;
                    citySelect.appendChild(option);
                });
            }
        });
    }
    
    // Image upload handler
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.multiple = true;
            input.onchange = handleImageUpload;
            input.click();
        });
        
        function handleImageUpload(e) {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    alert('File size must be less than 5MB');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImages.push({
                        file: file,
                        preview: e.target.result
                    });
                    updateImagePreview();
                };
                reader.readAsDataURL(file);
            });
        }
        
        function updateImagePreview() {
            imagePreview.innerHTML = uploadedImages.map((img, index) => `
                <div class="preview-item">
                    <img src="${img.preview}" alt="Preview" class="preview-image">
                    <button type="button" onclick="removeImage(${index})">×</button>
                </div>
            `).join('');
        }
        
        window.removeImage = (index) => {
            uploadedImages.splice(index, 1);
            updateImagePreview();
        };
    }
    
    // Form submission
    if (adForm) {
        adForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                alert('Please login to post an ad');
                window.location.href = 'login.html';
                return;
            }
            
            try {
                // Upload images first
                const imageUrls = [];
                for (const img of uploadedImages) {
                    const url = await uploadImage(img.file);
                    imageUrls.push(url);
                }
                
                const adData = {
                    title: document.getElementById('adTitle').value,
                    description: document.getElementById('adDescription').value,
                    price: parseInt(document.getElementById('adPrice').value),
                    category: document.getElementById('mainCategory').value,
                    subCategory: document.getElementById('subCategory').value,
                    location: {
                        province: document.getElementById('province').value,
                        city: document.getElementById('city').value,
                        area: document.getElementById('area').value
                    },
                    images: imageUrls,
                    condition: 'used' // Default for now
                };
                
                const adId = await createAd(adData);
                alert('Ad posted successfully!');
                window.location.href = `listing.html?id=${adId}`;
                
            } catch (error) {
                console.error('Error posting ad:', error);
                alert('Error posting ad. Please try again.');
            }
        });
    }
}

function initializeLoginPage() {
    const googleBtn = document.getElementById('googleLogin');
    const facebookBtn = document.getElementById('facebookLogin');
    const loginForm = document.getElementById('loginForm');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            try {
                await loginWithGoogle();
                window.location.href = 'index.html';
            } catch (error) {
                alert('Google login failed. Please try again.');
            }
        });
    }
    
    if (facebookBtn) {
        facebookBtn.addEventListener('click', async () => {
            try {
                await loginWithFacebook();
                window.location.href = 'index.html';
            } catch (error) {
                alert('Facebook login failed. Please try again.');
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await loginWithEmail(email, password);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Login failed. Please check your credentials.');
            }
        });
    }
}

function initializeSearchPage() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const cityFilter = document.getElementById('cityFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const searchResults = document.getElementById('searchResults');
    
    // Populate category filter
    if (categoryFilter) {
        Object.entries(categoriesData).forEach(([key, category]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
    
    // Populate city filter
    if (cityFilter) {
        Object.values(locationsData).forEach(province => {
            province.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                cityFilter.appendChild(option);
            });
        });
    }
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    const locationQuery = urlParams.get('location');
    
    if (searchInput && searchQuery) {
        searchInput.value = searchQuery;
    }
    
    if (cityFilter && locationQuery) {
        cityFilter.value = locationQuery;
    }
    
    // Load search results
    loadSearchResults();
    
    // Apply filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadSearchResults);
    }
    
    // Debounced search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(loadSearchResults, 500));
    }
    
    async function loadSearchResults() {
        const filters = {};
        
        if (categoryFilter && categoryFilter.value) {
            filters.category = categoryFilter.value;
        }
        if (minPrice && minPrice.value) {
            filters.minPrice = minPrice.value;
        }
        if (maxPrice && maxPrice.value) {
            filters.maxPrice = maxPrice.value;
        }
        if (cityFilter && cityFilter.value) {
            filters.location = cityFilter.value;
        }
        if (searchInput && searchInput.value) {
            filters.search = searchInput.value;
        }
        
        try {
            const ads = await getAds(filters, 20);
            displaySearchResults(ads);
        } catch (error) {
            console.error('Error loading search results:', error);
        }
    }
    
    function displaySearchResults(ads) {
        if (!searchResults) return;
        
        if (ads.length === 0) {
            searchResults.innerHTML = '<p>No listings found matching your criteria.</p>';
            return;
        }
        
        searchResults.innerHTML = ads.map(ad => `
            <div class="ad-card" onclick="window.location.href='listing.html?id=${ad.id}'">
                <img src="${ad.images?.[0] || '/placeholder.jpg'}" alt="${ad.title}" class="ad-image">
                <div class="ad-details">
                    <div class="ad-price">${formatPrice(ad.price)}</div>
                    <h3 class="ad-title">${ad.title}</h3>
                    <div class="ad-location">${ad.location?.city || 'Unknown'}</div>
                    <div class="ad-date">${formatDate(ad.createdAt)}</div>
                </div>
            </div>
        `).join('');
    }
}

function initializeChatPage() {
    // Chat functionality implementation
    console.log('Chat page initialized');
}

function initializeAccountPage() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user data and statistics
    loadUserData();
}

async function loadUserData() {
    try {
        const activeAds = await getAds({ userId: currentUser.uid });
        document.getElementById('activeAds').textContent = activeAds.length;
        // Load other user data...
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

function initializeMyAdsPage() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserAds();
}

async function loadUserAds() {
    try {
        const ads = await getAds({ userId: currentUser.uid });
        const adsList = document.getElementById('userAdsList');
        
        if (ads.length === 0) {
            adsList.innerHTML = '<p>You have no active ads. <a href="sell.html">Post your first ad</a></p>';
            return;
        }
        
        adsList.innerHTML = ads.map(ad => `
            <div class="user-ad-card">
                <img src="${ad.images?.[0] || '/placeholder.jpg'}" alt="${ad.title}">
                <div class="ad-info">
                    <h4>${ad.title}</h4>
                    <div class="ad-price">${formatPrice(ad.price)}</div>
                    <div class="ad-stats">
                        <span>Views: ${ad.views || 0}</span>
                        <span>Status: ${ad.status}</span>
                    </div>
                </div>
                <div class="ad-actions">
                    <button onclick="editAd('${ad.id}')">Edit</button>
                    <button onclick="deleteAd('${ad.id}')">Delete</button>
                    <button onclick="promoteAd('${ad.id}')">Promote</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading user ads:', error);
    }
}

function initializeListingPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const adId = urlParams.get('id');
    
    if (adId) {
        loadListing(adId);
    }
}

async function loadListing(adId) {
    try {
        const ad = await getAdById(adId);
        displayListing(ad);
    } catch (error) {
        console.error('Error loading listing:', error);
        document.querySelector('.listing-container').innerHTML = '<p>Listing not found.</p>';
    }
}

function displayListing(ad) {
    document.getElementById('listingTitle').textContent = ad.title;
    document.getElementById('listingPrice').textContent = formatPrice(ad.price);
    document.getElementById('listingDescription').textContent = ad.description;
    document.getElementById('listingLocation').textContent = `${ad.location.area}, ${ad.location.city}`;
    document.getElementById('listingDate').textContent = `Posted on ${formatDate(ad.createdAt)}`;
    
    // Set main image
    const mainImage = document.getElementById('mainListingImage');
    if (ad.images && ad.images.length > 0) {
        mainImage.src = ad.images[0];
        mainImage.alt = ad.title;
    }
    
    // Set thumbnails
    const thumbnails = document.getElementById('imageThumbnails');
    if (ad.images && ad.images.length > 1) {
        thumbnails.innerHTML = ad.images.map((img, index) => `
            <img src="${img}" alt="${ad.title}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="setMainImage('${img}', this)">
        `).join('');
    }
    
    // Update breadcrumb
    document.getElementById('breadcrumbCategory').textContent = categoriesData[ad.category]?.name || 'Category';
    document.getElementById('breadcrumbTitle').textContent = ad.title;
    
    // Increment view count
    updateAd(ad.id, { views: (ad.views || 0) + 1 });
}

window.setMainImage = function(src, element) {
    document.getElementById('mainListingImage').src = src;
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
};

// Export for global access
window.trustsell = {
    auth,
    db,
    storage,
    currentUser,
    loginWithGoogle,
    loginWithFacebook,
    loginWithEmail,
    registerWithEmail,
    logout,
    createAd,
    getAds,
    getAdById,
    updateAd,
    deleteAd,
    uploadImage,
    formatPrice,
    formatDate
};
