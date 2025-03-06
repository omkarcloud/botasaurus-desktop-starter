/**
 * This is a playground to test your code
 * You can write code to quickly test your scraper
 */
import { scrapeHeadingTask } from './src/scraper';

async function main() {
  console.log(
    await scrapeHeadingTask({ link: 'https://stackoverflow.blog/open-source' }),
  );
}

main();
