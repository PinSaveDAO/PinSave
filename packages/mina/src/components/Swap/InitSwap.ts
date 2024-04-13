import { Field, UInt64, Struct, MerkleMap } from 'o1js';

export class InitSwapState extends Struct({
  initialRoot: Field,
  initialOrdersAmount: Field,
  feeAmount: UInt64,
}) {
  toFields(): Field[] {
    return InitSwapState.toFields(this);
  }
}

export function createInitSwapState(
  merkleMap: MerkleMap,
  initialOrdersAmount: Field = Field(0),
  feeAmount: number = 0
): InitSwapState {
  const rootBefore: Field = merkleMap.getRoot();
  const feeAmountU64: UInt64 = UInt64.from(feeAmount);
  const initStruct: InitSwapState = new InitSwapState({
    initialRoot: rootBefore,
    initialOrdersAmount: initialOrdersAmount,
    feeAmount: feeAmountU64,
  });
  return initStruct;
}
