export const CHAINS = {
  maticmum: 80001,
  fantom: 250,
  filecoin: 314,
  goerli: 5,
};

export const ORBIS_CHAINS = {
  maticmum: "",
  fantom: "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
  filecoin: "kjzl6cwe1jw147hcck185xfdlrxq9zv0y0hoa6shzskqfnio56lhf8190yaei7w",
  goerli: "",
};

export type ChainName = keyof typeof CHAINS;
