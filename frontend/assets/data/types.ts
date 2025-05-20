export interface Customer {
  customer_id: string; // uuid
  user_uuid: string; // uuid (linking to auth.users)
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null; // timestamptz - using ISO string format
  passport_no: string | null;
  phone_no: string | null;
  home_address: string | null;
  ic_no: string | null; // Assuming this might be Identity Card number
  created_at: string; // timestamptz
  nationality: string | null;
  username: string | null;
}

export interface Account {
  account_id: string; // uuid
  customer_id: string; // uuid (FK to Customer)
  account_no: string; // text
  account_type: string | null; // text (e.g., 'Savings', 'Current')
  balance: number; // float8 / numeric
  account_status: string | null; // text (e.g., 'Active', 'Dormant', 'Closed')
  created_at: string; // timestamptz
}

export interface Transaction {
  transaction_id: string; // uuid
  initiator_account_id: string; // uuid (FK to Account)
  receiver_account_no: string; // text
  amount: number; // float4
  purpose: string | null; // text
  type_of_transfer: string | null; // text (e.g., 'DuitNow', 'IBG', 'Instant')
  transfer_datetime: string; // timestamptz
}

export interface PredictionScore {
  predicted_approval: boolean; // boolean
  score: number; // float8 / numeric
    
}

export interface Loan {
    loan_id: number; // bigint
    loan_amount: number; // double precision (e.g., 50000.0)
    account_number: string; // text (FK to Account)
    customer_id: string; // uuid (FK to Customer)
    customer_annual_income: number | null; // double precision
    customer_job_company_name: string | null; // text
    customer_job_title: string | null; // text
    customer_job_years: number | null; // integer
    customer_home_ownership: string | null; // text (e.g., 'RENT', 'OWN', 'MORTGAGE')
    loan_intent: string | null; // text (e.g., 'PERSONAL', 'MEDICAL', 'VENTURE', 'HOMEIMPROVEMENT', 'DEBTCONSOLIDATION', 'EDUCATION')
    loan_grade: string | null; // text (e.g., 'A', 'B', 'C', 'D', 'E', 'F', 'G')
    loan_interest_rate: number | null; // double precision
    customer_credit_score: number | null; // integer
    customer_credit_history_years: number | null; // bigint
    customer_default: boolean | null; // boolean (Has the customer defaulted before?)
    application_date: string; // timestamp with time zone (ISO string)
    ai_prediction: object | null; // json (Can store prediction results, score, etc.)
    final_approval: boolean | null; // boolean (True=Approved, False=Rejected, Null=Pending)
  }

export interface Admin {
  admin_id: string; // uuid
  user_uuid: string; // uuid (linking to auth.users)
  username: string | null;
  role: string | null; // text (e.g., 'Manager', 'Approver')
  created_at: string; // timestamptz
}

export interface AdminLoan {
  entry_id: string; // uuid (PK for this join table)
  admin_id: string; // uuid (FK to Admin)
  loan_id: number; // uuid (FK to Loan)
  admin_approve: boolean | null;
  created_at: string; // timestamptz
}
