// src/features/progression/questProgressionSystem.js
import { store } from '../../core/state.js';
import { QUEST_DATA } from '../constants/quests.js';

export const questProgressionSystem = {
    // Configuration for quest unlocking
    initialQuestsPerType: 3, // Number of quests of each type to show initially
    unlockPerCompletion: 2, // How many new quests to unlock after completing one
    
    initialize() {
        console.log('Initializing quest progression system...');
        
        // If this is first-time setup, set up initial visible quests
        const state = store.getState();
        if (!state.visibleQuests || state.visibleQuests.length === 0) {
            this.initializeVisibleQuests();
        }
    },
    
    // Set up initial visible quests when app first loads
    initializeVisibleQuests() {
        // Group quests by type
        const questsByType = {
            'Training': QUEST_DATA.filter(q => q.type === 'Training'),
            'Main': QUEST_DATA.filter(q => q.type === 'Main'),
            'Side': QUEST_DATA.filter(q => q.type === 'Side'),
            'Explore': QUEST_DATA.filter(q => q.type === 'Explore')
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
        store.updateState('visibleQuests', initialQuests.map(q => q.id));
        
        console.log(`Initialized ${initialQuests.length} visible quests`);
    },
    
    // Get all visible quests
    getVisibleQuests() {
        const state = store.getState();
        const visibleQuestIds = state.visibleQuests || [];
        return QUEST_DATA.filter(quest => visibleQuestIds.includes(quest.id));
    },
    
    // Check if a quest is visible
    isQuestVisible(questId) {
        const state = store.getState();
        const visibleQuestIds = state.visibleQuests || [];
        return visibleQuestIds.includes(questId);
    },
    
    // Unlock new quests after completing a quest
    unlockQuestsAfterCompletion(completedQuestId) {
        const completedQuest = QUEST_DATA.find(q => q.id === completedQuestId);
        if (!completedQuest) return;
        
        const state = store.getState();
        const visibleQuestIds = new Set(state.visibleQuests || []);
        const completedQuestIds = new Set(state.completedQuests.map(c => c.questId));
        
        // Find similar quests to the one that was completed (same type and focus)
        let similarQuests = QUEST_DATA.filter(q => 
            !visibleQuestIds.has(q.id) && // Not already visible
            !completedQuestIds.has(q.id) && // Not already completed
            q.type === completedQuest.type && // Same type
            (q.primaryFocus === completedQuest.primaryFocus || 
             q.secondaryFocus === completedQuest.primaryFocus) // Similar focus
        );
        
        // If not enough similar quests, find more of the same type
        if (similarQuests.length < this.unlockPerCompletion) {
            const sameTypeQuests = QUEST_DATA.filter(q => 
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
        store.updateState('visibleQuests', Array.from(visibleQuestIds));
        
        // Return newly unlocked quests for notifications
        return questsToUnlock;
    },
    
    // Helper method to get all locked quests (for admin purposes)
    getLockedQuests() {
        const state = store.getState();
        const visibleQuestIds = state.visibleQuests || [];
        return QUEST_DATA.filter(quest => !visibleQuestIds.includes(quest.id));
    },
    
    // DEBUG: Unlock all quests (for testing)
    unlockAllQuests() {
        store.updateState('visibleQuests', QUEST_DATA.map(q => q.id));
    },
    
    // Reset quest visibility to initial state
    resetQuestProgression() {
        store.updateState('visibleQuests', []);
        this.initializeVisibleQuests();
    }
};

// Make progressionSystem globally available
window.questProgressionSystem = questProgressionSystem;