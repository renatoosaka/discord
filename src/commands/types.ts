import { ApplicationCommandData, CacheType, Interaction } from "discord.js";

export type Command = ApplicationCommandData & {
  execute: (interaction: Interaction<CacheType>) => Promise<void>;
}