// src/features/quests/questRolloutSystem.js

// Quest rollout system - controls visibility of quests based on progression
export const questRolloutSystem = {
    // Configuration
    initialQuestsPerType: 3, // Show this many quests of each type initially
    unlockPerCompletion: 2, // Unlock this many new quests after completion
    
    // Initialize the system
    initialize() {
        console.log('Initializing quest rollout system...');
        
        // Check if we've already initialized
        const state = window.store.getState();
        if (!state.visibleQuests || state.visibleQuests.length === 0) {
            this.initializeVisibleQuests();
        }
        
        // Extend quest system
        this.extendQuestSystem();
        
        // Add admin toggle
        this.addAdminToggle();
        
        // Force refresh of quest list with visibility applied
        if (window.questSystem && window.questSystem.showQuestList) {
            window.questSystem.showQuestList();
        }
        
        // Set initial admin mode to false to ensure filtering is applied
        window.store.updateState('adminMode', false);
    },
    
    // Set up initial visible quests
    initializeVisibleQuests() {
        // Group quests by type
        const questsByType = {
            'Training': window.QUEST_DATA.filter(q => q.type === 'Training'),
            'Main': window.QUEST_DATA.filter(q => q.type === 'Main'),
            'Side': window.QUEST_DATA.filter(q => q.type === 'Side'),
            'Explore': window.QUEST_DATA.filter(q => q.type === 'Explore')
        };
        
        // Get initial quests from each type
        let initialQuests = [];
        
        for (const [type, quests] of Object.entries(questsByType)) {
            // Sort by complexity (we'll use ID as a proxy for complexity for now)
            const sortedQuests = [...quests].sort((a, b) => a.id - b.id);
            // Take the first N quests of each type
            const typeInitialQuests = sortedQuests.slice(0, this.initialQuestsPerType);
            initialQuests = initialQuests.concat(typeInitialQuests);
        }
        
        // Save to state
        window.store.updateState('visibleQuests', initialQuests.map(q => q.id));
        
        console.log(`Initialized ${initialQuests.length} visible quests`);
    },
    
    // Extend the quest system
    extendQuestSystem() {
        // Only extend if not already extended
        if (window.questSystem._rolloutExtended) return;
        
        // Store original methods
        const originalGetFilteredQuests = window.questSystem.getFilteredQuests;
        const originalCompleteQuest = window.questSystem.completeQuest;
        
        // Override getFilteredQuests to only show visible quests
        window.questSystem.getFilteredQuests = function() {
            const allFilteredQuests = originalGetFilteredQuests.call(this);
            
            // If in admin mode, show all quests
            const state = window.store.getState();
            if (state.adminMode === true) {
                return allFilteredQuests;
            }
            
            // Get visible quests from state
            let visibleQuestIds = state.visibleQuests || [];
            
            // If no visible quests, initialize them
            if (visibleQuestIds.length === 0) {
                questRolloutSystem.initializeVisibleQuests();
                visibleQuestIds = window.store.getState().visibleQuests || [];
            }
            
            // Filter by visibility
            return allFilteredQuests.filter(quest => 
                visibleQuestIds.includes(quest.id)
            );
        };
        
        // Override completeQuest to unlock new quests
        window.questSystem.completeQuest = function(quest) {
            // Call original completion method first
            originalCompleteQuest.call(this, quest);
            
            // Then unlock new quests
            const newlyUnlockedQuests = questRolloutSystem.unlockQuestsAfterCompletion(quest.id);
            
            // Show notification about unlocked quests if any
            if (newlyUnlockedQuests && newlyUnlockedQuests.length > 0) {
                setTimeout(() => {
                    alert(`New quests unlocked: ${newlyUnlockedQuests.map(q => q.questName).join(', ')}`);
                }, 500); // Short delay for better UX
            }
            
            // Update UI
            this.showQuestList();
        };
        
        // Mark as extended
        window.questSystem._rolloutExtended = true;
        
        console.log('Quest system extended with rollout functionality');
    },
    
    // Add admin toggle to UI
    addAdminToggle() {
        const questCard = document.querySelector('.quest-card');
        if (!questCard || document.getElementById('admin-toggle')) return;
        
        const adminButton = document.createElement('button');
        adminButton.id = 'admin-toggle';
        adminButton.className = 'quest-button secondary';
        adminButton.style.position = 'absolute';
        adminButton.style.right = '10px';
        adminButton.style.bottom = '10px';
        adminButton.style.opacity = '0.3';
        adminButton.textContent = 'Admin';
        
        adminButton.addEventListener('click', function() {
            const state = window.store.getState();
            const newAdminMode = !state.adminMode;
            window.store.updateState('adminMode', newAdminMode);
            
            // Create or remove admin controls
            const oldControls = document.getElementById('admin-controls');
            if (oldControls) oldControls.remove();
            
            if (newAdminMode) {
                const controls = document.createElement('div');
                controls.id = 'admin-controls';
                controls.style.position = 'absolute';
                controls.style.right = '10px';
                controls.style.bottom = '40px';
                controls.style.background = '#f5f5f5';
                controls.style.padding = '10px';
                controls.style.borderRadius = '4px';
                controls.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                controls.style.zIndex = '100';
                
                controls.innerHTML = `
                    <p>Admin Controls</p>
                    <button id="unlock-all" class="quest-button secondary">Unlock All</button>
                    <button id="reset-quests" class="quest-button secondary">Reset</button>
                `;
                
                questCard.appendChild(controls);
                
                // Add event listeners
                document.getElementById('unlock-all').addEventListener('click', () => {
                    questRolloutSystem.unlockAllQuests();
                    window.questSystem.showQuestList();
                });
                
                document.getElementById('reset-quests').addEventListener('click', () => {
                    if (confirm('Reset all quest progression? This will hide most quests.')) {
                        questRolloutSystem.resetQuestProgression();
                        window.questSystem.showQuestList();
                    }
                });
            }
            
            // Update UI
            window.questSystem.showQuestList();
        });
        
        questCard.style.position = 'relative';
        questCard.appendChild(adminButton);
    },
    
    // Unlock new quests after completing a quest
    unlockQuestsAfterCompletion(completedQuestId) {
        const completedQuest = window.QUEST_DATA.find(q => q.id === completedQuestId);
        if (!completedQuest) return [];
        
        const state = window.store.getState();
        const visibleQuestIds = new Set(state.visibleQuests || []);
        const completedQuestIds = new Set(state.completedQuests.map(c => c.questId));
        
        // Find similar quests to the one that was completed (same type and focus)
        let similarQuests = window.QUEST_DATA.filter(q => 
            !visibleQuestIds.has(q.id) && // Not already visible
            !completedQuestIds.has(q.id) && // Not already completed
            q.type === completedQuest.type && // Same type
            (q.primaryFocus === completedQuest.primaryFocus || 
             q.secondaryFocus === completedQuest.primaryFocus) // Similar focus
        );
        
        // If not enough similar quests, find more of the same type
        if (similarQuests.length < this.unlockPerCompletion) {
            const sameTypeQuests = window.QUEST_DATA.filter(q => 
                !visibleQuestIds.has(q.id) && 
                !completedQuestIds.has(q.id) && 
                q.type === completedQuest.type &&
                !similarQuests.some(sq => sq.id === q.id)
            );
            
            similarQuests = similarQuests.concat(sameTypeQuests);
        }
        
        // Sort by ID as a proxy for complexity
        similarQuests.sort((a, b) => a.id - b.id);
        
        // Take the first N quests to unlock
        const questsToUnlock = similarQuests.slice(0, this.unlockPerCompletion);
        
        // Add to visible quests
        for (const quest of questsToUnlock) {
            visibleQuestIds.add(quest.id);
        }
        
        // Update state
        window.store.updateState('visibleQuests', Array.from(visibleQuestIds));
        
        // Return newly unlocked quests for notifications
        return questsToUnlock;
    },
    
    // Unlock all quests (admin function)
    unlockAllQuests() {
        window.store.updateState('visibleQuests', window.QUEST_DATA.map(q => q.id));
        console.log('All quests unlocked');
    },
    
    // Reset quest progression (admin function)
    resetQuestProgression() {
        window.store.updateState('visibleQuests', []);
        this.initializeVisibleQuests();
        console.log('Quest progression reset');
    }
};

// Export as global
window.questRolloutSystem = questRolloutSystem;