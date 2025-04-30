import { customers } from "@/assets/data/dummyCustomers";

export const fetchCustomerDetails = async (customerID?: string) => {
  // Simulate a network request with a delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Find the account by either accountID or accountNo
  const customer = customers.find(
    (customer) => customer.customer_id === customerID
  );

  // Return the found account or undefined if not found
  return customer;
};
