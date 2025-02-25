// src/core/state.js
const STORAGE_KEY = 'diced_rpg_state';

// Initial state
const initialState = {
    attributeHours: {
        technique: 0,
        ingredients: 0,
        flavor: 0,
        management: 0
    },
    completedQuests: [],
    visibleQuests: [], // For quest progression system
    pathProgress: {}, // For quest path system
    adminMode: false, // For admin features
    currentView: 'list', // For UI state tracking ('list', 'path', 'adventure')
    lastUpdate: new Date().toISOString()
};

// Store implementation
class Store {
    constructor() {
        this._state = {...initialState};
        this._listeners = [];
    }
    
    // Get current state (immutable)
    getState() {
        return {...this._state};
    }
    
    // Set entire state at once
    setState(newState) {
        this._state = {...newState};
        this._notifyListeners();
        this._saveToStorage();
    }
    
    // Update specific part of state (supports dot notation for nested properties)
    updateState(path, value) {
        // Handle dot notation path ('object.nestedProp')
        const parts = path.split('.');
        let current = this._state;
        const lastKey = parts.pop();
        
        // Navigate to the right level
        for (const key of parts) {
            if (current[key] === undefined) {
                current[key] = {};
            }
            current = current[key];
        }
        
        // Set the value
        current[lastKey] = value;
        
        this._notifyListeners();
        this._saveToStorage();
    }
    
    // Add a listener function
    subscribe(listenerFn) {
        this._listeners.push(listenerFn);
        
        // Return unsubscribe function
        return () => {
            this._listeners = this._listeners.filter(fn => fn !== listenerFn);
        };
    }
    
    // Notify all listeners
    _notifyListeners() {
        this._listeners.forEach(listener => listener(this._state));
    }
    
    // Save state to localStorage
    _saveToStorage() {
        try {
            // Update last modified timestamp
            this._state.lastUpdate = new Date().toISOString();
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._state));
        } catch (error) {
            console.error('Failed to save state to storage:', error);
        }
    }
    
    // Load state from localStorage
    loadFromStorage() {
        try {
            const savedState = localStorage.getItem(STORAGE_KEY);
            if (savedState) {
                const parsed = JSON.parse(savedState);
                
                // Merge saved state with initial state to ensure all properties exist
                this._state = this._mergeWithInitial(parsed);
                this._notifyListeners();
            }
        } catch (error) {
            console.error('Failed to load state from storage:', error);
        }
    }
    
    // Helper to ensure all required properties exist
    _mergeWithInitial(savedState) {
        // Start with a fresh initial state
        const result = JSON.parse(JSON.stringify(initialState));
        
        // Recursively merge saved state
        const deepMerge = (target, source) => {
            for (const key in source) {
                if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    // If the key doesn't exist in target or isn't an object, create it
                    if (!target[key] || typeof target[key] !== 'object') {
                        target[key] = {};
                    }
                    deepMerge(target[key], source[key]);
                } else {
                    // For arrays and primitive values, replace completely
                    target[key] = source[key];
                }
            }
        };
        
        deepMerge(result, savedState);
        return result;
    }
    
    // Reset all state to initial values
    resetState() {
        this._state = JSON.parse(JSON.stringify(initialState));
        this._notifyListeners();
        this._saveToStorage();
    }
}

// Create and export store singleton
export const store = new Store();