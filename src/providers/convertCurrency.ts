// https://github.com/fawazahmed0/exchange-api

export const convertUSDToMYR = async (amount: number, date?: string) => {
  const response = await fetch(
    "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json"
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  } else {
    const data = await response.json();
    const exchangeRate = data.usd.myr;
    const convertedAmount = amount * exchangeRate;
    return convertedAmount;
  }
};
