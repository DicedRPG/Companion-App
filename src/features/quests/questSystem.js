// src/features/quests/questSystem.js
import { store } from '../../core/state.js';
import { QUEST_DATA, QUEST_TYPE_COLORS } from '../constants/quests.js';

export const questSystem = {
    currentQuest: null,
    currentFilter: 'all',
    pageSize: 10,
    currentPage: 1,
    expandedView: false,
    expandedQuestId: null,

    initialize() {
        console.log('Initializing quest system...');
        
        // Add event listeners
        const randomButton = document.getElementById('random-quest');
        const viewAllButton = document.getElementById('view-all-quests');
        
        if (randomButton) {
            randomButton.addEventListener('click', () => {
                console.log('Random quest button clicked');
                this.selectRandomQuest();
            });
        }
        
        if (viewAllButton) {
            viewAllButton.addEventListener('click', () => {
                console.log('View all button clicked');
                this.showQuestList();
            });
        }
        
        // Set up filter buttons
        this.setupFilterButtons();
        
        // Initial render
        this.showQuestList();
    },

    setupFilterButtons() {
        const filterContainer = document.getElementById('quest-filters');
        if (!filterContainer) return;
        
        // Clear existing filters
        filterContainer.innerHTML = '';
        
        // Create "All" filter button
        const allButton = document.createElement('button');
        allButton.className = `filter-button ${this.currentFilter === 'all' ? 'active' : ''}`;
        allButton.textContent = 'All Quests';
        allButton.addEventListener('click', () => this.setFilter('all'));
        filterContainer.appendChild(allButton);
        
        // Get unique quest types
        const questTypes = [...new Set(QUEST_DATA.map(q => q.type))];
        
        // Create filter buttons for each type
        questTypes.forEach(type => {
            const button = document.createElement('button');
            button.className = `filter-button ${this.currentFilter === type ? 'active' : ''}`;
            button.setAttribute('data-type', type);
            button.textContent = type;
            button.addEventListener('click', () => this.setFilter(type));
            filterContainer.appendChild(button);
        });
    },

    setFilter(filter) {
        this.currentFilter = filter;
        // Update active button styles
        const filterButtons = document.querySelectorAll('.filter-button');
        filterButtons.forEach(button => {
            button.classList.toggle('active', 
                button.textContent === (filter === 'all' ? 'All Quests' : filter));
        });
        // Refresh quest list with filter
        this.showQuestList();
    },

    getFilteredQuests() {
        if (this.currentFilter === 'all') return QUEST_DATA;
        return QUEST_DATA.filter(quest => quest.type === this.currentFilter);
    },

    selectRandomQuest() {
        const filteredQuests = this.getFilteredQuests();
        if (filteredQuests.length === 0) {
            alert('No quests available with the current filter');
            return;
        }
        const randomIndex = Math.floor(Math.random() * filteredQuests.length);
        this.showQuestDetails(filteredQuests[randomIndex]);
    },

    
    showQuestList() {
        const questList = document.getElementById('quest-list');
        if (!questList) return;
        
        const filteredQuests = this.getFilteredQuests();
        const totalQuests = filteredQuests.length;
        const displayQuests = this.expandedView ? 
            filteredQuests : 
            filteredQuests.slice(0, this.pageSize);
        
        questList.style.display = "block";
        questList.style.width = "100%";
        
        // Build quest list HTML
        questList.innerHTML = this.buildQuestListHTML(displayQuests, totalQuests);
    },

    buildQuestListHTML(displayQuests, totalQuests) {
        const state = store.getState();
        
        return `
            <div class="quest-container" style="width:100%; display:block;">
                <div class="quest-list-header" style="width:100%; display:block;">
                    <div class="quest-list-counts" style="width:100%; display:block;">
                        Showing ${displayQuests.length} of ${totalQuests} quests
                        ${this.currentFilter !== 'all' ? ` (filtered to ${this.currentFilter})` : ''}
                    </div>
                </div>
                
                ${displayQuests.length === 0 ? `
                    <div class="empty-state">
                        <p>No quests found for "${this.currentFilter}" filter</p>
                    </div>
                ` : `
                    <div class="quest-list-compact">
                        ${displayQuests.map(quest => this.buildQuestItemHTML(quest, state)).join('')}
                    </div>
                    
                    ${this.buildPaginationHTML(totalQuests)}
                `}
            </div>
        `;
    },

    buildQuestItemHTML(quest, state) {
        const completions = state.completedQuests.filter(c => c.questId === quest.id);
        const completionCount = completions.length;
        const questColor = QUEST_TYPE_COLORS[quest.type] || '#888888';
        const isExpanded = this.expandedQuestId === quest.id;
        
        return `
            <div class="quest-list-item ${completionCount > 0 ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}" 
                 data-quest-id="${quest.id}">
                <div class="quest-item-header" onclick="questSystem.toggleQuestDetails(${quest.id})">
                    <div class="quest-item-color" style="background-color: ${questColor}"></div>
                    <div class="quest-item-content">
                        <div class="quest-item-main">
                            <span class="quest-item-name">${quest.questName}</span>
                            <span class="quest-item-type">${quest.type}</span>
                        </div>
                        <div class="quest-item-details">
                            <span>${quest.primaryFocus} (${quest.primaryHours}h) / ${quest.secondaryFocus} (${quest.secondaryHours}h)</span>
                            ${quest.diceRequired ? 
                                `<span class="quest-dice-pill">🎲</span>` : ''}
                            ${completionCount > 0 ? 
                                `<span class="quest-completion-pill">✓${completionCount > 1 ? ` x${completionCount}` : ''}</span>` : ''}
                        </div>
                    </div>
                </div>
                ${isExpanded ? this.buildExpandedQuestHTML(quest, completions, questColor) : ''}
            </div>
        `;
    },

    buildExpandedQuestHTML(quest, completions, questColor) {
        const completionCount = completions.length;
        const lastCompletion = completions.length > 0 
            ? new Date(completions[completions.length - 1].completedAt)
            : null;

        return `
            <div class="quest-details-expanded">
                <div class="quest-header">
                    <div>
                        <p class="text-sm text-gray-600">
                            ${quest.rank} • 
                            <span class="quest-type-text" style="color: ${questColor}">${quest.type}</span>
                            ${completionCount > 0 ? `
                                <span class="completed-text">
                                    • Completed ${completionCount} time${completionCount > 1 ? 's' : ''}
                                    (Last: ${lastCompletion.toLocaleDateString()})
                                </span>
                            ` : ''}
                        </p>
                    </div>
                    ${quest.diceRequired ? `
                        <div class="quest-dice-required">
                            <span>🎲</span>
                            Dice Roll Required
                        </div>
                    ` : ''}
                </div>
                <p class="text-gray-700 mb-4">${quest.description}</p>
                <div class="quest-focus-grid">
                    <div class="focus-box primary">
                        <p class="text-sm font-semibold text-blue-700">Primary Focus</p>
                        <p class="text-lg">${quest.primaryFocus} • ${quest.primaryHours}h</p>
                    </div>
                    <div class="focus-box secondary">
                        <p class="text-sm font-semibold text-green-700">Secondary Focus</p>
                        <p class="text-lg">${quest.secondaryFocus} • ${quest.secondaryHours}h</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button 
                        onclick="questSystem.completeQuest(${JSON.stringify(quest).replace(/"/g, '&quot;')})"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Complete Quest
                    </button>
                </div>
            </div>
        `;
    },

    toggleQuestDetails(questId) {
        this.expandedQuestId = this.expandedQuestId === questId ? null : questId;
        this.showQuestList();
    },

    buildPaginationHTML(totalQuests) {
        if (!this.expandedView && totalQuests > this.pageSize) {
            return `
                <div class="see-more-container">
                    <button class="see-more-button" onclick="questSystem.toggleExpandView()">
                        See All Quests (${totalQuests})
                    </button>
                </div>
            `;
        }
        if (this.expandedView && totalQuests > this.pageSize) {
            return `
                <div class="see-more-container">
                    <button class="see-more-button" onclick="questSystem.toggleExpandView()">
                        Show Less
                    </button>
                </div>
            `;
        }
        return '';
    },

    // Simplify showQuestDetails to use window.questSystem directly
    // Correcting the "back to list" functionality
    showQuestDetails(quest) {
        const questList = document.getElementById('quest-list');
        const currentQuest = document.getElementById('current-quest');
        
        if (!questList || !currentQuest) return;
    
        const state = store.getState();
        const completions = state.completedQuests.filter(c => c.questId === quest.id);
        const completionCount = completions.length;
        const lastCompletion = completions.length > 0 
            ? new Date(completions[completions.length - 1].completedAt)
            : null;
        
        const questColor = QUEST_TYPE_COLORS[quest.type] || '#888888';
        
        currentQuest.innerHTML = `
            <div class="quest-details">
                <div class="quest-type-banner-large" style="background-color: ${questColor}"></div>
                <div class="quest-header">
                    <div>
                        <h4 class="text-xl font-bold mb-1">${quest.questName}</h4>
                        <p class="text-sm text-gray-600">
                            ${quest.rank} • <span class="quest-type-text" style="color: ${questColor}">${quest.type}</span>
                            ${completionCount > 0 ? `
                                <span class="completed-text">
                                    • Completed ${completionCount} time${completionCount > 1 ? 's' : ''}
                                    (Last: ${lastCompletion.toLocaleDateString()})
                                </span>
                            ` : ''}
                        </p>
                    </div>
                    ${quest.diceRequired ? `
                        <div class="quest-dice-required">
                            <span>🎲</span>
                            Dice Roll Required
                        </div>
                    ` : ''}
                </div>
                <p class="text-gray-700 mb-4">${quest.description}</p>
                <div class="quest-focus-grid">
                    <div class="focus-box primary">
                        <p class="text-sm font-semibold text-blue-700">Primary Focus</p>
                        <p class="text-lg">${quest.primaryFocus} • ${quest.primaryHours}h</p>
                    </div>
                    <div class="focus-box secondary">
                        <p class="text-sm font-semibold text-green-700">Secondary Focus</p>
                        <p class="text-lg">${quest.secondaryFocus} • ${quest.secondaryHours}h</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-between">
                    <button id="back-to-quest-list" 
                        class="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Back to List
                    </button>
                    <button 
                        onclick="window.questSystem.completeQuest(${JSON.stringify(quest).replace(/"/g, '&quot;')})"
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Complete Quest
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener after the HTML is rendered
        document.getElementById('back-to-quest-list').addEventListener('click', () => {
            questList.classList.remove('hidden');
            currentQuest.classList.add('hidden');
        });
        
        questList.classList.add('hidden');
        currentQuest.classList.remove('hidden');
    },

    toggleExpandView() {
        this.expandedView = !this.expandedView;
        this.showQuestList();
    },

    completeQuest(quest) {
        if (!quest) {
            console.error('No quest provided to complete');
            return;
        }

        // Confirm with user
        const confirmMessage = `Complete ${quest.questName}?\nThis will add:\n` +
            `${quest.primaryHours}h to ${quest.primaryFocus}\n` +
            `${quest.secondaryHours}h to ${quest.secondaryFocus}`;
        
        if (!confirm(confirmMessage)) return;

        // Add completion record
        const state = store.getState();
        const newCompletions = [
            ...state.completedQuests,
            {
                questId: quest.id,
                completedAt: new Date().toISOString()
            }
        ];
        store.updateState('completedQuests', newCompletions);

        // Add primary hours
        const primaryAttribute = quest.primaryFocus.toLowerCase();
        if (state.attributeHours.hasOwnProperty(primaryAttribute)) {
            store.updateState(
                `attributeHours.${primaryAttribute}`, 
                (state.attributeHours[primaryAttribute] || 0) + quest.primaryHours
            );
        }

        // Add secondary hours
        const secondaryAttribute = quest.secondaryFocus.toLowerCase();
        if (state.attributeHours.hasOwnProperty(secondaryAttribute)) {
            store.updateState(
                `attributeHours.${secondaryAttribute}`, 
                (state.attributeHours[secondaryAttribute] || 0) + quest.secondaryHours
            );
        }

        // Show completion message
        alert(`Quest completed! Hours added:\n` +
            `${quest.primaryHours}h to ${quest.primaryFocus}\n` +
            `${quest.secondaryHours}h to ${quest.secondaryFocus}`);

        // Add notification
        if (window.notificationSystem) {
        window.notificationSystem.showCompletionNotification(quest);
        } 

        // Return to quest list
        this.showQuestList();
    }
};

// Make questSystem globally available
window.questSystem = questSystem;