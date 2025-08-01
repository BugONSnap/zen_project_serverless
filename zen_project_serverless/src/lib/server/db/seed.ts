import { db } from './index';

// Function to create code_snippets table
async function createCodeSnippetsTable() {
    try {
        // Check if code_snippets table exists
        try {
            await db.run(`
                SELECT id FROM code_snippets LIMIT 1
            `);
            console.log('✅ code_snippets table already exists');
        } catch (error) {
            // If the table doesn't exist, create it
            console.log('Creating code_snippets table...');
            await db.run(`
                CREATE TABLE code_snippets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    html_code TEXT DEFAULT '',
                    css_code TEXT DEFAULT '',
                    js_code TEXT DEFAULT '',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);
            console.log('✅ Created code_snippets table!');
        }
    } catch (error) {
        console.error('❌ Error creating code snippets table:', error);
        throw error;
    }
}

// Run the seeding
(async () => {
    try {
        await createCodeSnippetsTable();
        console.log('🎉 Code snippets table seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Database seeding failed:', error);
        process.exit(1);
    }
})();
