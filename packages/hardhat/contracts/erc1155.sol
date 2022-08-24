// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MyERC1155NFT is ERC1155 {
    string public name = "Collection";
    uint256 public constant Rock = 0;

    constructor() ERC1155("https://bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a.ipfs.dweb.link/{id}.json") {
}

    function mintRock() public{
        _mint(msg.sender, Rock, 1, "");
    }

    function uri(uint256 _tokenid) override public pure returns (string memory) {
        return string(
            abi.encodePacked(
                "https://bafybeihjjkwdrxxjnuwevlqtqmh3iegcadc32sio4wmo7bv2gbf34qs34a.ipfs.dweb.link/",
                Strings.toString(_tokenid),".json"
            )
        );
    }

    }