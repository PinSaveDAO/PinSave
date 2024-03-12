import { Field, UInt64, Struct, MerkleMap } from 'o1js';

export class InitState extends Struct({
  initialRoot: Field,
  totalInited: Field,
  feeAmount: UInt64,
  maxSupply: Field,
}) {
  toFields(): Field[] {
    return InitState.toFields(this);
  }
}

export function createInitState(
  merkleMap: MerkleMap,
  totalInited: number,
  feeAmount: number = 0,
  maxSupply: number = 255
) {
  const rootBefore: Field = merkleMap.getRoot();
  const totalInitedField = Field(totalInited);
  const feeAmountU64 = UInt64.from(feeAmount);
  const maxSupplyField = Field(maxSupply);
  const initStruct: InitState = {
    initialRoot: rootBefore,
    totalInited: totalInitedField,
    feeAmount: feeAmountU64,
    maxSupply: maxSupplyField,
    toFields: function (): Field[] {
      return InitState.toFields(this);
    },
  };
  return initStruct;
}
