import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthProvider";
import { Loan } from "@/assets/data/types";

const fetchLoans = async (user, isAdmin) => {
  let response;
  if (isAdmin) {
    response = await supabase
      .from("Loan")
      .select("*")
      .order("application_date", { ascending: false });
  } else {
    response = await supabase
      .from("Loan")
      .select("*")
      .eq("user_uuid", user?.user_uuid)
      .order("application_date", { ascending: false });
  }
  if (response.error) {
    console.error("Error fetching loans:", response.error);
  }
  return response;
};

export default fetchLoans;