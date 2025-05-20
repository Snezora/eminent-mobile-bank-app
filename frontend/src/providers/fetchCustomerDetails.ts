import { customers } from "@/assets/data/dummyCustomers";
import { supabase } from "../lib/supabase";

export const fetchCustomerDetails = async (customerID?: string) => {
  let { data, error } = await supabase
  .from('Customer')
  .select('*')
  .eq('customer_id', customerID)
  .single();

  // Return the found account or undefined if not found
  return data;
};
