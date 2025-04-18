// dummyAccounts.ts (Updated)
import { Account } from './types';
import { customers } from './dummyCustomers'; // Import customers to link

export const accounts: Account[] = [
  // Existing Accounts
  {
    account_id: 'a1b1c1d1-e1f1-01a1-b1c1-d1e1f101a1b1', // Unique UUID (Ali's Savings)
    customer_id: customers[0].customer_id, // Link to Ali Bin Abu
    account_no: '112233445566',
    account_type: 'Savings',
    balance: 11850.50, // Adjusted balance after transactions
    account_status: 'Active',
    created_at: '2024-01-10T10:05:00Z',
  },
  {
    account_id: 'a2b2c2d2-e2f2-02a2-b2c2-d2e2f202a2b2', // Unique UUID (Siti's Savings)
    customer_id: customers[1].customer_id, // Link to Siti Binti Ismail
    account_no: '998877665544',
    account_type: 'Savings',
    balance: 9445.25, // Adjusted balance after transactions
    account_status: 'Active',
    created_at: '2024-02-15T11:35:00Z',
  },
  {
    account_id: 'a3b3c3d3-e3f3-03a3-b3c3-d3e3f303a3b3', // Unique UUID (Siti's Current)
    customer_id: customers[1].customer_id, // Another account for Siti
    account_no: '556677889900',
    account_type: 'Current',
    balance: 24000.00, // Adjusted balance after transaction
    account_status: 'Active',
    created_at: '2024-03-01T09:00:00Z',
  },

  // --- New Accounts (Transaction Receivers) ---
  {
    account_id: 'a4b4c4d4-e4f4-04a4-b4c4-d4e4f404a4b4', // Unique UUID (Chong Wei's Account)
    customer_id: customers[2].customer_id, // Link to Chong Wei
    account_no: '888811112222', // Receiver from transaction 1
    account_type: 'Savings',
    balance: 150.00, // Received amount from transaction 1
    account_status: 'Active',
    created_at: '2024-05-20T09:05:00Z',
  },
  {
    account_id: 'a5b5c5d5-e5f5-05a5-b5c5-d5e5f505a5b5', // Unique UUID (Muthu Samy's Account)
    customer_id: customers[3].customer_id, // Link to Muthu Samy
    account_no: '777733334444', // Receiver from transaction 2
    account_type: 'Current',
    balance: 55.50, // Received amount from transaction 2
    account_status: 'Active',
    created_at: '2024-06-11T14:20:00Z',
  },
  {
    account_id: 'a6b6c6d6-e6f6-06a6-b6c6-d6e6f606a6b6', // Unique UUID (Sarah Tan's Account)
    customer_id: customers[4].customer_id, // Link to Sarah Tan
    account_no: '666655554444', // Receiver from transaction 4
    account_type: 'Savings',
    balance: 2000.00, // Received amount from transaction 4
    account_status: 'Active',
    created_at: '2024-07-01T16:50:00Z',
  },
];