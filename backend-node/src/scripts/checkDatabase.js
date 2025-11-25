import db from '../db/database.js'

console.log('\n=== DATABASE DEBUG ===\n')

// Check send_logs
db.all('SELECT * FROM send_logs', (err, logs) => {
  console.log('Send Logs:', logs?.length || 0)
  if (logs) {
    logs.forEach(log => {
      console.log(`  - Campaign: ${log.campaign_id}, Subscriber: ${log.subscriber_id}, Status: ${log.status}`)
    })
  }
})

// Check events
db.all('SELECT * FROM events', (err, events) => {
  console.log('\nEvents:', events?.length || 0)
  if (events) {
    events.forEach(event => {
      console.log(`  - Type: ${event.event_type}, Subscriber: ${event.subscriber_id}, Campaign: ${event.campaign_id}`)
    })
  }
})

// Check campaigns
db.all('SELECT * FROM campaigns', (err, campaigns) => {
  console.log('\nCampaigns:', campaigns?.length || 0)
  if (campaigns) {
    campaigns.forEach(c => {
      console.log(`  - ${c.name} (${c.status}): ${c.id}`)
    })
  }
})

// Check subscribers
db.all('SELECT * FROM subscribers', (err, subscribers) => {
  console.log('\nSubscribers:', subscribers?.length || 0)
  if (subscribers) {
    subscribers.forEach(s => {
      console.log(`  - ${s.email} (${s.status}): ${s.id}`)
    })
  }
  
  setTimeout(() => process.exit(0), 1000)
})
