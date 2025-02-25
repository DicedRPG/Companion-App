// src/features/quests/questSystemExtension.js
import { store } from '../../core/state.js';
import { questProgressionSystem } from '../progression/questProgressionSystem.js';

// Extension methods for the questSystem
export const extendQuestSystem = (questSystem) => {
    // Original method references to preserve
    const originalGetFilteredQuests = questSystem.getFilteredQuests;
    const originalCompleteQuest = questSystem.completeQuest;
    
    // Override getFilteredQuests to only show visible quests
    questSystem.getFilteredQuests = function() {
        const allFilteredQuests = originalGetFilteredQuests.call(this);
        
        // If in admin mode, show all quests
        if (store.getState().adminMode) {
            return allFilteredQuests;
        }
        
        // Get visible quests from state or initialize if empty
        const state = store.getState();
        let visibleQuestIds = state.visibleQuests || [];
        
        // If no visible quests, initialize them (first-time user)
        if (visibleQuestIds.length === 0 && window.questProgressionSystem) {
            questProgressionSystem.initializeVisibleQuests();
            visibleQuestIds = store.getState().visibleQuests || [];
        }
        
        // Filter by visibility
        return allFilteredQuests.filter(quest => 
            visibleQuestIds.includes(quest.id)
        );
    };
    
    // Override completeQuest to unlock new quests
    questSystem.completeQuest = function(quest) {
        // Call original completion method first
        originalCompleteQuest.call(this, quest);
        
        try {
            // Then unlock new quests
            let newlyUnlockedQuests = [];
            if (window.questProgressionSystem) {
                newlyUnlockedQuests = questProgressionSystem.unlockQuestsAfterCompletion(quest.id) || [];
            }
            
            // Update quest path progress if applicable
            if (window.questPathSystem) {
                try {
                    window.questPathSystem.updatePathProgressForQuest(quest.id);
                } catch (error) {
                    console.error('Error updating path progress:', error);
                }
            }
            
            // Show notification about unlocked quests if any
            if (newlyUnlockedQuests.length > 0) {
                setTimeout(() => {
                    alert(`New quests unlocked: ${newlyUnlockedQuests.map(q => q.questName).join(', ')}`);
                }, 500); // Short delay for better UX
            }
        } catch (error) {
            console.error('Error in quest completion extension:', error);
        }
        
        // Update UI
        this.showQuestList();
    };
    
    // Add method to toggle admin mode
    questSystem.toggleAdminMode = function() {
        const currentState = store.getState();
        const newAdminMode = !currentState.adminMode;
        
        store.updateState('adminMode', newAdminMode);
        
        // Update UI
        this.showQuestList();
        
        return newAdminMode;
    };
    
    // Add admin controls to UI
    questSystem.addAdminControls = function() {
        const questCard = document.querySelector('.quest-card');
        if (!questCard) return;
        
        // Create admin button if it doesn't exist
        if (!document.getElementById('admin-mode-toggle')) {
            const adminButton = document.createElement('button');
            adminButton.id = 'admin-mode-toggle';
            adminButton.className = 'quest-button secondary';
            adminButton.style.position = 'absolute';
            adminButton.style.right = '10px';
            adminButton.style.bottom = '10px';
            adminButton.style.opacity = '0.3';
            adminButton.textContent = 'Admin';
            adminButton.addEventListener('click', () => {
                const isAdmin = this.toggleAdminMode();
                const adminControls = document.getElementById('admin-controls');
                
                if (isAdmin) {
                    // Show admin controls
                    if (!adminControls) {
                        const controls = document.createElement('div');
                        controls.id = 'admin-controls';
                        controls.className = 'admin-controls';
                        controls.style.position = 'absolute';
                        controls.style.right = '10px';
                        controls.style.bottom = '40px';
                        controls.style.background = '#f5f5f5';
                        controls.style.padding = '10px';
                        controls.style.borderRadius = '4px';
                        controls.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        controls.style.zIndex = '10';
                        
                        controls.innerHTML = `
                            <button id="unlock-all-quests" class="quest-button secondary">Unlock All Quests</button>
                            <button id="reset-quests" class="quest-button secondary">Reset Quest Progression</button>
                            <button id="init-paths" class="quest-button secondary">Initialize Path System</button>
                        `;
                        
                        questCard.appendChild(controls);
                        
                        // Add event listeners
                        document.getElementById('unlock-all-quests').addEventListener('click', () => {
                            if (window.questProgressionSystem) {
                                questProgressionSystem.unlockAllQuests();
                                this.showQuestList();
                            }
                        });
                        
                        document.getElementById('reset-quests').addEventListener('click', () => {
                            if (confirm('Reset all quest progression? This will hide most quests.')) {
                                if (window.questProgressionSystem) {
                                    questProgressionSystem.resetQuestProgression();
                                    this.showQuestList();
                                }
                            }
                        });
                        
                        document.getElementById('init-paths').addEventListener('click', () => {
                            if (window.questPathSystem) {
                                window.questPathSystem.initialize();
                                if (window.questPathUI) {
                                    window.questPathUI.initialize();
                                }
                                alert('Path system re-initialized');
                            }
                        });
                    } else {
                        adminControls.style.display = 'block';
                    }
                } else if (adminControls) {
                    // Hide admin controls
                    adminControls.style.display = 'none';
                }
            });
            
            // Add to quest card
            questCard.style.position = 'relative';
            questCard.appendChild(adminButton);
        }
    };
    
    // Add method to show quest progression status
    questSystem.showQuestProgressionStatus = function() {
        if (!window.questProgressionSystem) return;
        
        const visibleQuests = questProgressionSystem.getVisibleQuests();
        const lockedQuests = questProgressionSystem.getLockedQuests();
        
        console.log(`Quest Progression Status:
- Visible: ${visibleQuests.length}
- Locked: ${lockedQuests.length}
- Total: ${visibleQuests.length + lockedQuests.length}`);
    };
    
    return questSystem;
};