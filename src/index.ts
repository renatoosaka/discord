import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';

import { DISCORD_TOKEN } from './config';
import { commandHandler, commands } from './commands';

import './services/database';

const client = new Client({
  intents: [ GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds ]
})

client.on('ready', (readyClient) => {
  readyClient.application?.commands.set(commands.map(command => {
    const { execute, ...data } = command;

    return data;
  }));

  console.log(`Logged in as ${readyClient.user?.tag}`);
})

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  const handler = commandHandler[commandName];

  if (!handler) {
    await interaction.reply({
      ephemeral: true,
      content: 'Command not found'
    });
    return;
  }

  await handler(interaction);
})

client.login(DISCORD_TOKEN);