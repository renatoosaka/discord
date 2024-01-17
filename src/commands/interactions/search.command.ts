import { table } from 'table';
import { Command } from "../types";
import { searchItem } from "@/services/database";

export const searchCommand: Command = {
  name: 'search',
  description: 'Search for audio',
  type: 1,
  options: [
    {
      name: 'audio',
      description: 'Audio to search',
      type: 3,
      required: true
    }
  ],
  execute: async (interaction) => {
    if (!interaction.isCommand()) return;

    await interaction.deferReply();

    const audio = interaction.options.get('audio');

    if (!audio) return;

    console.log('audio ->', audio);

    await interaction.followUp({ content: 'Searching audio', ephemeral: true });

    const { value } = audio;

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
    await interaction.followUp({ content: '**Here are the results:** \n\n```' + response + '```', ephemeral: true });
  }
}