import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

import { OpenAI } from 'openai';
import { LocalIndex } from 'vectra';

import { OPENAI_API_KEY } from '../../config';

export type Meme = {
  id: string;
  title: string;
  audio: string;
}

const db = new sqlite3.Database(':memory:');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const indexPath = path.join(process.cwd(), 'src', 'database', 'index')

const index = new LocalIndex(indexPath);

const getVector = async (text: string) => {
  const response = await openai.embeddings.create({
    input: text,
    model: 'text-embedding-ada-002',
  });

  return response.data[0].embedding;
}

export const addItem = async (payload: object, text: string) => {
  await index.insertItem({
    vector: await getVector(text),
    metadata: { payload }
  })
}

export const searchItem = async (text: string) => {
  const vector = await getVector(text);
  const result = await index.queryItems<Record<string, Meme>>(vector, 5);

  if (!result.length) {
    return null;
  }

  return result.map(result => ({ score: result.score, payload: result.item.metadata.payload }));
}

export const getItem = async (id: string) => {
  return new Promise<Meme | null>((resolve, reject) => {
    db.get<Meme>('SELECT * FROM memes WHERE id = ?', [id.trim()], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        resolve(null);
        return;
      }

      resolve(row);
    });
  });
}

(async () => {
  const indexExists = await index.isIndexCreated();

  if (!indexExists) {
    await index.createIndex();
  }

  const memes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'scraper', 'memes.json')).toString()) as Meme[];

  db.serialize(() => {
    db.run('CREATE TABLE memes (id TEXT, title TEXT, audio TEXT)');

    for (const meme of memes) {
      db.run('INSERT INTO memes (id, title, audio) VALUES (?, ?, ?)', [meme.id, meme.title, meme.audio]);
    }
  });
})();