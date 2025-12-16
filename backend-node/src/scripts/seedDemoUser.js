import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import db from '../db/database.js'

const DEMO_USER = {
  email: 'demo@example.com',
  password: 'demo123456',
  full_name: 'Demo User'
}

async function seedDemoUser() {
  try {
    // Hash the password
    const hashedPassword = await bcryptjs.hash(DEMO_USER.password, 10)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    
    // Check if user already exists
    db.get(
      'SELECT id FROM users WHERE email = ?',
      [DEMO_USER.email],
      (err, row) => {
        if (err) {
          console.error('Error checking user:', err)
          process.exit(1)
        }
        
        if (row) {
          console.log(`Demo user already exists: ${DEMO_USER.email}`)
          process.exit(0)
        }
        
        // Insert demo user
        const userId = uuidv4()
        db.run(
          `INSERT INTO users (id, email, hashed_password, full_name, role, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, DEMO_USER.email, hashedPassword, DEMO_USER.full_name, 'admin', 1],
          (err) => {
            if (err) {
              console.error('Error creating demo user:', err)
              process.exit(1)
            }
            
            console.log('✓ Demo user created successfully!')
            console.log(`\nLogin Credentials:`)
            console.log(`Email: ${DEMO_USER.email}`)
            console.log(`Password: ${DEMO_USER.password}`)
            process.exit(0)
          }
        )
      }
    )
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

seedDemoUser()
