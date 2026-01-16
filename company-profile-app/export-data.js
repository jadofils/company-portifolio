const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

// Export SQLite data to JSON
function exportSQLiteData() {
  const dbPath = path.join(process.cwd(), 'company.db')
  
  if (!fs.existsSync(dbPath)) {
   // console.log('No company.db found - nothing to migrate')
    return null
  }

  const db = new Database(dbPath)
  
  const data = {
    users: db.prepare('SELECT * FROM users').all(),
    contact_messages: db.prepare('SELECT * FROM contact_messages').all(),
    settings: db.prepare('SELECT * FROM settings').all(),
    // Add other tables as needed
  }
  
  db.close()
  
  // Save to JSON file
  fs.writeFileSync('migration-data.json', JSON.stringify(data, null, 2))
 // console.log('Data exported to migration-data.json')
 // console.log(`Found ${data.users.length} users, ${data.contact_messages.length} messages, ${data.settings.length} settings`)
  
  return data
}

exportSQLiteData()