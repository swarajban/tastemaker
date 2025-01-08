import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config()

// Get email from command line argument
const userEmail = process.argv[2]
if (!userEmail) {
  console.error('Please provide an email address as an argument')
  console.error('Usage: npm run magic-link user@example.com')
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function generateMagicLink(email: string) {
  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${supabaseUrl}/schedules`
      }
    })

    if (error) throw error

    console.log('\nMagic Link Generated Successfully!')
    console.log('----------------------------------------')
    console.log('Email:', email)
    console.log('Link:', data.properties.action_link)
    console.log('----------------------------------------')
    console.log('\nNote: This link will expire in 24 hours\n')

  } catch (error) {
    console.error('Error generating magic link:', error)
  }
}

generateMagicLink(userEmail) 