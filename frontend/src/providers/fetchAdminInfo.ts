import { supabase } from "../lib/supabase"

const fetchAdminInfo = async ({user_uuid} : {user_uuid: string}) => {
    const {data, error} = await supabase.from("Admin").select("*").eq("user_uuid", user_uuid).single();
    if (error) {
        console.error("Error fetching admin info:", error);
        throw error;
    }
    return data;
}

export default fetchAdminInfo;