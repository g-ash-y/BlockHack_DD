//SPDX-License-Identifier:MIT
pragma solidity ^0.8.27;

import "./Roles.sol";

contract SupplyChain is Roles {
    uint256 public sku; // stock keeping unit
    uint256 public upc; // product code

    enum State { Created, ForSale, Sold, Shipped, Received, Purchased }

    struct Product {
        uint256 sku;
        uint256 upc;
        address ownerID;
        address originSupplierID;
        string originSupplierName;
        string originSupplierInformation;
        string productNotes;
        uint256 productPrice;
        State productState;
        address distributorID;
        address retailerID;
        address consumerID;
    }

    mapping(uint256 => Product) public products;

    event ProductCreated(uint256 upc);
    event ProductForSale(uint256 upc);
    event ProductSold(uint256 upc);
    event ProductShipped(uint256 upc);
    event ProductReceived(uint256 upc);
    event ProductPurchased(uint256 upc);

    modifier verifyCaller(address _address) {
        require(msg.sender == _address, "Caller is not authorized");
        _;
    }

    modifier paidEnough(uint256 _price) {
        require(msg.value >= _price, "Not enough Ether provided");
        _;
    }

    modifier checkValue(uint256 _upc) {
        _;
        uint256 _price = products[_upc].productPrice;
        uint256 amountToReturn = msg.value - _price;
        payable(products[_upc].consumerID).transfer(amountToReturn);
    }

    modifier inState(uint256 _upc, State _state) {
        require(products[_upc].productState == _state, "Invalid product state");
        _;
    }

    constructor() {
        sku = 1;
        upc = 1;
    }

    function createProduct(
        uint256 _upc,
        address _originSupplierID,
        string memory _originSupplierName,
        string memory _originSupplierInformation,
        string memory _productNotes
    ) public onlySupplier {
        products[_upc] = Product({
            sku: sku,
            upc: _upc,
            ownerID: _originSupplierID,
            originSupplierID: _originSupplierID,
            originSupplierName: _originSupplierName,
            originSupplierInformation: _originSupplierInformation,
            productNotes: _productNotes,
            productPrice: 0,
            productState: State.Created,
            distributorID: address(0),
            retailerID: address(0),
            consumerID: address(0)
        });
        sku = sku + 1;
        emit ProductCreated(_upc);
    }

    function sellProduct(uint256 _upc, uint256 _price) public onlySupplier inState(_upc, State.Created) verifyCaller(products[_upc].originSupplierID) {
        products[_upc].productPrice = _price;
        products[_upc].productState = State.ForSale;
        emit ProductForSale(_upc);
    }

    function buyProduct(uint256 _upc) public payable onlyDistributor inState(_upc, State.ForSale) paidEnough(products[_upc].productPrice) checkValue(_upc) {
        products[_upc].ownerID = msg.sender;
        products[_upc].distributorID = msg.sender;
        products[_upc].productState = State.Sold;

        payable(products[_upc].originSupplierID).transfer(products[_upc].productPrice);
        emit ProductSold(_upc);
    }

    function shipProduct(uint256 _upc) public onlyDistributor inState(_upc, State.Sold) verifyCaller(products[_upc].ownerID) {
        products[_upc].productState = State.Shipped;
        emit ProductShipped(_upc);
    }

    function receiveProduct(uint256 _upc) public onlyRetailer inState(_upc, State.Shipped) {
        products[_upc].ownerID = msg.sender;
        products[_upc].retailerID = msg.sender;
        products[_upc].productState = State.Received;
        emit ProductReceived(_upc);
    }

    function purchaseProduct(uint256 _upc) public payable onlyConsumer inState(_upc, State.Received) paidEnough(products[_upc].productPrice) checkValue(_upc) {
        products[_upc].ownerID = msg.sender;
        products[_upc].consumerID = msg.sender;
        products[_upc].productState = State.Purchased;

        payable(products[_upc].retailerID).transfer(products[_upc].productPrice);
        emit ProductPurchased(_upc);
    }
}