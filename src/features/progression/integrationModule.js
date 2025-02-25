// src/features/progression/integrationModule.js
import { store } from '../../core/state.js';

export const initializeQuestProgression = () => {
    console.log('Initializing quest progression systems...');
    
    try {
        // 1. Initialize core progression systems
        if (window.questProgressionSystem) {
            window.questProgressionSystem.initialize();
        } else {
            console.error('Quest progression system not found');
        }
        
        if (window.questPathSystem) {
            window.questPathSystem.initialize();
        } else {
            console.error('Quest path system not found');
        }
        
        // 2. Extend quest system to work with progression
        if (window.questSystem) {
            // Only extend if the extension function is available
            if (typeof window.extendQuestSystem === 'function') {
                window.extendQuestSystem(window.questSystem);
                window.questSystem.addAdminControls();
            } else {
                console.error('Quest system extension function not found');
            }
        } else {
            console.error('Quest system not found, extension not applied');
        }
        
        // 3. Initialize UI components
        addPathViewButton();
        
        if (window.questPathUI) {
            window.questPathUI.initialize();
        } else {
            console.error('Quest path UI not found');
        }
        
        // 4. Load styles
        loadQuestPathStyles();
        
        console.log('Quest progression systems initialized');
    } catch (error) {
        console.error('Error initializing quest progression:', error);
    }
};

// Helper to add Path view button to the UI
const addPathViewButton = () => {
    const viewToggle = document.querySelector('.view-toggle');
    if (!viewToggle) {
        console.error('View toggle container not found');
        return;
    }
    
    // Check if button already exists
    if (document.getElementById('path-view-mode')) return;
    
    console.log('Adding Path View button');
    
    // Create new button and insert between List and Adventure
    const pathViewButton = document.createElement('button');
    pathViewButton.id = 'path-view-mode';
    pathViewButton.className = 'view-mode-button';
    pathViewButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" class="view-icon">
            <path d="M3 3h18v18H3V3zm1 1v16h16V4H4zm4 4h8v1H8V8zm0 3h8v1H8v-1zm0 3h4v1H8v-1z"/>
        </svg>
        Path View
    `;
    
    // Insert before adventure mode button if it exists, otherwise append
    const adventureButton = document.getElementById('adventure-mode');
    if (adventureButton) {
        viewToggle.insertBefore(pathViewButton, adventureButton);
    } else {
        viewToggle.appendChild(pathViewButton);
    }
    
    // Add event listener
    pathViewButton.addEventListener('click', () => {
        if (window.questPathUI && typeof window.questPathUI.activatePathView === 'function') {
            window.questPathUI.activatePathView();
        } else {
            console.error('Quest path UI or activatePathView method not found');
        }
    });
};

// Helper to load CSS styles
const loadQuestPathStyles = () => {
    // Check if styles are already loaded
    if (document.getElementById('quest-path-styles')) return;
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.id = 'quest-path-styles';
    styleElement.textContent = `
        /* Quest Path View Styles */

        /* Path Selection Panel */
        #path-selection-panel {
            background: #fff;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .path-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .path-panel-header h3 {
            margin: 0;
            color: #4A2A1B;
        }

        .new-path-button {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 12px;
            background-color: #0E7C7B;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }

        .new-path-button:hover {
            background-color: #0a5b5a;
        }

        .path-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .path-button {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 16px;
            background-color: #F1DEBD;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
            color: #4A2A1B;
            font-weight: 500;
        }

        .path-button:hover {
            background-color: #e5d2b1;
            transform: translateY(-2px);
        }

        .path-button.has-progress {
            border-left: 4px solid #A2BC58;
        }

        .progress-indicator {
            display: inline-block;
            padding: 2px 8px;
            background-color: #4A2A1B;
            color: white;
            border-radius: 10px;
            font-size: 12px;
            margin-left: 8px;
        }
        
        /* View mode toggle button for paths */
        #path-view-mode {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            border: none;
            background: transparent;
            cursor: pointer;
            color: #4A2A1B;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        #path-view-mode.active {
            background: #4A2A1B;
            color: #F1DEBD;
        }

        #path-view-mode .view-icon {
            margin-right: 6px;
        }

        #path-view-mode.active .view-icon path {
            fill: #F1DEBD;
        }

        #path-view-mode:hover:not(.active) {
            background: rgba(74, 42, 27, 0.1);
        }
        
        /* More styles will load on demand when path view is activated */
    `;
    
    // Add to document head
    document.head.appendChild(styleElement);
};

// Helper function to ensure path selection panel exists
const ensurePathPanelExists = () => {
    if (document.getElementById('path-selection-panel')) return;
    
    const questContent = document.querySelector('#quest-system .content');
    if (!questContent) {
        console.error('Quest content container not found');
        return;
    }
    
    const pathPanel = document.createElement('div');
    pathPanel.id = 'path-selection-panel';
    pathPanel.className = 'path-selection-panel hidden';
    
    // Insert at the beginning of the content
    questContent.insertBefore(pathPanel, questContent.firstChild);
};

// Add a mini debug tool
const addDebugTool = () => {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug Path System';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '10px';
    debugButton.style.left = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.style.opacity = '0.3';
    debugButton.style.padding = '5px';
    debugButton.style.fontSize = '10px';
    
    debugButton.addEventListener('click', () => {
        const state = store.getState();
        console.log('Current state:', state);
        
        if (window.questPathSystem) {
            console.log('Paths:', window.questPathSystem.getPaths());
            console.log('Path progress:', state.pathProgress);
        }
        
        if (window.questProgressionSystem) {
            console.log('Visible quests:', window.questProgressionSystem.getVisibleQuests().length);
        }
        
        // Try to re-initialize
        if (window.questPathSystem) window.questPathSystem.initialize();
        if (window.questPathUI) window.questPathUI.initialize();
        
        alert('Debug info logged to console. Systems re-initialized.');
    });
    
    document.body.appendChild(debugButton);
};

// Make initialization function globally available
window.initializeQuestProgression = initializeQuestProgression;