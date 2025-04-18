// dummyLoans.ts (Rewritten)
import { Loan } from './types';
import { customers } from './dummyCustomers'; // Import customers to link

export const loans: Loan[] = [
  {
    loan_id: 1001, // Example bigint ID
    customer_id: customers[0].customer_id, // Link to Ali Bin Abu
    customer_annual_income: 90000.00,
    customer_job_company_name: 'Tech Solutions Sdn Bhd',
    customer_job_title: 'Software Engineer',
    customer_job_years: 5,
    customer_home_ownership: 'RENT',
    loan_intent: 'PERSONAL',
    loan_grade: 'B',
    loan_interest_rate: 7.5, // Example interest rate
    customer_credit_score: 720,
    customer_credit_history_years: 5,
    customer_default: false,
    application_date: '2025-03-10T10:00:00Z', // ISO string format
    ai_prediction: { // Example JSON object for AI prediction
      predicted_approval: true,
      predicted_risk_level: 'Low',
      score: 0.85,
    },
    final_approval: true, // Approved
  },
  {
    loan_id: 1002, // Example bigint ID
    customer_id: customers[1].customer_id, // Link to Siti Binti Ismail
    customer_annual_income: 120000.00,
    customer_job_company_name: 'Global Marketing Services',
    customer_job_title: 'Marketing Manager',
    customer_job_years: 8,
    customer_home_ownership: 'MORTGAGE', // Changed from 'Owned' for variety
    loan_intent: 'HOMEIMPROVEMENT',
    loan_grade: 'A',
    loan_interest_rate: 5.2, // Example interest rate
    customer_credit_score: 780,
    customer_credit_history_years: 10,
    customer_default: false,
    application_date: '2025-03-20T11:30:00Z', // ISO string format
    ai_prediction: { // Example JSON object
      predicted_approval: true,
      predicted_risk_level: 'Very Low',
      score: 0.92,
    },
    final_approval: null, // Still Pending
  },
  {
    loan_id: 1003, // Example bigint ID
    customer_id: customers[0].customer_id, // Another loan application for Ali
    customer_annual_income: 90000.00,
    customer_job_company_name: 'Tech Solutions Sdn Bhd',
    customer_job_title: 'Software Engineer',
    customer_job_years: 5,
    customer_home_ownership: 'RENT',
    loan_intent: 'DEBTCONSOLIDATION',
    loan_grade: 'C', // Lower grade example
    loan_interest_rate: 11.8, // Higher rate
    customer_credit_score: 720, // Same score, but different intent/rate
    customer_credit_history_years: 5,
    customer_default: false,
    application_date: '2025-04-01T09:15:00Z', // ISO string format
    ai_prediction: { // Example JSON object
      predicted_approval: false,
      predicted_risk_level: 'Medium',
      score: 0.65,
    },
    final_approval: false, // Rejected
  },
];