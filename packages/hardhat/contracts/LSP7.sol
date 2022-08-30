// SPDX-License-Identifier: MIT

import "@lukso/lsp-smart-contracts/contracts/LSP7DigitalAsset/presets/LSP7Mintable.sol";

pragma solidity ^0.8.0;

contract PinSave is LSP7Mintable {

    struct Post {
      string cid;
      address author;
      uint256 id;
    }

    Post latestPost;
    uint256 private postsCounter;

    /**
     * @notice Sets the token-Metadata and register LSP7InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP7Mintable(name_, symbol_, newOwner_, isNFT_) {}

/*     function createPost(uint256 _quantity) public {
        _mint(msg.sender, _quantity, true, "");
    } */
    function createPost(string calldata _cid) public {

      latestPost.cid = _cid;
      latestPost.author = msg.sender;
      latestPost.id = ++postsCounter;

      _mint(msg.sender, 1, true, "");
    }


}