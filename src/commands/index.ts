import { CacheType, Interaction } from 'discord.js'

/** Types */
import { Command } from './types'

/** Commands */
import { playCommand, searchCommand } from './interactions'

type CommandHandlerType = {
  [key: string]: (interaction: Interaction<CacheType>) => Promise<void>
}

export const commands: Command[] = [playCommand, searchCommand]

export const commandHandler: CommandHandlerType = commands.reduce((acc, command: Command) => {
  const { execute, name } = command;

  Object.assign(acc, { [name]: execute });

  return acc;
}, {})