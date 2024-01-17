import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
  const BASE_URL = "https://myinstants.com";

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
  );

  await page.setViewport({ width: 1200, height: 768 });

  await page.goto(
    `${BASE_URL}/en/index/br/`, {
      waitUntil: "domcontentloaded",
    }
  );

  const memes = await page.evaluate(async({ BASE_URL }) => {
    const wait = (duration: number) => {
      console.log('waiting', duration);
      return new Promise(resolve => setTimeout(resolve, duration));
    };

    await (async () => {

      // @ts-ignore
      window.atBottom = false;
      const scroller = document.documentElement;  // usually what you want to scroll, but not always
      let lastPosition = -1;

      // @ts-ignore
      while(!window.atBottom) {
        scroller.scrollTop += 1000;
        // scrolling down all at once has pitfalls on some sites: scroller.scrollTop = scroller.scrollHeight;
        await wait(4000);
        const currentPosition = scroller.scrollTop;
        if (currentPosition > lastPosition) {
          console.log('currentPosition', currentPosition);
          lastPosition = currentPosition;
        }
        else {
          // @ts-ignore
          window.atBottom = true;
        }
      }
      console.log('Done!');

    })();

    const instantContainer = document.querySelectorAll(".instants");

    if (!instantContainer) return;

    const items: Record<string, string>[] = []

    instantContainer.forEach(container => {
      const instants = container.querySelectorAll(".instant");

      if (!instants) return;

      instants.forEach(instant => {
        if (!instant) return;

        const title = instant.querySelector("a");

        if (!title) return;

        const button = instant.querySelector(".webshare.instant-action-button")
        const buttonClick = button?.getAttribute("onclick");

        const audioRegex = /(\/media\/sounds\/.*?\.mp3)/;
        const audioMatch = buttonClick?.match(audioRegex);

        if (!audioMatch) return;

        const [_, audio] = audioMatch;

        const idRegex = /'([^']*)'\s*\)$/;
        const idMatch = buttonClick?.match(idRegex);

        if (!idMatch) return;

        const [__, id] = idMatch;

        const meme = {
          id,
          title: title.text,
          audio: `${BASE_URL}${audio}`,
        }

        items.push(meme);
      });
    });

    return items;
  },{
      BASE_URL
    })

  fs.writeFileSync('src/scraper/memes.json', JSON.stringify(memes, null, 2));
  await browser.close();
})();