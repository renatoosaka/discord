import axios from 'axios';
import { DISCORD_TOKEN } from '../config';

export const discord = axios.create({
    baseURL: 'https://discord.com/api/v10',
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    }
})