// src/features/constants/adventurePaths.js

export const PATH_DATA = [
    {
        id: 'flavor-fundamentals',
        name: 'Fundamentals of Flavor',
        description: 'Master the essential foundations of flavor and learn how to transform ordinary ingredients into extraordinary dishes.',
        primaryFocus: 'Flavor',
        startingNodeId: 'flavor-intro',
        rank: 'Home Cook',
        nodes: [
            {
                id: 'flavor-intro',
                name: 'The Journey Begins',
                type: 'story',
                description: 'Your adventure into the world of flavor begins here.',
                storyContent: '<p>Every culinary journey begins with understanding flavor. The interplay of salt, acid, fat, and heat forms the foundation for nearly every delicious dish.</p><p>In this path, you\'ll explore these fundamentals and learn how to apply them to transform your cooking.</p>',
                x: 50,
                y: 150,
                connections: ['salt-basics'],
                icon: '📖'
            },
            {
                id: 'salt-basics',
                name: 'Salt: The Essential Element',
                type: 'quest',
                description: 'Explore the critical role salt plays in cooking and how it enhances flavor beyond simply making food taste "salty."',
                questId: 'salt-comparison',
                x: 150,
                y: 150, 
                connections: ['salt-tasting'],
                icon: '🧂'
            },
            {
                id: 'salt-tasting',
                name: 'Salt Comparison Tasting',
                type: 'quest',
                description: 'Experience the differences between various salt types through a structured tasting.',
                questId: 'salt-tasting-quest',
                x: 250,
                y: 150,
                connections: ['acid-intro'],
                icon: '👅'
            },
            {
                id: 'acid-intro',
                name: 'The Brightness of Acid',
                type: 'story',
                description: 'Discover how acidity creates brightness and balance in your cooking.',
                storyContent: '<p>While salt enhances flavors, acid brings them into focus. Acidity creates brightness, cuts through richness, and provides balance to dishes.</p><p>From vinegars to citrus fruits, understanding how and when to add acidity will transform your cooking.</p>',
                x: 350,
                y: 150,
                connections: ['acid-exploration'],
                icon: '🍋'
            },
            {
                id: 'acid-exploration',
                name: 'Acid Exploration',
                type: 'quest',
                description: 'Experiment with different forms of acidity in cooking.',
                questId: 'acid-exploration-quest',
                x: 450,
                y: 150,
                connections: ['flavor-crossroads'],
                icon: '🧪'
            },
            {
                id: 'flavor-crossroads',
                name: 'Flavor Crossroads',
                type: 'choice',
                description: 'Choose your path for the next stage of your flavor exploration.',
                x: 550,
                y: 150,
                icon: '↕️',
                choices: [
                    {
                        id: 'fat-path',
                        text: 'Explore the richness of fats',
                        unlocks: ['fat-intro']
                    },
                    {
                        id: 'heat-path',
                        text: 'Master the transformative power of heat',
                        unlocks: ['heat-intro']
                    }
                ]
            },
            {
                id: 'fat-intro',
                name: 'Fat: The Flavor Carrier',
                type: 'story',
                description: 'Learn about the crucial role of fats in carrying and enhancing flavors.',
                storyContent: '<p>Fats don\'t just add richness - they serve as carriers for flavor molecules, many of which are fat-soluble and won\'t fully express themselves without fat.</p><p>In this chapter, you\'ll discover how different fats contribute their own flavors and how to use them effectively.</p>',
                x: 650,
                y: 100,
                connections: ['fat-comparison'],
                icon: '🧈',
                prerequisites: [
                    {
                        type: 'node',
                        id: 'flavor-crossroads'
                    }
                ]
            },
            {
                id: 'fat-comparison',
                name: 'Fat Comparison Quest',
                type: 'quest',
                description: 'Compare different cooking fats and learn their best applications.',
                questId: 'fat-comparison-quest',
                x: 750,
                y: 100,
                connections: ['flavor-milestone'],
                icon: '🍳'
            },
            {
                id: 'heat-intro',
                name: 'Heat: The Great Transformer',
                type: 'story',
                description: 'Discover how heat transforms food through various cooking methods.',
                storyContent: '<p>Heat is what transforms raw ingredients into cooked dishes, but how you apply that heat makes all the difference.</p><p>From low-and-slow methods that develop deep flavors to high-heat techniques that create new flavor compounds, mastering heat is essential to good cooking.</p>',
                x: 650,
                y: 200,
                connections: ['heat-methods'],
                icon: '🔥',
                prerequisites: [
                    {
                        type: 'node',
                        id: 'flavor-crossroads'
                    }
                ]
            },
            {
                id: 'heat-methods',
                name: 'Heat Methods Quest',
                type: 'quest',
                description: 'Practice different cooking methods and observe how they affect flavors.',
                questId: 'heat-methods-quest',
                x: 750,
                y: 200,
                connections: ['flavor-milestone'],
                icon: '♨️'
            },
            {
                id: 'flavor-milestone',
                name: 'Flavor Fundamentals Mastery',
                type: 'milestone',
                description: 'Congratulations on mastering the fundamentals of flavor!',
                rewardDescription: 'You\'ve unlocked: Advanced Flavor Combinations',
                x: 850,
                y: 150,
                connections: ['flavor-mystery'],
                icon: '🏆',
                prerequisites: [
                    {
                        type: 'node',
                        id: 'fat-comparison',
                        optional: true
                    },
                    {
                        type: 'node',
                        id: 'heat-methods',
                        optional: true
                    },
                    {
                        type: 'attribute',
                        attribute: 'flavor',
                        hours: 10
                    }
                ]
            },
            {
                id: 'flavor-mystery',
                name: '???',
                type: 'mystery',
                description: 'A hidden flavor challenge awaits...',
                questId: 'flavor-balancing-act',
                x: 950,
                y: 150,
                icon: '❓',
                visible: false
            }
        ]
    },
    {
        id: 'knife-skills',
        name: 'Knife Skills Mastery',
        description: 'Develop precision and efficiency in the kitchen through mastering essential knife techniques.',
        primaryFocus: 'Technique',
        startingNodeId: 'knife-intro',
        rank: 'Home Cook',
        nodes: [
            {
                id: 'knife-intro',
                name: 'The Blade\'s Edge',
                type: 'story',
                description: 'Begin your journey to knife mastery.',
                storyContent: '<p>A chef\'s knife is the most essential tool in the kitchen. Mastering knife skills will transform your cooking experience, making you more efficient, precise, and confident.</p><p>This path will take you from basic knife handling to advanced cutting techniques.</p>',
                x: 50,
                y: 150,
                connections: ['knife-grip'],
                icon: '🔪'
            },
            {
                id: 'knife-grip',
                name: 'Proper Grip & Stance',
                type: 'quest',
                description: 'Learn the fundamentals of knife handling, grip, and kitchen posture.',
                questId: 'knife-grip-quest',
                x: 150,
                y: 150,
                connections: ['basic-cuts'],
                icon: '✋'
            },
            // Add more knife skill path nodes here
        ]
    },
    {
        id: 'around-the-world',
        name: 'Around the World: Culinary Traditions',
        description: 'Explore global culinary traditions and techniques from various cultures.',
        primaryFocus: 'Ingredients',
        startingNodeId: 'world-cuisine-intro',
        rank: 'Home Cook',
        nodes: [
            {
                id: 'world-cuisine-intro',
                name: 'A Culinary World Tour',
                type: 'story',
                description: 'Embark on a journey through global culinary traditions.',
                storyContent: '<p>Every culture has developed unique approaches to cooking based on available ingredients, climate, history, and cultural values.</p><p>On this path, you\'ll explore techniques and flavor profiles from around the world, expanding your culinary horizons.</p>',
                x: 50,
                y: 150,
                connections: ['mediterranean-basics'],
                icon: '🌍'
            },
            // Add more world cuisine path nodes here
        ]
    },
    {
        id: 'kitchen-management',
        name: 'Kitchen Management & Meal Planning',
        description: 'Master the art of kitchen organization, meal planning, and efficient cooking workflow.',
        primaryFocus: 'Management',
        startingNodeId: 'kitchen-org-intro',
        rank: 'Home Cook',
        nodes: [
            {
                id: 'kitchen-org-intro',
                name: 'The Organized Kitchen',
                type: 'story',
                description: 'Learn how organization and planning can transform your cooking experience.',
                storyContent: '<p>A well-organized kitchen and thoughtful meal planning can make cooking more enjoyable, efficient, and cost-effective.</p><p>This path will help you develop systems to streamline your cooking workflow and reduce kitchen stress.</p>',
                x: 50,
                y: 150,
                connections: ['kitchen-workflow'],
                icon: '📋'
            },
            // Add more kitchen management path nodes here
        ]
    }
];

// Sample quest data to match adventure paths
export const ADVENTURE_QUEST_DATA = [
    {
        id: 'salt-comparison',
        questName: 'Salt: The Essential Element',
        type: 'Training',
        rank: 'Home Cook',
        description: 'Learn about different types of salt and how they affect flavor. Compare table salt, kosher salt, and sea salt to understand their differences.',
        primaryFocus: 'Flavor',
        primaryHours: 1,
        secondaryFocus: 'Ingredients',
        secondaryHours: 0.5,
        diceRequired: false
    },
    {
        id: 'salt-tasting-quest',
        questName: 'Salt Comparison Tasting',
        type: 'Main',
        rank: 'Home Cook',
        description: 'Conduct a structured tasting with three types of salt on simple foods (bread, tomato, cucumber) to clearly identify flavor differences.',
        primaryFocus: 'Flavor',
        primaryHours: 1.5,
        secondaryFocus: 'Technique',
        secondaryHours: 0.5,
        diceRequired: false
    },
    {
        id: 'acid-exploration-quest',
        questName: 'Acid Exploration',
        type: 'Main',
        rank: 'Home Cook',
        description: 'Experiment with different acids (vinegar, citrus, yogurt) in a simple dish to learn how each affects the overall flavor profile.',
        primaryFocus: 'Flavor',
        primaryHours: 2,
        secondaryFocus: 'Ingredients',
        secondaryHours: 1,
        diceRequired: false
    },
    {
        id: 'fat-comparison-quest',
        questName: 'Fat Comparison',
        type: 'Main',
        rank: 'Home Cook',
        description: 'Compare different cooking fats (butter, olive oil, vegetable oil) by preparing the same simple dish with each.',
        primaryFocus: 'Flavor',
        primaryHours: 2,
        secondaryFocus: 'Technique',
        secondaryHours: 1,
        diceRequired: false
    },
    {
        id: 'heat-methods-quest',
        questName: 'Heat Methods',
        type: 'Main',
        rank: 'Home Cook',
        description: 'Cook the same ingredient using different heat methods (roasting, sautéing, steaming) and compare the results.',
        primaryFocus: 'Technique',
        primaryHours: 2,
        secondaryFocus: 'Flavor',
        secondaryHours: 1,
        diceRequired: false
    },
    {
        id: 'flavor-balancing-act',
        questName: 'The Balancing Act',
        type: 'Main',
        rank: 'Home Cook',
        description: 'Take a dish that\'s intentionally unbalanced (too salty, too acidic, etc.) and fix it using your knowledge of flavor fundamentals.',
        primaryFocus: 'Flavor',
        primaryHours: 3,
        secondaryFocus: 'Management',
        secondaryHours: 1,
        diceRequired: false
    },
    {
        id: 'knife-grip-quest',
        questName: 'Proper Knife Grip & Stance',
        type: 'Training',
        rank: 'Home Cook',
        description: 'Practice proper knife grip, hand positioning, and stance to ensure safety and efficiency.',
        primaryFocus: 'Technique',
        primaryHours: 1,
        secondaryFocus: 'Management',
        secondaryHours: 0.5,
        diceRequired: false
    }
    // Add more quests here that correspond to adventure nodes
];