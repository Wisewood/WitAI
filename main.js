/**
 * Apify Actor - Alibaba Contact Automation
 * This actor contacts Alibaba suppliers through their contact forms
 */

import { Actor } from 'apify';
import { PuppeteerCrawler } from 'crawlee';

await Actor.init();

const input = await Actor.getInput();
const { url, message } = input;

console.log('Input received:', { url, message: message?.substring(0, 50) + '...' });

if (!url || !message) {
    throw new Error('Missing required input: url and message are required');
}

let result = {
    success: false,
    url: url,
    status: 'failed',
    timestamp: new Date().toISOString()
};

const crawler = new PuppeteerCrawler({
    launchContext: {
        launchOptions: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    },
    async requestHandler({ page, request }) {
        console.log(`Processing: ${request.url}`);
        
        try {
            // Wait for page to load
            await page.waitForLoadState('domcontentloaded');
            console.log('Page loaded');
            
            // Random delay to appear human
            const delay = Math.floor(Math.random() * 2000) + 2000;
            console.log(`Waiting ${delay}ms...`);
            await page.waitForTimeout(delay);
            
            // Scroll page (human behavior)
            await page.evaluate(() => {
                window.scrollBy({
                    top: Math.floor(Math.random() * 300) + 100,
                    behavior: 'smooth'
                });
            });
            await page.waitForTimeout(1000);
            
            // Look for contact button
            console.log('Looking for contact button...');
            
            const contactSelectors = [
                'button:has-text("Contact Supplier")',
                'a:has-text("Contact Supplier")',
                'button:has-text("Contact Now")',
                '[class*="contact-supplier"]',
                '[class*="contact-btn"]'
            ];
            
            let contactButton = null;
            for (const selector of contactSelectors) {
                try {
                    contactButton = await page.waitForSelector(selector, { 
                        timeout: 5000,
                        state: 'visible' 
                    });
                    if (contactButton) {
                        console.log(`Found contact button with: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!contactButton) {
                throw new Error('Contact button not found on page');
            }
            
            // Click contact button
            console.log('Clicking contact button...');
            await contactButton.click();
            await page.waitForTimeout(2000);
            
            // Wait for form/modal to appear
            console.log('Waiting for contact form...');
            await page.waitForTimeout(1000);
            
            // Find message textarea
            console.log('Looking for message field...');
            const messageBox = await page.waitForSelector('textarea', { 
                timeout: 10000,
                state: 'visible'
            });
            
            if (!messageBox) {
                throw new Error('Message field not found');
            }
            
            console.log('Filling message field...');
            await messageBox.click();
            await page.waitForTimeout(300);
            
            // Type message character by character (human-like)
            for (const char of message) {
                await page.keyboard.type(char);
                await page.waitForTimeout(Math.floor(Math.random() * 100) + 50);
            }
            
            console.log('Message typed successfully');
            
            // Wait before submitting
            await page.waitForTimeout(Math.floor(Math.random() * 2000) + 2000);
            
            // Find submit button
            console.log('Looking for submit button...');
            const submitSelectors = [
                'button:has-text("Send")',
                'button:has-text("Submit")',
                'button[type="submit"]',
                'input[type="submit"]',
                '[class*="submit-btn"]'
            ];
            
            let submitButton = null;
            for (const selector of submitSelectors) {
                try {
                    const btn = await page.$(selector);
                    if (btn && await btn.isVisible()) {
                        submitButton = btn;
                        console.log(`Found submit button with: ${selector}`);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!submitButton) {
                throw new Error('Submit button not found');
            }
            
            // Click submit
            console.log('Clicking submit button...');
            await submitButton.click();
            await page.waitForTimeout(3000);
            
            // Check for success message
            console.log('Checking for success confirmation...');
            const successSelectors = [
                'text=success',
                'text=sent',
                'text=thank you',
                '[class*="success"]'
            ];
            
            let success = false;
            for (const selector of successSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 3000 });
                    success = true;
                    console.log('Success message found!');
                    break;
                } catch (e) {
                    continue;
                }
            }
            
            result = {
                success: true,
                url: url,
                status: success ? 'confirmed' : 'sent',
                message: success ? 'Message sent and confirmed' : 'Message sent (confirmation unclear)',
                timestamp: new Date().toISOString()
            };
            
            console.log('Automation completed successfully');
            
        } catch (error) {
            console.error('Error during automation:', error.message);
            result = {
                success: false,
                url: url,
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    },
    maxRequestsPerCrawl: 1,
    maxConcurrency: 1
});

// Run the crawler
await crawler.run([url]);

// Save result
console.log('Final result:', result);
await Actor.pushData(result);

await Actor.exit();
