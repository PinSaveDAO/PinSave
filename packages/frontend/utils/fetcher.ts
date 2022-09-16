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
  const { data, error } = await response.json();

  if (error) throw error;

  return data;
};

export default fetcher;
