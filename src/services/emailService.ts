import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use STARTTLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendCertificate(
        recipientEmail: string,
        recipientName: string,
        pdfPath: string,
        jpgPath: string
    ): Promise<void> {
        try {
            const mailOptions = {
                from: `"Certificate System" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: `Certificate for ${recipientName}`,
                html: `
          <h2>Congratulations ${recipientName}!</h2>
          <p>Your certificate has been generated successfully.</p>
          <p>Please find your certificate attached in both PDF and JPG formats.</p>
          <br>
          <p>Best regards,<br>Certificate Generation System</p>
        `,
                attachments: [
                    {
                        filename: 'certificate.pdf',
                        path: pdfPath
                    },
                    {
                        filename: 'certificate.jpeg',
                        path: jpgPath
                    }
                ]
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send email');
        }
    }
}
