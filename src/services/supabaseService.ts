import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface CertificateRecord {
    name: string;
    email: string;
    gst_number: string;
    business_name: string;
    business_address: string;
    pdf_path: string;
    jpg_path: string;
}

export class SupabaseService {
    async saveCertificateRecord(record: CertificateRecord): Promise<void> {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .insert([record]);

            if (error) throw error;

            console.log('Certificate record saved to database');
        } catch (error) {
            console.error('Error saving certificate record:', error);
            throw new Error('Failed to save certificate record');
        }
    }
}
