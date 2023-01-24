// SPDX-License-Identifier: MIT

import "@lukso/lsp-smart-contracts/contracts/LSP0ERC725Account/LSP0ERC725AccountCore.sol";

pragma solidity ^0.8.0;

import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";

import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

bytes4 constant _INTERFACEID_ERC725X = 0x570ef073;
bytes4 constant _INTERFACEID_ERC725Y = 0x714df77c;

contract ERC725 is ERC725XCore, ERC725YCore {

    constructor(address newOwner) {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        OwnableUnset._setOwner(newOwner);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}