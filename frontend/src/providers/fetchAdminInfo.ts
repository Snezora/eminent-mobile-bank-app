import { supabase } from "../lib/supabase";
import { admins } from "@/assets/data/dummyAdmins";

const fetchAdminInfo = async ({
  user_uuid,
  isMockEnabled,
}: {
  user_uuid: string;
  isMockEnabled: boolean;
}) => {
  if (isMockEnabled) {
    // Mock data for development purposes
    const admin = admins.find((admin) => admin.user_uuid === user_uuid);
    if (!admin) {
      console.warn("Admin not found in mock data:", user_uuid);
      return null;
    }
    return admin;
  }

  const { data, error } = await supabase
    .from("Admin")
    .select("*")
    .eq("user_uuid", user_uuid)
    .single();
  if (error) {
    console.error("Error fetching admin info:", error);
    throw error;
  }
  return data;
};

export default fetchAdminInfo;
