import { customers } from "@/assets/data/dummyCustomers";
import { supabase } from "../lib/supabase.js";

export const fetchCustomerDetails = async (
  isMockEnabled: boolean,
  customerID?: string
) => {
  if (isMockEnabled) {
    if (!customerID) {
      console.warn("Customer ID is required for mock data");
      return undefined;
    }
    const customer = customers.find(
      (customer) => customer.customer_id === customerID
    );
    if (!customer) {
      console.warn("Customer not found in mock data:", customerID);
      return undefined;
    }
    return customer;
  }

  let { data, error } = await supabase
    .from("Customer")
    .select("*")
    .eq("customer_id", customerID)
    .single();

  return data;
};
