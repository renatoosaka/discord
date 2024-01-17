import { table } from 'table';
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  GuildMember
} from "discord.js";
import {
	createAudioPlayer,
	createAudioResource,
	entersState,
	joinVoiceChannel,
	StreamType,
	VoiceConnectionStatus,
} from '@discordjs/voice';
import { Command } from "../types";
import { getItem, searchItem } from "@/services/database";

const player = createAudioPlayer();

export const playCommand: Command = {
  name: 'play',
  description: 'Play audio',
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'audio',
      description: 'Audio to play',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  execute: async (interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();

    const audio = interaction.options.get('audio');

    if (!audio) return;

    console.log('audio ->', audio);

    if (interaction.member instanceof GuildMember && interaction.member.voice.channel) {
      const channel = interaction.member.voice.channel;
      const connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      })

      connection.subscribe(player);

      await entersState(connection, VoiceConnectionStatus.Ready, 20e3);

      const { value } = audio;

      const meme = await getItem(value as string)

      if (!meme) {
        const result = await searchItem(value as string)

        if (!result) {
          await interaction.followUp({ content: 'No audio found', ephemeral: true });
          return;
        }

        const data = result.reduce((acc, item) => {
          const { id, title } = item.payload;

          acc.push([id, title]);

          return acc;
        }, [['ID', 'Title']] as string[][]);

        const response = table(data);
        await interaction.followUp({ content: '**I could not find that audio, but i found these:** \n\n```' + response + '```', ephemeral: true });
        return;
      }

      await interaction.followUp({ content: `Playing audio: ${meme.id} - ${meme.title}`, ephemeral: true });

      player.play(createAudioResource(meme.audio, {  inputType: StreamType.Arbitrary }));
    }
  }
}