 . SPDX-License-Identifier: !
pragma solidity ^0.8.20;

contract FakeProductIdentificationSystem {
    address public owner;

    struct Product {
        string name;
        string serialNumber;
        address manufacturer;
        uint256 timestamp;
        bool exists;
    }

    // Maps a unique product ID (e.g., hash of serial number) to Product details
    mapping(bytes32 => Product) private products;

    // Events
    event ProductRegistered(bytes32 indexed productId, string name, string serialNumber, address manufacturer);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerProduct(string memory name, string memory serialNumber) public onlyOwner {
        bytes32 productId = keccak256(abi.encodePacked(serialNumber));
        require(!products[productId].exists, "Product already registered.");

        products[productId] = Product({
            name: name,
            serialNumber: serialNumber,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit ProductRegistered(productId, name, serialNumber, msg.sender);
    }

    /**
     * @dev Verify if a product is authentic.
     * @param serialNumber Serial number of the product to verify.
     * @return isAuthentic True if product exists and is authentic.
     * @return productName Name of the product.
     * @return manufacturer Address of the manufacturer.
     * @return timestamp Registration timestamp.
     */
    function verifyProduct(string memory serialNumber)
        public
        view
        returns (bool isAuthentic, string memory productName, address manufacturer, uint256 timestamp)
    {
        bytes32 productId = keccak256(abi.encodePacked(serialNumber));
        Product memory product = products[productId];

        if (product.exists) {
            return (true, product.name, product.manufacturer, product.timestamp);
        } else {
            return (false, "", address(0), 0);
        }
    }

    /**
     * @dev Transfer contract ownership to a new manufacturer.
     * @param newOwner Address of the new owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address.");
        owner = newOwner;
    }
}
//
