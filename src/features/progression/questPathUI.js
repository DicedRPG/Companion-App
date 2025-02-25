// src/features/progression/questPathUI.js
import { questPathSystem, QUEST_PATHS } from './questPathSystem.js';
import { store } from '../../core/state.js';
import { QUEST_DATA } from '../constants/quests.js';

export const questPathUI = {
    activePathId: null,

    initialize() {
        console.log('Initializing quest path UI...');
        
        // Set up event listeners for path selection panel
        this.setupPathPanelListeners();
        
        // Show available paths
        this.showAvailablePaths();
    },
    
    setupPathPanelListeners() {
        // Listen for view mode changes
        const pathButton = document.getElementById('path-view-mode');
        const listButton = document.getElementById('list-view-mode');
        const adventureButton = document.getElementById('adventure-mode');
        
        if (pathButton && listButton) {
            pathButton.addEventListener('click', () => {
                this.activatePathView();
            });
            
            listButton.addEventListener('click', () => {
                this.deactivatePathView();
            });
            
            // Handle adventure mode button if it exists
            if (adventureButton) {
                adventureButton.addEventListener('click', () => {
                    this.deactivatePathView();
                });
            }
        }
    },
    
    activatePathView() {
        // Get elements
        const pathPanel = document.getElementById('path-selection-panel');
        const questList = document.getElementById('quest-list');
        const currentQuest = document.getElementById('current-quest');
        const adventureMap = document.getElementById('adventure-map');
        
        // Update view mode buttons
        const pathButton = document.getElementById('path-view-mode');
        const listButton = document.getElementById('list-view-mode');
        const adventureButton = document.getElementById('adventure-mode');
        
        if (pathButton) pathButton.classList.add('active');
        if (listButton) listButton.classList.remove('active');
        if (adventureButton) adventureButton.classList.remove('active');
        
        // Show path panel, hide other views
        if (pathPanel) pathPanel.classList.remove('hidden');
        if (questList) questList.classList.add('hidden');
        if (currentQuest) currentQuest.classList.add('hidden');
        if (adventureMap) adventureMap.classList.add('hidden');
        
        // Show available paths
        this.showAvailablePaths();
    },
    
    deactivatePathView() {
        // Hide path panel
        const pathPanel = document.getElementById('path-selection-panel');
        if (pathPanel) pathPanel.classList.add('hidden');
        
        // Update button state
        const pathButton = document.getElementById('path-view-mode');
        if (pathButton) pathButton.classList.remove('active');
    },
    
    showAvailablePaths() {
        const pathPanel = document.getElementById('path-selection-panel');
        if (!pathPanel) return;
        
        const paths = questPathSystem.getPaths();
        const state = store.getState();
        const pathProgress = state.pathProgress || {};
        
        // Build HTML
        let html = `
            <div class="path-panel-header">
                <h3>Quest Paths</h3>
                <button id="new-path-button" class="new-path-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" class="quest-icon">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Show Info
                </button>
            </div>
            <div class="path-buttons">
        `;
        
        // Add button for each path
        paths.forEach(path => {
            const progress = pathProgress[path.id] || { started: false };
            const completionPercentage = questPathSystem.getPathCompletionPercentage(path.id);
            
            html += `
                <button class="path-button ${progress.started ? 'has-progress' : ''}" data-path-id="${path.id}">
                    <span>${path.icon} ${path.name}</span>
                    ${progress.started ? `<span class="progress-indicator">${completionPercentage}%</span>` : ''}
                </button>
            `;
        });
        
        html += `</div>`;
        
        // Set content
        pathPanel.innerHTML = html;
        
        // Add event listeners
        const newPathButton = document.getElementById('new-path-button');
        if (newPathButton) {
            newPathButton.addEventListener('click', () => {
                this.showPathInfoDialog();
            });
        }
        
        // Add click listeners for path buttons
        document.querySelectorAll('.path-button').forEach(button => {
            button.addEventListener('click', () => {
                const pathId = button.getAttribute('data-path-id');
                this.showPathDetails(pathId);
            });
        });
    },
    
    showPathInfoDialog() {
        // Create a dialog to explain quest paths
        const dialog = document.createElement('div');
        dialog.className = 'new-path-dialog';
        dialog.innerHTML = `
            <div class="new-path-dialog-content">
                <h3>Quest Paths</h3>
                <p>Quest Paths are themed journeys that guide you through related culinary skills. Each path focuses on specific attributes and has multiple stages.</p>
                
                <h4>Benefits of Quest Paths:</h4>
                <ul>
                    <li>Structured learning progression</li>
                    <li>Focus on specific skill areas</li>
                    <li>Unlock new content as you complete stages</li>
                    <li>Track your progress in each culinary discipline</li>
                </ul>
                
                <p>Select a path to begin your journey, or continue an existing path. You can work on multiple paths simultaneously.</p>
                
                <button class="cancel-button">Close</button>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(dialog);
        
        // Add event listener to close button
        dialog.querySelector('.cancel-button').addEventListener('click', () => {
            dialog.remove();
        });
    },
    
    showPathDetails(pathId) {
        // Update active path
        this.activePathId = pathId;
        
        // Get path data
        const path = questPathSystem.getPathById(pathId);
        if (!path) return;
        
        // Get path progress
        const pathProgress = questPathSystem.getPathProgress(pathId);
        const completionPercentage = questPathSystem.getPathCompletionPercentage(pathId);
        
        // Get quest list element
        const questList = document.getElementById('quest-list');
        if (!questList) return;
        
        // Build path details HTML
        let html = `
            <div class="path-details">
                <div class="path-header" style="border-color: ${path.color}">
                    <div class="path-icon" style="background-color: ${path.color}">${path.icon}</div>
                    <div class="path-info">
                        <h3>${path.name}</h3>
                        <p>${path.description}</p>
                        <div class="path-attributes">
                            <span class="path-attribute primary">${path.primaryFocus}</span>
                            <span class="path-attribute secondary">${path.secondaryFocus}</span>
                        </div>
                    </div>
                </div>
                
                <div class="path-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercentage}%; background-color: ${path.color}"></div>
                    </div>
                    <div class="progress-text">${completionPercentage}% complete</div>
                </div>
                
                <div class="path-stages">
        `;
        
        // Add each stage
        path.stages.forEach((stage, index) => {
            const stageProgress = pathProgress.stageProgress[stage.id];
            const isUnlocked = stageProgress && stageProgress.unlocked;
            const isCompleted = stageProgress && stageProgress.completed;
            const isCurrent = pathProgress.currentStageId === stage.id;
            
            html += `
                <div class="path-stage ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                    <div class="stage-header">
                        <div class="stage-indicator">
                            ${isCompleted ? '✓' : (index + 1)}
                        </div>
                        <div class="stage-info">
                            <h4>${stage.name}</h4>
                            <p>${stage.description}</p>
                        </div>
                    </div>
                    
                    ${isUnlocked ? `
                        <div class="stage-quests">
                            ${this.buildStageQuestsList(pathId, stage.id)}
                        </div>
                    ` : `
                        <div class="stage-locked-message">
                            <p>Complete previous stage to unlock</p>
                        </div>
                    `}
                </div>
            `;
        });
        
        html += `
                </div>
                
                <div class="path-actions">
                    ${!pathProgress.started ? `
                        <button id="start-path-button" class="start-path-button" style="background-color: ${path.color}">Begin Journey</button>
                    ` : `
                        <button id="back-to-paths-button" class="back-to-paths-button">Back to All Paths</button>
                    `}
                </div>
            </div>
        `;
        
        // Set content
        questList.innerHTML = html;
        questList.style.display = 'block';
        questList.classList.remove('quest-grid');
        questList.classList.add('path-view');
        
        // Add event listeners
        const startButton = document.getElementById('start-path-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                questPathSystem.startPath(pathId);
                this.showPathDetails(pathId); // Refresh the view
            });
        }
        
        const backButton = document.getElementById('back-to-paths-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showAvailablePaths();
                questList.classList.remove('path-view');
                questList.classList.add('quest-grid');
                window.questSystem.showQuestList();
            });
        }
        
        // Add click handlers for quest items
        document.querySelectorAll('.path-quest-item').forEach(item => {
            item.addEventListener('click', () => {
                const questId = parseInt(item.getAttribute('data-quest-id'), 10);
                const quest = QUEST_DATA.find(q => q.id === questId);
                if (quest) {
                    window.questSystem.showQuestDetails(quest);
                }
            });
        });
    },
    
    buildStageQuestsList(pathId, stageId) {
        // Get quests for this stage
        const quests = questPathSystem.getQuestsForStage(pathId, stageId);
        if (!quests || quests.length === 0) return '<p>No quests available</p>';
        
        // Get state info
        const state = store.getState();
        const completedQuestIds = state.completedQuests.map(c => c.questId);
        
        // Build quest list HTML
        let html = `<div class="stage-quests-list">`;
        
        quests.forEach(quest => {
            const isCompleted = completedQuestIds.includes(quest.id);
            const isVisible = questPathSystem.isQuestVisible
                ? questPathSystem.isQuestVisible(quest.id)
                : true; // Fallback
            
            html += `
                <div class="path-quest-item ${isCompleted ? 'completed' : ''} ${!isVisible ? 'unavailable' : ''}"
                     data-quest-id="${quest.id}">
                    <div class="quest-status-icon">
                        ${isCompleted ? '✓' : (isVisible ? '!' : '🔒')}
                    </div>
                    <div class="path-quest-info">
                        <div class="path-quest-name">${quest.questName}</div>
                        <div class="path-quest-focus">
                            ${quest.primaryFocus} (${quest.primaryHours}h) / 
                            ${quest.secondaryFocus} (${quest.secondaryHours}h)
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        return html;
    }
};