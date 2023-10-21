// SPDX-License-Identifier: MIT
import "@lukso/lsp-smart-contracts/contracts/LSP8IdentifiableDigitalAsset/LSP8IdentifiableDigitalAsset.sol";

pragma solidity 0.8.20;

contract LSP8PinSave is LSP8IdentifiableDigitalAsset {
    bool internal locked;
    modifier noReentrant() {
        require(!locked, "No re-entrancy");
        locked = true;
        _;
        locked = false;
    }

    struct Post {
      string cid;
      address author;
      uint256 id;
      bytes32 tokenId;
    }

    Post latestPost;
    uint256 private postsCounter;
    mapping(uint256 => Post) public postByTokenId;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_
    ) LSP8IdentifiableDigitalAsset(name_, symbol_, newOwner_) {}


    function createPost(address receiver, string memory _cid, bytes32 tokenId) public noReentrant {
      latestPost.cid = _cid;
      latestPost.author = msg.sender;
      latestPost.id = ++postsCounter;
      latestPost.tokenId = tokenId;
      postByTokenId[postsCounter] = latestPost;

      _mint(receiver, tokenId , true, "");
    }

    function createBatchPosts(
        address to,
        string[] memory _cid,
        bytes32[] memory tokenId
    ) public {
        uint len = tokenId.length;
        for (uint256 i; i != len;) {
          createPost(to, _cid[i], tokenId[i]);
          unchecked{++i;}
        }
    }

    function getPostOwner(uint id) external view returns(address){
      return tokenOwnerOf(postByTokenId[id].tokenId);
    }

    function getPostCid(uint id) external view returns(string memory){
      return postByTokenId[id].cid;
    }

    function getPostAuthor(uint id) public view returns(address){
      return postByTokenId[id].author;
    }
    
    receive() external payable {
        // Code to handle receiving Ether
    }

}