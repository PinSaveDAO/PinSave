// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.16;

import "@uma/core/contracts/optimistic-oracle-v3/implementation/ClaimData.sol";
import "@uma/core/contracts/optimistic-oracle-v3/interfaces/OptimisticOracleV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PinSaveOO {
    using SafeERC20 for IERC20;
    IERC20 public immutable defaultCurrency;
    OptimisticOracleV3Interface public immutable oo;
    uint64 public constant assertionLiveness = 60;
    bytes32 public immutable defaultIdentifier;
    uint256 private count;

    struct DataAssertion {
        bytes32 dataId; // The dataId that was asserted.
        bytes32 data; // Why post is Bad
        address asserter; // The address that made the assertion.
        bool resolved; // Whether the assertion has been resolved.
        uint256 counter;
    }

    mapping(bytes32 => DataAssertion) public assertionsData;

    event DataAsserted(
        bytes32 indexed dataId,
        bytes32 data,
        address indexed asserter,
        bytes32 indexed assertionId
    );

    event DataAssertionResolved(
        bytes32 indexed dataId,
        bytes32 data,
        address indexed asserter,
        bytes32 indexed assertionId
    );

    constructor(address _defaultCurrency, address _optimisticOracleV3) {
        defaultCurrency = IERC20(_defaultCurrency);
        oo = OptimisticOracleV3Interface(_optimisticOracleV3);
        defaultIdentifier = oo.defaultIdentifier();
    }

    function getData(bytes32 assertionId) public view returns (bytes32) {
        return (assertionsData[assertionId].data);
    }

    function getAsserter(bytes32 assertionId) public view returns (address) {
        return (assertionsData[assertionId].asserter);
    }

    function isResolved(bytes32 assertionId) public view returns (bool) {
        return (assertionsData[assertionId].resolved);
    }

    function assertDataFor(
        bytes32 dataId,
        bytes32 data,
        address asserter
    ) public returns (bytes32 assertionId) {
        asserter = asserter == address(0) ? msg.sender : asserter;
        uint256 bond = oo.getMinimumBond(address(defaultCurrency));
        defaultCurrency.safeTransferFrom(msg.sender, address(this), bond);
        defaultCurrency.safeApprove(address(oo), bond);


        assertionId = oo.assertTruth(
            abi.encodePacked(
                "Data asserted: 0x", // in the example data is type bytes32 so we add the hex prefix 0x.
                ClaimData.toUtf8Bytes(data),
                " for dataId: 0x",
                ClaimData.toUtf8Bytes(dataId),
                " and asserter: 0x",
                ClaimData.toUtf8BytesAddress(asserter),
                " at timestamp: ",
                ClaimData.toUtf8BytesUint(block.timestamp),
                " in the DataAsserter contract at 0x",
                ClaimData.toUtf8BytesAddress(address(this)),
                " is valid."
            ),
            asserter,
            address(this),
            address(0), 
            assertionLiveness,
            defaultCurrency,
            bond,
            defaultIdentifier,
            bytes32(0)
        );
        

        assertionsData[assertionId] = DataAssertion(
            dataId,
            data,
            asserter,
            false,
            counter++
        );

        emit DataAsserted(dataId, data, asserter, assertionId);
    }

    function assertionResolvedCallback(
        bytes32 assertionId,
        bool assertedTruthfully
    ) public {
        require(msg.sender == address(oo));
        if (assertedTruthfully) {
            assertionsData[assertionId].resolved = true;
            DataAssertion memory dataAssertion = assertionsData[assertionId];
            emit DataAssertionResolved(
                dataAssertion.dataId,
                dataAssertion.data,
                dataAssertion.asserter,
                assertionId
            );
            // Else delete the data assertion if it was false to save gas.
        } else delete assertionsData[assertionId];
    }

    function assertionDisputedCallback(bytes32 assertionId) public {}

    function getCount() public view returns (uint256) {
        return count;
    }
}
