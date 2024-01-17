import { addItem } from '.'
import fs from 'fs';
import path from 'path';

(async () => {
  const memes = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'src', 'scraper', 'memes.json')).toString());
  await Promise.all(memes.map(async (meme: any) => {
    await addItem(meme, meme.title);
  }));
})();