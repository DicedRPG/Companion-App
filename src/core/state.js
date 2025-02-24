// Initial state structure
const initialState = {
    attributeHours: {
        technique: 0,
        ingredients: 0,
        flavor: 0,
        management: 0
    },
    completedQuests: [],
    settings: {
        notifications: true,
        autoSave: true
    }
};

// Create store function
function createStore() {
    let state = {...initialState};
    const listeners = new Set();
    
    return {
        getState() {
            return state;
        },
        
        setState(newState) {
            console.log('Setting state:', newState); // Debug log
            state = {
                ...state,
                ...newState
            };
            this.saveToStorage();
            listeners.forEach(listener => listener(state));
        },
        
        updateState(path, value) {
            console.log('Updating state path:', path, 'value:', value); // Debug log
            const parts = path.split('.');
            let current = {...state};
            const newState = current;
            
            // Navigate to the correct part of the state
            for (let i = 0; i < parts.length - 1; i++) {
                current[parts[i]] = {...(current[parts[i]] || {})};
                current = current[parts[i]];
            }
            
            // Set the new value
            current[parts[parts.length - 1]] = value;
            
            // Update state
            this.setState(newState);
        },
        
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        
        saveToStorage() {
            try {
                localStorage.setItem('dicedRPG_state', JSON.stringify(state));
                console.log('State saved to storage:', state); // Debug log
            } catch (error) {
                console.error('Failed to save state:', error);
            }
        },
        
        loadFromStorage() {
            try {
                const savedState = localStorage.getItem('dicedRPG_state');
                if (savedState) {
                    state = JSON.parse(savedState);
                    console.log('State loaded from storage:', state); // Debug log
                    listeners.forEach(listener => listener(state));
                }
            } catch (error) {
                console.error('Failed to load state:', error);
            }
        },
        
        resetState() {
            state = {...initialState};
            this.saveToStorage();
            listeners.forEach(listener => listener(state));
        }
    };
}

export const store = createStore();