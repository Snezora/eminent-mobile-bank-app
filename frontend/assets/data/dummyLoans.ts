// dummyLoans.ts (Updated with account numbers)
import { Loan } from './types';
import { customers } from './dummyCustomers'; // Import customers to link
import { accounts } from './dummyAccounts'; // Import accounts to link

export const loans: Loan[] = [
  {
    loan_id: 1001, // Example bigint ID
    customer_id: customers[0].customer_id, // Link to Ali Bin Abu
    account_number: accounts[0].account_no, // Link to Ali Bin Abu's account
    customer_annual_income: 90000.0,
    customer_job_company_name: 'Tech Solutions Sdn Bhd',
    customer_job_title: 'Software Engineer',
    customer_job_years: 5,
    customer_home_ownership: 'RENT',
    loan_intent: 'PERSONAL',
    loan_grade: 'B',
    loan_interest_rate: 7.5, // Example interest rate
    loan_amount: 50000.0, // Loan amount added
    customer_credit_score: 720,
    customer_credit_history_years: 5,
    customer_default: false,
    application_date: '2025-03-10T10:00:00Z', // ISO string format
    ai_prediction: {
      predicted_approval: true,
      predicted_risk_level: 'Low',
      score: 0.85,
    },
    final_approval: true, // Approved
  },
  {
    loan_id: 1002, // Example bigint ID
    customer_id: customers[1].customer_id, // Link to Siti Binti Ismail
    account_number: accounts[1].account_no, // Link to Siti Binti Ismail's account
    customer_annual_income: 120000.0,
    customer_job_company_name: 'Global Marketing Services',
    customer_job_title: 'Marketing Manager',
    customer_job_years: 8,
    customer_home_ownership: 'MORTGAGE',
    loan_intent: 'HOMEIMPROVEMENT',
    loan_grade: 'A',
    loan_interest_rate: 5.2, // Example interest rate
    loan_amount: 150000.0, // Loan amount added
    customer_credit_score: 780,
    customer_credit_history_years: 10,
    customer_default: false,
    application_date: '2025-03-20T11:30:00Z', // ISO string format
    ai_prediction: {
      predicted_approval: true,
      predicted_risk_level: 'Very Low',
      score: 0.92,
    },
    final_approval: null, // Still Pending
  },
  {
    loan_id: 1003, // Example bigint ID
    customer_id: customers[0].customer_id, // Another loan application for Ali
    account_number: accounts[0].account_no, // Link to Ali Bin Abu's account
    customer_annual_income: 90000.0,
    customer_job_company_name: 'Tech Solutions Sdn Bhd',
    customer_job_title: 'Software Engineer',
    customer_job_years: 5,
    customer_home_ownership: 'RENT',
    loan_intent: 'DEBTCONSOLIDATION',
    loan_grade: 'C',
    loan_interest_rate: 11.8, // Higher rate
    loan_amount: 30000.0, // Loan amount added
    customer_credit_score: 720,
    customer_credit_history_years: 5,
    customer_default: false,
    application_date: '2025-04-01T09:15:00Z', // ISO string format
    ai_prediction: {
      predicted_approval: false,
      predicted_risk_level: 'Medium',
      score: 0.65,
    },
    final_approval: false, // Rejected
  },
  {
    loan_id: 1004, // New example
    customer_id: customers[2].customer_id, // Link to a new customer
    account_number: accounts[2].account_no, // Link to the new customer's account
    customer_annual_income: 45000.0,
    customer_job_company_name: 'Retail Solutions',
    customer_job_title: 'Sales Associate',
    customer_job_years: 2,
    customer_home_ownership: 'RENT',
    loan_intent: 'SMALLBUSINESS',
    loan_grade: 'D',
    loan_interest_rate: 15.0, // Higher rate for riskier loan
    loan_amount: 20000.0, // Loan amount added
    customer_credit_score: 650,
    customer_credit_history_years: 3,
    customer_default: true, // Defaulted on a previous loan
    application_date: '2025-04-15T14:45:00Z', // ISO string format
    ai_prediction: {
      predicted_approval: false,
      predicted_risk_level: 'High',
      score: 0.45,
    },
    final_approval: true, // Rejected
  },
  {
    loan_id: 1005, // New example
    customer_id: customers[3].customer_id, // Link to another new customer
    account_number: accounts[3].account_no, // Link to the new customer's account
    customer_annual_income: 200000.0,
    customer_job_company_name: 'Enterprise Solutions Inc.',
    customer_job_title: 'Chief Technology Officer',
    customer_job_years: 15,
    customer_home_ownership: 'OWN',
    loan_intent: 'EDUCATION',
    loan_grade: 'A',
    loan_interest_rate: 4.5, // Low rate for high credit score
    loan_amount: 100000.0, // Loan amount added
    customer_credit_score: 820,
    customer_credit_history_years: 20,
    customer_default: false,
    application_date: '2025-05-01T08:00:00Z', // ISO string format
    ai_prediction: {
      predicted_approval: true,
      predicted_risk_level: 'Very Low',
      score: 0.98,
    },
    final_approval: null,
  },
];