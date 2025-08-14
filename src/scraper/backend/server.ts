import { Server } from 'botasaurus-server/server';
import { scrapeHeadingTask } from '../src/scraper';

import { config } from '../../main/config';

Server.addScraper(scrapeHeadingTask);
// Server.configure({
//     // headerTitle:"aa"
// })

Server.addEmailSupport({
  email: 'happy.to.help@my-app.com', // Replace with your support email
  subject: `Help with ${config.productName} Tool`, // Default email subject
  body: `Hi, I need help with using the ${config.productName} Tool`, // Default email body
});