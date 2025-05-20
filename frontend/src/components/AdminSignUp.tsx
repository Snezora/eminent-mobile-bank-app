import { supabase } from "../lib/supabase";

const activated = false;

const adminSignUp = async (
  email: string,
  password: string,
  username?: string
) => {
  if (!activated) {
    return;
  }
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: email,
        password: password,
      }
    );

    if (signUpError) {
      console.error("Error signing up admin:", signUpError.message);
      return;
    }

    console.log("Admin signed up successfully");
    console.log("SignUp Data: ", signUpData);

    const userUuid = signUpData.user?.id;

    if (!userUuid) {
      console.error("User UUID not found after sign-up.");
      return;
    }

    const { data, error } = await supabase
      .from("Admin")
      .insert([{ user_uuid: userUuid, username: username }])
      .select();

    if (error) {
      console.error("Error inserting admin data:", error.message);
    } else {
      console.log("Admin data inserted successfully: ", data);
    }
  } catch (error) {
    console.error("Unexpected error during admin sign-up:", error);
  }
};

export default adminSignUp;
