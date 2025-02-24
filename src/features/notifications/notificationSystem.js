import { store } from '../../core/state.js';
import { QUEST_DATA } from '../constants/quests.js';

export const notificationSystem = {
    initialized: false,

    async initialize() {
        if (this.initialized) return;

        if ('Notification' in window && 'serviceWorker' in navigator) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    const registration = await navigator.serviceWorker.ready;
                    this.initialized = true;
                    console.log('Notification system initialized');
                    
                    // Listen for messages from service worker
                    navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
                    
                    // Start periodic quest checks
                    this.startPeriodicChecks();
                }
            } catch (error) {
                console.error('Failed to initialize notifications:', error);
            }
        }
    },

    // Schedule a notification
    scheduleQuestNotification(questData, delay = 3600000) { // Default 1 hour
        if (!this.initialized) return;

        navigator.serviceWorker.ready.then(registration => {
            registration.active.postMessage({
                type: 'SCHEDULE_NOTIFICATION',
                delay,
                data: {
                    message: this.generateQuestMessage(questData),
                    questId: questData.id,
                    type: 'quest'
                }
            });
        });
    },

    // Generate random quest messages
    generateQuestMessage(questData) {
        const messages = [
            `Time to level up your ${questData.primaryFocus.toLowerCase()} skills!`,
            `A new ${questData.type} quest awaits in the kitchen!`,
            `Your next culinary adventure is ready!`,
            `Ready to tackle ${questData.questName}?`,
            `The kitchen calls - will you answer?`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    },

    // Show completion notification
    showCompletionNotification(quest) {
        if (!this.initialized) return;

        const message = {
            title: 'Quest Completed!',
            body: `You've completed ${quest.questName}`,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            data: {
                questId: quest.id,
                type: 'completion'
            }
        };

        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(message.title, message);
        });
    },

    // Start periodic checks for new quests
    startPeriodicChecks() {
        // Check every 4-8 hours
        const scheduleNextCheck = () => {
            const minDelay = 4 * 60 * 60 * 1000; // 4 hours
            const maxDelay = 8 * 60 * 60 * 1000; // 8 hours
            const delay = minDelay + Math.random() * (maxDelay - minDelay);

            setTimeout(() => {
                this.checkForNewQuests();
                scheduleNextCheck();
            }, delay);
        };

        // Initial check after 5 minutes
        setTimeout(() => {
            this.checkForNewQuests();
            scheduleNextCheck();
        }, 5 * 60 * 1000);
    },

    // Check for new appropriate quests
    checkForNewQuests() {
        const state = store.getState();
        const completedQuestIds = state.completedQuests.map(q => q.questId);
        
        // Get current rank based on minimum attribute hours
        const minHours = Math.min(...Object.values(state.attributeHours));
        const currentRank = this.getCurrentRank(minHours);

        // Filter available quests
        const availableQuests = QUEST_DATA.filter(quest => 
            !completedQuestIds.includes(quest.id) && 
            quest.rank === currentRank
        );

        // 30% chance to notify about a random available quest
        if (availableQuests.length > 0 && Math.random() < 0.3) {
            const randomQuest = availableQuests[Math.floor(Math.random() * availableQuests.length)];
            this.scheduleQuestNotification(randomQuest);
        }
    },

    // Get current rank name based on hours
    getCurrentRank(hours) {
        if (hours < 55) return 'Home Cook';
        if (hours < 209) return 'Culinary Student';
        if (hours < 530) return 'Kitchen Assistant';
        if (hours < 1177) return 'Line Cook';
        if (hours < 2500) return 'Sous Chef';
        return 'Head Chef';
    },

    // Handle messages from service worker
    handleServiceWorkerMessage(event) {
        if (event.data?.type === 'QUEST_NOTIFICATION_CLICKED') {
            const questId = event.data.questId;
            if (questId) {
                questSystem.showQuestDetails(QUEST_DATA.find(q => q.id === questId));
            }
        }
    }
};

// Initialize notification system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    notificationSystem.initialize();
});