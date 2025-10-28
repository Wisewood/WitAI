/**
 * Apify Actor - Alibaba Contact Automation
 * 
 * This actor contacts Alibaba suppliers through their contact forms.
 * Use this with n8n Cloud since n8n Cloud doesn't have Playwright.
 * 
 * INPUT:
 * {
 *   "url": "https://supplier.alibaba.com/page",
 *   "message": "Your quotation request message"
 * }
 * 
 * OUTPUT:
 * {
 *   "success": true/false,
 *   "url": "supplier-url",
 *   "status": "sent/failed",
 *   "message": "Result message",
 *   "timestamp": "ISO timestamp"
 * }
 */

const Apify = require('apify');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { url, message } = input;

    console.log(`Starting automation for: ${url}`);

    const browser = await Apify.launchPuppeteer({
        useChrome: true,
        stealth: true,
        launchOptions: {
            headless: true
        }
    });

    try {
        const page = await browser.newPage();
        
        // Navigate to supplier page
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait a bit
        await page.waitForTimeout(2000 + Math.random() * 2000);
        
        // Scroll randomly (human behavior)
        await page.evaluate(() => {
            window.scrollBy({
                top: Math.floor(Math.random() * 300) + 100,
                behavior: 'smooth'
            });
        });
        
        await page.waitForTimeout(1000);
        
        // Find contact button
        const contactButton = await page.$('button:has-text("Contact Supplier"), a:has-text("Contact Supplier"), .contact-supplier');
        
        if (!contactButton) {
            throw new Error('Contact button not found');
        }
        
        // Click contact button
        await contactButton.click();
        await page.waitForTimeout(2000);
        
        // Find message field
        const messageBox = await page.waitForSelector('textarea', { timeout: 10000 });
        
        if (!messageBox) {
            throw new Error('Message field not found');
        }
        
        // Type message with human-like speed
        await messageBox.click();
        await page.waitForTimeout(300);
        
        for (const char of message) {
            await page.keyboard.type(char);
            await page.waitForTimeout(50 + Math.random() * 100);
        }
        
        // Wait before submitting
        await page.waitForTimeout(2000 + Math.random() * 2000);
        
        // Find and click submit button
        const submitButton = await page.$('button:has-text("Send"), button:has-text("Submit"), button[type="submit"]');
        
        if (!submitButton) {
            throw new Error('Submit button not found');
        }
        
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Check for success
        const successElement = await page.$('text=success, text=sent, text=thank you');
        const success = !!successElement;
        
        await browser.close();
        
        const result = {
            success: true,
            status: success ? 'confirmed' : 'sent',
            url: url,
            message: success ? 'Message sent and confirmed' : 'Message sent',
            timestamp: new Date().toISOString()
        };
        
        console.log('Result:', result);
        await Apify.setValue('OUTPUT', result);
        
    } catch (error) {
        console.error('Error:', error.message);
        
        await browser.close();
        
        const result = {
            success: false,
            status: 'failed',
            url: url,
            error: error.message,
            timestamp: new Date().toISOString()
        };
        
        await Apify.setValue('OUTPUT', result);
    }
});
