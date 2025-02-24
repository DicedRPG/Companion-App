// Import store for state management
import { store } from '../../core/state.js';

// Rank definitions
export const RANKS = [
    { name: 'Home Cook', hoursNeeded: 55, totalHoursNeeded: 220, color: '#CD7F32' },  // Bronze
    { name: 'Culinary Student', hoursNeeded: 209, totalHoursNeeded: 836, color: '#43464B' },  // Iron
    { name: 'Kitchen Assistant', hoursNeeded: 530, totalHoursNeeded: 2120, color: '#C0C0C0' },  // Silver
    { name: 'Line Cook', hoursNeeded: 1177, totalHoursNeeded: 4708, color: '#FFD700' },  // Gold
    { name: 'Sous Chef', hoursNeeded: 2500, totalHoursNeeded: 10000, color: '#E5E4E2' },  // Platinum
    { name: 'Head Chef', hoursNeeded: Infinity, totalHoursNeeded: Infinity, color: '#FF1493' }  // Master
];

// Level definitions
export const LEVELS = [
    {
        rank: 'Home Cook',
        levels: [
            { level: 1, hours: 5, startAt: 0 },
            { level: 2, hours: 5, startAt: 5 },
            { level: 3, hours: 5, startAt: 10 },
            { level: 4, hours: 5, startAt: 15 },
            { level: 5, hours: 5, startAt: 20 },
            { level: 6, hours: 6, startAt: 25 },
            { level: 7, hours: 7, startAt: 31 },
            { level: 8, hours: 8, startAt: 38 },
            { level: 9, hours: 9, startAt: 46 }
        ]
    }
    // Add other rank levels as needed
];

// Helper function to get rank color name
export function getRankColor(hexColor) {
    const colors = {
        '#CD7F32': 'Bronze',  // Home Cook
        '#43464B': 'Iron',    // Culinary Student
        '#C0C0C0': 'Silver',  // Kitchen Assistant
        '#FFD700': 'Gold',    // Line Cook
        '#E5E4E2': 'Platinum', // Sous Chef
        '#FF1493': 'Rainbow'   // Head Chef
    };
    return colors[hexColor] || 'Unknown';
}

// Helper function to find attribute cards
function findAttributeCard(attribute) {
    const cards = document.querySelectorAll('.attribute-card');
    return Array.from(cards).find(card => {
        const header = card.querySelector('h3');
        return header && header.textContent.toLowerCase() === attribute;
    });
}

// Calculate level for a specific attribute
export function calculateLevel(totalHours) {
    const state = store.getState();
    const minHours = Math.min(...Object.values(state.attributeHours));
    
    // Find minimum rank based on hours
    let minRank = RANKS[0];
    for (const rank of RANKS) {
        if (minHours < rank.hoursNeeded) {
            minRank = rank;
            break;
        }
    }

    // Gate progress if needed
    if (totalHours > minRank.hoursNeeded) {
        totalHours = minRank.hoursNeeded;
    }

    // Find current rank
    let currentRank = RANKS[RANKS.length - 1];
    for (const rank of RANKS) {
        if (totalHours < rank.hoursNeeded) {
            currentRank = rank;
            break;
        }
    }

    // Find level within rank
    const rankConfig = LEVELS.find(r => r.rank === currentRank.name);
    if (!rankConfig) return null;

    for (let i = 0; i < rankConfig.levels.length; i++) {
        const level = rankConfig.levels[i];
        const nextLevel = rankConfig.levels[i + 1];
        
        if (!nextLevel || totalHours < nextLevel.startAt) {
            const hoursIntoLevel = totalHours - level.startAt;
            const isExactlyAtRankStart = totalHours === level.startAt;
            
            return {
                rank: currentRank.name,
                level: level.level,
                currentLevelHours: isExactlyAtRankStart ? 0 : hoursIntoLevel,
                hoursForLevel: level.hours,
                totalHours: totalHours,
                color: currentRank.color,
                isGated: totalHours === minRank.hoursNeeded && totalHours > minRank.hoursNeeded,
                maxAllowedHours: minRank.hoursNeeded,
                isExactlyAtRankStart: isExactlyAtRankStart
            };
        }
    }
}

// Calculate overall rank
export function calculateOverallRank() {
    const state = store.getState();
    const minAttributeHours = Math.min(...Object.values(state.attributeHours));
    const totalHours = Object.values(state.attributeHours).reduce((sum, hours) => sum + hours, 0);
    
    // Find current rank
    let currentRank = RANKS[0];
    let previousRankTotal = 0;
    
    for (const rank of RANKS) {
        if (minAttributeHours < rank.hoursNeeded) {
            currentRank = rank;
            break;
        }
        previousRankTotal = rank.totalHoursNeeded;
    }
    
    return {
        name: currentRank.name,
        color: currentRank.color,
        totalHours: totalHours,
        currentRankHours: Math.max(0, totalHours - previousRankTotal),
        nextRankHours: currentRank.totalHoursNeeded - previousRankTotal,
        progress: ((totalHours - previousRankTotal) / (currentRank.totalHoursNeeded - previousRankTotal)) * 100
    };
}

// Update UI displays
export function updateDisplay() {
    // Update overall rank display
    const overallRank = calculateOverallRank();
    const overallRankElement = document.getElementById('overall-rank');
    if (overallRankElement) {
        overallRankElement.textContent = `${overallRank.name} (${getRankColor(overallRank.color)})`;
    }

    const overallHoursElement = document.getElementById('overall-hours');
    if (overallHoursElement) {
        overallHoursElement.textContent = overallRank.totalHours.toFixed(1);
    }

    const overallNextRankElement = document.getElementById('overall-next-rank');
    if (overallNextRankElement) {
        overallNextRankElement.textContent = overallRank.nextRankHours.toFixed(1);
    }

    // Update progress bar
    const overallProgressBar = document.querySelector('.overall-rank-card .progress-fill');
    if (overallProgressBar) {
        overallProgressBar.style.width = `${Math.min(overallRank.progress, 100)}%`;
        overallProgressBar.style.backgroundColor = overallRank.color;
    }

    // Update each attribute
    ['technique', 'ingredients', 'flavor', 'management'].forEach(attribute => {
        const hours = store.getState().attributeHours[attribute] || 0;
        const levelInfo = calculateLevel(hours);
        
        if (levelInfo) {
            // Update hours display
            const hoursElement = document.getElementById(`${attribute}-hours`);
            if (hoursElement) {
                hoursElement.textContent = levelInfo.currentLevelHours.toFixed(1);
            }
            
            // Update next level display
            const nextLevelElement = document.getElementById(`${attribute}-next-level`);
            if (nextLevelElement) {
                nextLevelElement.textContent = levelInfo.hoursForLevel;
            }
            
            // Update level display
            const levelElement = document.getElementById(`${attribute}-level`);
            if (levelElement) {
                levelElement.textContent = levelInfo.level;
            }
            
            // Find and update the attribute card
            const card = findAttributeCard(attribute);
            if (card) {
                // Update rank display
                const rankDisplay = card.querySelector('.stats p:first-child');
                if (rankDisplay) {
                    rankDisplay.textContent = `Current Rank: ${levelInfo.rank}`;
                }
                
                // Update progress bar
                const progressFill = card.querySelector('.progress-fill');
                if (progressFill) {
                    const progressPercent = levelInfo.isExactlyAtRankStart ? 0 :
                        (levelInfo.currentLevelHours / levelInfo.hoursForLevel * 100);
                    progressFill.style.width = `${Math.min(progressPercent, 100)}%`;
                    progressFill.style.backgroundColor = levelInfo.color;
                }

                // Update or add gating warning if needed
                let warningDiv = card.querySelector('.gated-warning');
                if (levelInfo.isGated) {
                    if (!warningDiv) {
                        warningDiv = document.createElement('div');
                        warningDiv.className = 'gated-warning';
                        card.appendChild(warningDiv);
                    }
                    warningDiv.textContent = `Progress gated until all attributes reach ${levelInfo.rank}`;
                } else if (warningDiv) {
                    warningDiv.remove();
                }
            }
        }
    });
}

// Subscribe to state changes
store.subscribe(updateDisplay);