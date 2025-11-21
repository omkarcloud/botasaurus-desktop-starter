import { Server } from 'botasaurus-server/server';
import { scrapeHeadingTask } from '../src/scraper';

Server.addScraper(scrapeHeadingTask);