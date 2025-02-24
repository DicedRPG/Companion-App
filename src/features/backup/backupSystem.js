import { store } from '../../core/state.js';

export const backupSystem = {
    BACKUP_KEY: 'dicedRPG_backup',
    backupInterval: 5 * 60 * 1000, // 5 minutes

    initialize() {
        // Set up periodic backup
        setInterval(() => this.createBackup(), this.backupInterval);
        
        // Add event listener for page unload
        window.addEventListener('beforeunload', () => this.createBackup());
        
        // Initial backup
        this.createBackup();

        // Add UI elements
        this.addBackupControls();
    },

    createBackup() {
        try {
            const currentState = {
                attributeHours: store.getState().attributeHours,
                completedQuests: store.getState().completedQuests,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(currentState));
            console.log('Backup created:', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('Backup creation failed:', error);
        }
    },

    addBackupControls() {
        // Find where to insert backup controls
        const dashboard = document.querySelector('.dashboard');
        const addHoursCard = document.querySelector('.add-hours-card');
        
        if (!dashboard || !addHoursCard) return;

        // Create backup controls card
        const backupCard = document.createElement('div');
        backupCard.className = 'add-hours-card';
        backupCard.innerHTML = `
            <div class="attribute-header">
                <div class="attribute-icon">💾</div>
                <h3>Progress Backup</h3>
            </div>
            <p class="stats">Protect your progress from browser data clearing</p>
            <div class="input-section">
                <button onclick="backupSystem.exportProgress()" class="quest-button secondary">Export Progress</button>
                <button onclick="backupSystem.importProgress()" class="quest-button secondary">Import Progress</button>
            </div>
        `;
        
        // Insert before add hours card
        dashboard.insertBefore(backupCard, addHoursCard.nextSibling);
    },

    exportProgress() {
        try {
            // Get current state
            const dataToExport = {
                attributeHours: store.getState().attributeHours,
                completedQuests: store.getState().completedQuests,
                exportDate: new Date().toISOString(),
                version: '1.0.0'
            };
            
            // Convert to JSON string
            const jsonData = JSON.stringify(dataToExport, null, 2);
            
            // Create download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            
            // Set filename with date
            const date = new Date().toISOString().split('T')[0];
            downloadLink.download = `diced_rpg_progress_${date}.json`;
            downloadLink.href = url;
            
            // Trigger download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            alert('Progress exported successfully! Keep this file safe to restore your progress if needed.');
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export progress. Please try again.');
        }
    },

    async importProgress() {
        try {
            // Create file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            
            // Handle file selection
            fileInput.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedData = JSON.parse(e.target.result);
                        
                        // Validate imported data
                        if (!importedData.attributeHours || !importedData.completedQuests) {
                            throw new Error('Invalid data format');
                        }
                        
                        // Confirm import
                        if (confirm(`Import progress from ${new Date(importedData.exportDate).toLocaleString()}?\n\nThis will replace your current progress.`)) {
                            // Create backup before import
                            const backupKey = `${this.BACKUP_KEY}_preimport_${Date.now()}`;
                            localStorage.setItem(backupKey, JSON.stringify({
                                timestamp: new Date().toISOString(),
                                data: store.getState()
                            }));
                            
                            // Update state
                            store.setState({
                                attributeHours: importedData.attributeHours,
                                completedQuests: importedData.completedQuests
                            });
                            
                            alert('Progress imported successfully!');
                        }
                    } catch (error) {
                        console.error('Import failed:', error);
                        alert('Failed to import progress. The file may be corrupted or invalid.');
                    }
                };
                
                reader.readAsText(file);
            };
            
            // Trigger file selection
            fileInput.click();
        } catch (error) {
            console.error('Import failed:', error);
            alert('Failed to import progress. Please try again.');
        }
    },

    async recoverFromBackup() {
        try {
            const backup = localStorage.getItem(this.BACKUP_KEY);
            if (backup) {
                const backupData = JSON.parse(backup);
                if (confirm(`Recover data from backup created on ${new Date(backupData.timestamp).toLocaleString()}?`)) {
                    store.setState({
                        attributeHours: backupData.attributeHours,
                        completedQuests: backupData.completedQuests
                    });
                    alert('Data recovered from backup successfully!');
                }
            } else {
                alert('No backup found.');
            }
        } catch (error) {
            console.error('Recovery failed:', error);
            alert('Failed to recover from backup.');
        }
    }
};

// Make backupSystem globally available for button clicks
window.backupSystem = backupSystem;