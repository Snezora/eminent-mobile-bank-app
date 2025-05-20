// dummyTransactions.ts
import { Transaction } from './types';
import { accounts } from './dummyAccounts'; // Import accounts to link

export const transactions: Transaction[] = [
  {
    transaction_id: 't1a1b1c1-d1e1-f101-a1b1-c1d1e1f101t1', // Unique UUID
    initiator_account_id: accounts[0].account_id, // Ali's Savings account
    receiver_account_no: '888811112222', // Sample receiver
    amount: 150.00,
    purpose: 'Dinner Payment',
    type_of_transfer: 'DuitNow',
    transfer_datetime: '2025-04-03T19:30:00Z',
  },
  {
    transaction_id: 't2a2b2c2-d2e2-f202-a2b2-c2d2e2f202t2', // Unique UUID
    initiator_account_id: accounts[1].account_id, // Siti's Savings account
    receiver_account_no: '777733334444', // Sample receiver
    amount: 55.50,
    purpose: 'Online Shopping',
    type_of_transfer: 'Instant Transfer',
    transfer_datetime: '2025-04-04T11:15:00Z',
  },
  {
    transaction_id: 't3a3b3c3-d3e3-f303-a3b3-c3d3e3f303t3', // Unique UUID
    initiator_account_id: accounts[2].account_id, // Siti's Current account
    receiver_account_no: accounts[1].account_no, // Transfer to her own savings
    amount: 1000.00,
    purpose: 'Savings Transfer',
    type_of_transfer: 'Internal Transfer',
    transfer_datetime: '2025-04-10T09:00:00Z',
  },
  {
    transaction_id: 't4a4b4c4-d4e4-f404-a4b4-c4d4e4f404t4', // Unique UUID
    initiator_account_id: accounts[0].account_id, // Ali's Savings account
    receiver_account_no: '666655554444', // Sample receiver
    amount: 2000.00,
    purpose: 'Rent',
    type_of_transfer: 'IBG',
    transfer_datetime: '2025-04-01T08:00:00Z',
  },
  {
    transaction_id: 't6a6b6c6-d6e6-f606-a6b6-c6d6e6f606t6', // Unique UUID
    initiator_account_id: accounts[2].account_id, // Siti's Current account
    receiver_account_no: accounts[0].account_no, // Transfer to Ali's Savings
    amount: 500.00,
    purpose: 'Loan Repayment',
    type_of_transfer: 'Internal Transfer',
    transfer_datetime: '2025-04-08T12:00:00Z',
  },
];