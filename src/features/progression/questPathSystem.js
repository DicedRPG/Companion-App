// src/features/progression/questPathSystem.js
import { store } from '../../core/state.js';
import { QUEST_DATA } from '../constants/quests.js';

// Quest paths data
export const QUEST_PATHS = [
    {
        id: "flavors-journey",
        name: "Journey of Flavors",
        description: "Master the fundamentals of flavor and learn how ingredients work together",
        primaryFocus: "Flavor",
        secondaryFocus: "Ingredients",
        icon: "🧂",
        color: "#FF7518", // Orange
        stages: [
            {
                id: "flavor-basics",
                name: "Flavor Foundations",
                description: "Learn the basic principles of flavor development",
                questIds: [7, 8, 15, 40, 77, 78], // IDs of Salt/Pepper/Acid, Herbs & Spices, etc.
                unlocksAfter: 2 // Unlocks next stage after 2 quests completed
            },
            {
                id: "flavor-application",
                name: "Flavor in Practice",
                description: "Apply flavor principles to actual dishes",
                questIds: [28, 55, 62, 63], // Basic Sauce, Curry, Vinaigrette, etc.
                unlocksAfter: 1
            },
            {
                id: "flavor-mastery",
                name: "Flavor Mastery",
                description: "Develop advanced flavor combinations and techniques",
                questIds: [31, 64, 105], // Restaurant Analysis, Specialty Market, etc.
                unlocksAfter: 1
            }
        ]
    },
    {
        id: "knife-skills",
        name: "Blade Master",
        description: "Develop precision and efficiency through mastering essential knife techniques",
        primaryFocus: "Technique",
        secondaryFocus: "Management",
        icon: "🔪",
        color: "#4169E1", // Royal Blue
        stages: [
            {
                id: "knife-basics",
                name: "Knife Foundations",
                description: "Master the fundamental knife grips and cuts",
                questIds: [1, 2, 72], // Basic Knife Skills I, II, and Sharpening
                unlocksAfter: 2
            },
            {
                id: "knife-application",
                name: "Practical Cutting",
                description: "Apply knife skills to various ingredients",
                questIds: [11, 12, 23, 24], // Vegetable ID, Protein Basics, etc.
                unlocksAfter: 2
            },
            {
                id: "knife-efficiency",
                name: "Speed and Precision",
                description: "Develop speed and consistency in your knife work",
                questIds: [9, 37, 102], // Mise en Place, Measuring, etc.
                unlocksAfter: 1
            }
        ]
    },
    {
        id: "cooking-methods",
        name: "Mastery of Heat",
        description: "Learn to control and utilize different cooking methods",
        primaryFocus: "Technique",
        secondaryFocus: "Flavor",
        icon: "🔥",
        color: "#DC143C", // Crimson
        stages: [
            {
                id: "heat-basics",
                name: "Heat Control",
                description: "Master the fundamentals of controlling heat",
                questIds: [3, 4, 5, 33, 34, 35], // Heat Control, Sautéing, Boiling, etc.
                unlocksAfter: 3
            },
            {
                id: "cooking-application",
                name: "Cooking Methods",
                description: "Apply different cooking methods to various ingredients",
                questIds: [36, 39, 69, 70, 71], // Braising, Temperatures, Meat and Fish
                unlocksAfter: 2
            },
            {
                id: "cooking-mastery",
                name: "Method Mastery",
                description: "Perfect advanced cooking techniques",
                questIds: [47, 49, 56, 57], // Roast Chicken, Fish Dinner, etc.
                unlocksAfter: 2
            }
        ]
    },
    {
        id: "kitchen-mgmt",
        name: "Kitchen Commander",
        description: "Develop systems and skills for efficient kitchen management",
        primaryFocus: "Management",
        secondaryFocus: "Technique",
        icon: "⏱️",
        color: "#228B22", // Forest Green
        stages: [
            {
                id: "kitchen-basics",
                name: "Kitchen Organization",
                description: "Master the basics of kitchen organization and safety",
                questIds: [9, 10, 13, 14], // Mise en Place, Safety, Pantry, Recipe Reading
                unlocksAfter: 2
            },
            {
                id: "kitchen-efficiency",
                name: "Kitchen Efficiency",
                description: "Develop skills for efficient meal preparation",
                questIds: [38, 44, 76, 103], // Meal Prep, Timing, Multitasking, etc.
                unlocksAfter: 2
            },
            {
                id: "kitchen-mastery",
                name: "Kitchen Mastery",
                description: "Perfect systems for complex meal management",
                questIds: [104, 119, 120, 121], // Leftovers, Meal Planning, etc.
                unlocksAfter: 2
            }
        ]
    }
];

export const questPathSystem = {
    initialize() {
        console.log('Initializing quest path system...');
        
        // Initialize path progress in state if not present
        const state = store.getState();
        if (!state.pathProgress) {
            store.updateState('pathProgress', this.createInitialPathProgress());
        }
        
        // Ensure all paths have progress data (in case new paths are added)
        this.ensureAllPathsHaveProgress();
    },
    
    // Create initial path progress data
    createInitialPathProgress() {
        const pathProgress = {};
        
        QUEST_PATHS.forEach(path => {
            pathProgress[path.id] = {
                started: false,
                currentStageId: path.stages[0].id,
                stageProgress: {}
            };
            
            // Initialize stage progress
            path.stages.forEach(stage => {
                pathProgress[path.id].stageProgress[stage.id] = {
                    questsCompleted: [],
                    completed: false,
                    unlocked: stage.id === path.stages[0].id // Only first stage is unlocked initially
                };
            });
        });
        
        return pathProgress;
    },
    
    // Ensure all paths have progress data (for backward compatibility)
    ensureAllPathsHaveProgress() {
        const state = store.getState();
        if (!state.pathProgress) return;
        
        let pathProgress = {...state.pathProgress};
        let needsUpdate = false;
        
        // Check each path
        QUEST_PATHS.forEach(path => {
            // If path doesn't exist in progress, add it
            if (!pathProgress[path.id]) {
                pathProgress[path.id] = {
                    started: false,
                    currentStageId: path.stages[0].id,
                    stageProgress: {}
                };
                needsUpdate = true;
            }
            
            // Check each stage
            path.stages.forEach(stage => {
                if (!pathProgress[path.id].stageProgress || !pathProgress[path.id].stageProgress[stage.id]) {
                    if (!pathProgress[path.id].stageProgress) {
                        pathProgress[path.id].stageProgress = {};
                    }
                    
                    pathProgress[path.id].stageProgress[stage.id] = {
                        questsCompleted: [],
                        completed: false,
                        unlocked: stage.id === path.stages[0].id
                    };
                    needsUpdate = true;
                }
            });
        });
        
        // Update state if changes were made
        if (needsUpdate) {
            store.updateState('pathProgress', pathProgress);
        }
    },
    
    // Get all available paths
    getPaths() {
        return QUEST_PATHS;
    },
    
    // Get a specific path by ID
    getPathById(pathId) {
        return QUEST_PATHS.find(path => path.id === pathId);
    },
    
    // Get progress for a specific path
    getPathProgress(pathId) {
        const state = store.getState();
        if (!state.pathProgress || !state.pathProgress[pathId]) {
            return null;
        }
        return state.pathProgress[pathId];
    },
    
    // Get all unlocked path stages
    getUnlockedStages(pathId) {
        const pathProgress = this.getPathProgress(pathId);
        if (!pathProgress) return [];
        
        const path = this.getPathById(pathId);
        if (!path) return [];
        
        return path.stages.filter(stage => 
            pathProgress.stageProgress[stage.id] && 
            pathProgress.stageProgress[stage.id].unlocked
        );
    },
    
    // Start a path
    startPath(pathId) {
        const path = this.getPathById(pathId);
        if (!path) return false;
        
        const state = store.getState();
        const pathProgress = state.pathProgress || this.createInitialPathProgress();
        
        // Mark path as started
        pathProgress[pathId].started = true;
        
        // Ensure first stage is unlocked
        const firstStage = path.stages[0];
        pathProgress[pathId].stageProgress[firstStage.id].unlocked = true;
        
        // Update state
        store.updateState('pathProgress', pathProgress);
        
        // Make sure quests for first stage are visible
        this.unlockQuestsForStage(pathId, firstStage.id);
        
        return true;
    },
    
    // Unlock quests for a specific stage
    unlockQuestsForStage(pathId, stageId) {
        const path = this.getPathById(pathId);
        if (!path) return;
        
        const stage = path.stages.find(s => s.id === stageId);
        if (!stage) return;
        
        const state = store.getState();
        let visibleQuestIds = new Set(state.visibleQuests || []);
        
        // Add all quests from this stage
        stage.questIds.forEach(questId => {
            visibleQuestIds.add(questId);
        });
        
        // Update visible quests
        store.updateState('visibleQuests', Array.from(visibleQuestIds));
    },
    
    // Helper method to check if a quest is in any path
    isQuestInPaths(questId) {
        for (const path of QUEST_PATHS) {
            for (const stage of path.stages) {
                if (stage.questIds.includes(questId)) {
                    return true;
                }
            }
        }
        return false;
    },
    
    // Helper method to check if a quest is visible
    isQuestVisible(questId) {
        const state = store.getState();
        const visibleQuestIds = state.visibleQuests || [];
        return visibleQuestIds.includes(questId);
    },
    
    // Check for stage completion based on quest completion
    updatePathProgressForQuest(questId) {
        const state = store.getState();
        const completedQuestIds = state.completedQuests.map(c => c.questId);
        let pathProgress = {...state.pathProgress};
        let progressUpdated = false;
        
        // Ensure path progress is initialized
        if (!pathProgress || Object.keys(pathProgress).length === 0) {
            pathProgress = this.createInitialPathProgress();
            progressUpdated = true;
        }
        
        // For each path
        QUEST_PATHS.forEach(path => {
            // Check if path progress exists, create if needed
            if (!pathProgress[path.id]) {
                pathProgress[path.id] = {
                    started: false,
                    currentStageId: path.stages[0].id,
                    stageProgress: {}
                };
                
                path.stages.forEach(stage => {
                    pathProgress[path.id].stageProgress[stage.id] = {
                        questsCompleted: [],
                        completed: false,
                        unlocked: stage.id === path.stages[0].id
                    };
                });
                
                progressUpdated = true;
            }
            
            // Skip paths that haven't been started
            if (!pathProgress[path.id].started) return;
            
            // Check each stage
            path.stages.forEach((stage, stageIndex) => {
                // Ensure stage progress exists
                if (!pathProgress[path.id].stageProgress[stage.id]) {
                    pathProgress[path.id].stageProgress[stage.id] = {
                        questsCompleted: [],
                        completed: false,
                        unlocked: stage.id === path.stages[0].id
                    };
                    progressUpdated = true;
                }
                
                const stageProgress = pathProgress[path.id].stageProgress[stage.id];
                
                // If stage is unlocked but not completed
                if (stageProgress.unlocked && !stageProgress.completed) {
                    // Check if the completed quest is in this stage
                    if (stage.questIds.includes(questId)) {
                        // Add to stage progress if not already there
                        if (!stageProgress.questsCompleted.includes(questId)) {
                            stageProgress.questsCompleted.push(questId);
                            progressUpdated = true;
                        }
                        
                        // Check if stage is now complete
                        if (stageProgress.questsCompleted.length >= stage.unlocksAfter) {
                            stageProgress.completed = true;
                            
                            // Unlock next stage if available
                            if (stageIndex < path.stages.length - 1) {
                                const nextStage = path.stages[stageIndex + 1];
                                pathProgress[path.id].stageProgress[nextStage.id].unlocked = true;
                                
                                // Update current stage
                                pathProgress[path.id].currentStageId = nextStage.id;
                                
                                // Unlock quests for next stage
                                this.unlockQuestsForStage(path.id, nextStage.id);
                                
                                // Notify user
                                setTimeout(() => {
                                    alert(`New stage unlocked in the ${path.name} path: ${nextStage.name}`);
                                }, 800);
                            }
                        }
                    }
                }
            });
        });
        
        // Update state if changes were made
        if (progressUpdated) {
            store.updateState('pathProgress', pathProgress);
        }
        
        return progressUpdated;
    },
    
    // Get all quests for a path
    getQuestsForPath(pathId) {
        const path = this.getPathById(pathId);
        if (!path) return [];
        
        const questIds = [];
        path.stages.forEach(stage => {
            questIds.push(...stage.questIds);
        });
        
        return questIds.map(id => QUEST_DATA.find(q => q.id === id)).filter(q => q);
    },
    
    // Get quests for a specific stage
    getQuestsForStage(pathId, stageId) {
        const path = this.getPathById(pathId);
        if (!path) return [];
        
        const stage = path.stages.find(s => s.id === stageId);
        if (!stage) return [];
        
        return stage.questIds.map(id => QUEST_DATA.find(q => q.id === id)).filter(q => q);
    },
    
    // Calculate completion percentage for a path
    getPathCompletionPercentage(pathId) {
        const path = this.getPathById(pathId);
        if (!path) return 0;
        
        const pathProgress = this.getPathProgress(pathId);
        if (!pathProgress) return 0;
        
        // Count total quests and completed quests
        let totalQuests = 0;
        let completedQuests = 0;
        
        path.stages.forEach(stage => {
            totalQuests += stage.questIds.length;
            if (pathProgress.stageProgress && pathProgress.stageProgress[stage.id]) {
                completedQuests += pathProgress.stageProgress[stage.id].questsCompleted.length;
            }
        });
        
        return totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
    },
    
    // Reset all path progress
    resetAllPathProgress() {
        store.updateState('pathProgress', this.createInitialPathProgress());
    }
};

// Make questPathSystem globally available
window.questPathSystem = questPathSystem;