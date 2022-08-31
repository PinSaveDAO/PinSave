// SPDX-License-Identifier: MIT

import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";
// import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/presets/LSP8MintableCore.sol";

pragma solidity ^0.8.0;

contract PinSaveL8 is LSP8IdentifiableDigitalAsset {

    struct Post {
      string cid;
      // address author;
      uint256 id;
    }

    Post latestPost;
    uint256 private postsCounter;
    uint[] public postsIds;
    mapping(uint256 => Post) public postByTokenId;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}


    function createPost(string memory _cid, bytes32 tokenId) public {

      latestPost.cid = _cid;
      //latestPost.author = msg.sender;
      latestPost.id = ++postsCounter;

      postByTokenId[postsCounter] = latestPost;

      _mint(msg.sender, tokenId , true, "");
    }


    function getPost(uint id) public view returns(string memory){
      return postByTokenId[id].cid;
    }

}