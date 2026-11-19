import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  BASE_URL: z.string().url().default('https://aca-patient-health-frontend-dev.redbush-ea63d593.centralindia.azurecontainerapps.io'),
  PATIENT_USERNAME: z.string().min(1).default('France571@patientai.local'),
  PATIENT_PASSWORD: z.string().default(''),
  CARE_NURSE_USERNAME: z.string().min(1).default('michael.chen@communityclinic.com'),
  CARE_NURSE_PASSWORD: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Invalid environment configuration. Set required values in .env: ${missing}`);
}

export const env = parsed.data;
