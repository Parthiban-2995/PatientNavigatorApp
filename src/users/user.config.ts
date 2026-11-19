import { env } from '../core/config/env.config';
import type { AppUser } from './user.types';

export const patientUser: AppUser = {
  role: 'Patient', name: 'France571 Gusikowski974', username: env.PATIENT_USERNAME, password: env.PATIENT_PASSWORD,
};

export const careNurseUser: AppUser = {
  role: 'Transitional Care Nurse', name: 'Michael Chen', username: env.CARE_NURSE_USERNAME, password: env.CARE_NURSE_PASSWORD,
};
