// dummyAdminLoans.ts
import { AdminLoan } from './types';
import { admins } from './dummyAdmins'; // Import admins
import { loans } from './dummyLoans'; // Import loans

export const adminLoans: AdminLoan[] = [
  {
    entry_id: 'al1l1l1l-a1a1-d1d1-m1m1-n1n1n1n1n1al', // Unique UUID for entry
    admin_id: admins[1].admin_id, // Loan Approver 1
    loan_id: loans[0].loan_id, // Linked to Ali's loan
    admin_approve: true, // This admin approved it
    created_at: '2025-03-15T14:00:00Z',
  },
  // Add another entry if loan 2 was reviewed, approved/rejected
  // {
  //   entry_id: "al2l2l2l-a2a2-d2d2-m2m2-n2n2n2n2n2al", // Unique UUID
  //   admin_id: admins[1].admin_id, // Loan Approver 1
  //   loan_id: loans[1].loan_id,      // Linked to Siti's loan
  //   admin_approve: false,          // Example: Rejected or pending (null might be better if pending)
  //   created_at: "2025-03-25T10:00:00Z",
  // },
];