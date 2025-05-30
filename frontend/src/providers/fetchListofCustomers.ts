import { supabase } from "../lib/supabase";

const fetchListofCustomers = async () => {
  try {
    const { data, error } = await supabase
      .from("Customer")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
};

export default fetchListofCustomers;
