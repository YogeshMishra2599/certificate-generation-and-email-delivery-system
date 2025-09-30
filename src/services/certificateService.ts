import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CertificateData {
    name: string;
    email: string;
    gstNumber: string;
    businessName: string;
    businessAddress: string;
}

export class CertificateService {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(__dirname, '../templates/certificate.html');
    }

    async generateCertificate(data: CertificateData): Promise<{ pdfPath: string; jpgPath: string }> {
        try {
            // Read the HTML template
            const template = await fs.readFile(this.templatePath, 'utf-8');

            // Replace placeholders with actual data
            const html = template
                .replace('{{NAME}}', data.name)
                .replace('{{EMAIL}}', data.email)
                .replace('{{GST_NUMBER}}', data.gstNumber)
                .replace('{{BUSINESS_NAME}}', data.businessName)
                .replace('{{BUSINESS_ADDRESS}}', data.businessAddress);

            // Launch Puppeteer browser
            const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            const browser = await puppeteer.launch({
                headless: true,
                ...(executablePath && { executablePath }),
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu'
                ]
            });

            const page = await browser.newPage();

            // Set the viewport size for consistent rendering
            await page.setViewport({ width: 1200, height: 800 });

            // Load the HTML content
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Create output directory if it doesn't exist
            const outputDir = path.join(__dirname, '../../output');
            await fs.mkdir(outputDir, { recursive: true });

            // Generate unique filenames
            const timestamp = Date.now();
            const pdfPath = path.join(outputDir, `certificate-${timestamp}.pdf`);
            const jpgPath = path.join(outputDir, `certificate-${timestamp}.jpeg`) as `${string}.jpeg`;

            // Generate PDF
            await page.pdf({
                path: pdfPath,
                width: '1200px',
                height: '800px',
                printBackground: true
            });

            // Generate JPG (screenshot)
            await page.screenshot({
                path: jpgPath,
                type: 'jpeg',
                quality: 90,
                fullPage: false
            });

            await browser.close();

            console.log('Certificate generated successfully:', { pdfPath, jpgPath });

            return { pdfPath, jpgPath };
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw new Error('Failed to generate certificate');
        }
    }
}
