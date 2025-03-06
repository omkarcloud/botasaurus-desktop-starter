import { playwright } from 'botasaurus/playwright';

const scrapeHeadingTask = playwright<any>({
  reuseDriver: true,
  name: 'scrapeHeadingTask',
  run: async ({ data, page }) => {
    // Navigate to the Link
    await page.goto(data['link']);

    // Retrieve the heading element's text
    const heading = await page.textContent('h1');

    // Return the data
    return {
      heading: heading,
    };
  },
});

export { scrapeHeadingTask };
