// dummyCustomers.ts (Updated)
import { Customer } from './types';

// Assuming these user_uuids exist in your auth.users table
const user1Uuid = '11111111-1111-1111-1111-111111111111'; // Ali
const user2Uuid = '22222222-2222-2222-2222-222222222222'; // Siti
const user3Uuid = '33333333-3333-3333-3333-333333333333'; // Chong Wei
const user4Uuid = '44444444-4444-4444-4444-444444444444'; // Muthu Samy
const user5Uuid = '55555555-5555-5555-5555-555555555555'; // Sarah Tan

export const customers: Customer[] = [
  // Existing Customers
  {
    customer_id: 'c1a1b1c1-d1e1-f101-a1b1-c1d1e1f101a1', // Unique UUID for customer 1 (Ali)
    user_uuid: user1Uuid,
    first_name: 'Ali',
    last_name: 'Bin Abu',
    date_of_birth: '1990-05-15T00:00:00Z',
    passport_no: 'A12345678',
    phone_no: '+60123456789',
    home_address: '1 Jalan Bukit Bintang, 55100 Kuala Lumpur',
    ic_no: '900515-14-1111',
    created_at: '2024-01-10T10:00:00Z',
    nationality: 'Malaysian',
    username: 'ali_abu',
  },
  {
    customer_id: 'c2a2b2c2-d2e2-f202-a2b2-c2d2e2f202a2', // Unique UUID for customer 2 (Siti)
    user_uuid: user2Uuid,
    first_name: 'Siti',
    last_name: 'Binti Ismail',
    date_of_birth: '1985-11-22T00:00:00Z',
    passport_no: null,
    phone_no: '+60198765432',
    home_address: '2 Lorong Damai, 47300 Petaling Jaya, Selangor',
    ic_no: '851122-10-2222',
    created_at: '2024-02-15T11:30:00Z',
    nationality: 'Malaysian',
    username: 'siti_ismail',
  },

  // --- New Customers (Transaction Receivers) ---
  {
    customer_id: 'c3a3b3c3-d3e3-f303-a3b3-c3d3e3f303a3', // Unique UUID for customer 3 (Chong Wei)
    user_uuid: user3Uuid,
    first_name: 'Chong',
    last_name: 'Wei',
    date_of_birth: '1988-08-01T00:00:00Z',
    passport_no: 'K98765432',
    phone_no: '+60161112222',
    home_address: '3 Persiaran Utama, 60000 Kuala Lumpur',
    ic_no: null,
    created_at: '2024-05-20T09:00:00Z',
    nationality: 'Malaysian',
    username: 'chong_wei',
  },
  {
    customer_id: 'c4a4b4c4-d4e4-f404-a4b4-c4d4e4f404a4', // Unique UUID for customer 4 (Muthu Samy)
    user_uuid: user4Uuid,
    first_name: 'Muthu',
    last_name: 'Samy',
    date_of_birth: '1975-03-10T00:00:00Z',
    passport_no: null,
    phone_no: '+60172223333',
    home_address: '4 Jalan Klang Lama, 58000 Kuala Lumpur',
    ic_no: '750310-10-4444',
    created_at: '2024-06-11T14:15:00Z',
    nationality: 'Malaysian',
    username: 'muthu_samy',
  },
  {
    customer_id: 'c5a5b5c5-d5e5-f505-a5b5-c5d5e5f505a5', // Unique UUID for customer 5 (Sarah Tan)
    user_uuid: user5Uuid,
    first_name: 'Sarah',
    last_name: 'Tan',
    date_of_birth: '1995-12-30T00:00:00Z',
    passport_no: 'E55667788',
    phone_no: '+60183334444',
    home_address: '5 Jalan SS2/2, 47300 Petaling Jaya, Selangor',
    ic_no: '951230-14-5555',
    created_at: '2024-07-01T16:45:00Z',
    nationality: 'Malaysian',
    username: 'sarah_tan',
  },
];