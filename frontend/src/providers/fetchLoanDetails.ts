import { loans } from "@/assets/data/dummyLoans";
import { supabase } from "../lib/supabase";

const fetchLoanDetails = async (loanId: string) => {
  // Simulate a network request with a delay
  let { data, error } = await supabase
  .from('Loan')
  .select('*')
  .eq('loan_id', loanId)

  return data;
};

export default fetchLoanDetails;
