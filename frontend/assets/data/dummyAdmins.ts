// dummyAdmins.ts
import { Admin } from './types';

// Assuming these user_uuids exist in your auth.users table for admins
const adminUser1Uuid = 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1';
const adminUser2Uuid = 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2';

export const admins: Admin[] = [
  {
    admin_id: 'ad1d1d1d-e1e1-f1f1-a1a1-b1b1b1b1b1ad', // Unique UUID
    user_uuid: adminUser1Uuid,
    username: 'admin_manager',
    role: 'Manager',
    created_at: '2023-12-01T09:00:00Z',
  },
  {
    admin_id: 'ad2d2d2d-e2e2-f2f2-a2a2-b2b2b2b2b2ad', // Unique UUID
    user_uuid: adminUser2Uuid,
    username: 'loan_approver_1',
    role: 'Loan Approver',
    created_at: '2023-12-05T10:00:00Z',
  },
];