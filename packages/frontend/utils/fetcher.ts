const fetcher = async (input: RequestInfo, params = {}) => {
  const response = await fetch(input, {
    mode: "cors",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    ...params,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();

  return data;
};

export default fetcher;
