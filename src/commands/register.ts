import 'module-alias/register';
import 'dotenv/config';

import { commands } from '.'
import { discord } from '@/services';
import { DISCORD_APP_ID } from '@/config';

(async () => {
  try {
    const response = await discord.put(`applications/${DISCORD_APP_ID}/commands`, commands)

    if (response.status === 200) console.log('Commands registered successfully')
    else console.log('Error registering commands', response.data)
  } catch (error) {
    const err = error as unknown as { response: { data: unknown } }
    console.log('Error registering commands')
    console.log(JSON.stringify(err.response.data, null, 4))
  }
})();