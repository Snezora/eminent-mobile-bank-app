import { supabase } from "../lib/supabase.js";
import { useAuth } from "./AuthProvider";
import { Admin, Customer, Loan } from "@/assets/data/types";
import { loans } from "@/assets/data/dummyLoans";

const fetchLoans = async (isMockEnabled: boolean, isAdmin: boolean, customer_id?: string) => {
  let response;

  if (isMockEnabled) {
    if (isAdmin) {
      return { data: loans, error: null };
    } else {
      return {
        data: loans.filter((loan) => loan.customer_id === customer_id),
        error: null,
      };
    }
  }

  if (isAdmin) {
    response = await supabase
      .from("Loan")
      .select("*")
      .order("application_date", { ascending: false });
  } else {
    response = await supabase
      .from("Loan")
      .select("*")
      .eq("customer_id", customer_id)
      .order("application_date", { ascending: false });
  }
  if (response.error) {
    console.error("Error fetching loans:", response.error);
  }
  return response;
};

export default fetchLoans;