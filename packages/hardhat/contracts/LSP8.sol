// SPDX-License-Identifier: MIT

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
// import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableCore.sol";

pragma solidity ^0.8.0;

contract PinSaveL8 is LSP8IdentifiableDigitalAsset {

    struct Post {
      string cid;
      address author;
      uint256 id;
    }

    Post latestPost;
    uint256 private postsCounter;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}

    function mint(
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) public {
        _mint(to, tokenId, force, data);
    }

    function createPost(string calldata _cid, bytes32 tokenId) public {

      latestPost.cid = _cid;
      latestPost.author = msg.sender;
      latestPost.id = ++postsCounter;
      _mint(msg.sender, tokenId , true, "");
    }

}