import { loans } from "@/assets/data/dummyLoans";
import { supabase } from "../lib/supabase.js";

const fetchLoanDetails = async (isMockEnabled: boolean, loanId: string) => {
  if (isMockEnabled) {
    const loan = loans.find((loan) => String(loan.loan_id) === loanId);
    if (!loan) {
      console.warn("Loan not found in mock data:", loanId);
      return undefined;
    }
    console.log("Returning mock loan data:", loan);
    
    return loan;
  }

  let { data, error } = await supabase
  .from('Loan')
  .select('*')
  .eq('loan_id', loanId)

  return data;
};

export default fetchLoanDetails;
