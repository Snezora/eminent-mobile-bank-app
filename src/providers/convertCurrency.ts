// https://github.com/fawazahmed0/exchange-api

export const convertUSDToMYR = async (amount: number, date?: string) => {
  let response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${
      date ?? "latest"
    }/v1/currencies/usd.json`
  );
  if (!response.ok) {
    response = await fetch(
      `https://${
        date ?? "latest"
      }.currency-api.pages.dev/v1/currencies/usd.json`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate data");
    }
  } else {
    const data = await response.json();
    const exchangeRate = data.usd.myr;
    const convertedAmount = amount * exchangeRate;
    return convertedAmount;
  }
};

export const convertCurrency = async (
  amount: number,
  from: string,
  to: string,
  date?: string
) => {
  let response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${
      date ?? "latest"
    }/v1/currencies/${from}.json`
  );
  if (!response.ok) {
    response = await fetch(
      `https://${date ?? "latest"}.currency-api.pages.dev/v1/currencies/${from}.json`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rate data");
    }
  } else {
    const data = await response.json();
    const exchangeRate = data[from][to];
    const convertedAmount = amount * exchangeRate;
    return convertedAmount;
  }
}
