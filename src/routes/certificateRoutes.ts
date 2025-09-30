import { Router, type Request, type Response } from 'express';
import { CertificateService } from '../services/certificateService.js';
import { EmailService } from '../services/emailService.js';
import { SupabaseService } from '../services/supabaseService.js';

const router = Router();
const certificateService = new CertificateService();
const emailService = new EmailService();
const supabaseService = new SupabaseService();

// Validation functions
const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
};

const validateGSTNumber = (gst: string): boolean => {
    // GST format: 2 digits + 5 letters + 4 digits + 1 letter + 1 alphanumeric + Z + 1 alphanumeric
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst);
};

const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
};

const validateBusinessName = (businessName: string): boolean => {
    return businessName.trim().length >= 2 && businessName.trim().length <= 200;
};

const validateAddress = (address: string): boolean => {
    return address.trim().length >= 10 && address.trim().length <= 500;
};

// POST /api/certificate/generate
router.post('/generate', async (req: Request, res: Response) => {
    try {
        const { name, email, gstNumber, businessName, businessAddress } = req.body;

        // missing fields validation
        if (!name || !email || !gstNumber || !businessName || !businessAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['name', 'email', 'gstNumber', 'businessName', 'businessAddress']
            });
        }

        // data types validation
        if (typeof name !== 'string' || typeof email !== 'string' ||
            typeof gstNumber !== 'string' || typeof businessName !== 'string' ||
            typeof businessAddress !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'All fields must be strings'
            });
        }

        // name validation
        if (!validateName(name)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid name',
                message: 'Name must be between 2 and 100 characters'
            });
        }

        // email format validation
        if (!validateEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }

        // GST number format validation
        if (!validateGSTNumber(gstNumber)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid GST number format',
                message: 'GST number must be in format: 22AAAAA0000A1Z5 (e.g., 29ABCDE1234F1Z5)'
            });
        }

        // business name validation
        if (!validateBusinessName(businessName)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid business name',
                message: 'Business name must be between 2 and 200 characters'
            });
        }

        // business address validation
        if (!validateAddress(businessAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid business address',
                message: 'Business address must be between 10 and 500 characters'
            });
        }

        // All validations passed - proceed with certificate generation
        console.log('All validations passed. Generating certificate...');

        const result = await certificateService.generateCertificate({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            gstNumber: gstNumber.trim().toUpperCase(),
            businessName: businessName.trim(),
            businessAddress: businessAddress.trim()
        });

        console.log('Certificate generated, saving to database...');

        await supabaseService.saveCertificateRecord({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            gst_number: gstNumber.trim().toUpperCase(),
            business_name: businessName.trim(),
            business_address: businessAddress.trim(),
            pdf_path: result.pdfPath,
            jpg_path: result.jpgPath
        });

        console.log('Sending email...');

        await emailService.sendCertificate(
            email.trim().toLowerCase(),
            name.trim(),
            result.pdfPath,
            result.jpgPath
        );

        console.log('Certificate generated, saved, and emailed successfully!');

        return res.status(200).json({
            success: true,
            message: 'Certificate generated, saved to database, and sent successfully',
            data: {
                email: email.trim().toLowerCase(),
                gstNumber: gstNumber.trim().toUpperCase(),
                files: {
                    pdf: result.pdfPath,
                    jpg: result.jpgPath
                }
            }
        });
    } catch (error) {
        console.error('Error in certificate generation route:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process certificate',
            message: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
});

export default router;