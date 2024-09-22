import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './SupplyChainUI.css';
import { abi } from "./SupplyChain.json";
import { contracts } from "./deployed_addresses.json";

const SupplyChainUI = () => {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const initEthers = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);

      const contractAddress = contracts; // Replace with your contract address
      const contractABI = [abi]; // Replace with your contract ABI
      const contractInstance = new ethers.Contract(contractAddress, contractABI, provider);
      setContract(contractInstance);
    };

    initEthers();
  }, []);

  const handleNewProductSubmit = async (event) => {
    event.preventDefault();
    try {
      const tx = await contract.createProduct(newProduct.name, newProduct.description, newProduct.price, {
        from: account,
        value: ethers.utils.parseEther('0.01'), // Replace with your desired gas price
      });
      await tx.wait();
      setNewProduct({ name: '', description: '', price: 0 });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const product = await contract.getProduct(productId);
      setSelectedProduct(product);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await contract.getProducts();
      setProducts(products);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [contract]);

  return (
    <div className="container">
      <header className="header">
        <h1>Suppliers Record</h1>
        <br />
        <br />
        
      </header>
      
      <main className="main-content">
        <section className="new-product-section">
          <p className="account-info"> Account: {account}</p>
          <h2>Create New Product</h2>
          <form onSubmit={handleNewProductSubmit} className="product-form">
            <label>
              <b>Name: </b>
              <input
                type="text"
                value={newProduct.name}
                onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })}
                className="input-field"
              />
            </label>
            <br />
            <br />
            
            <label>
              <b>Description: </b>
              <input
                type="text"
                value={newProduct.description}
                onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })}
                className="input-field"
              />
            </label>
            <br />
            <br />
            
            <label>
              <b>Price: </b>
              <input
                type="number"
                value={newProduct.price}
                onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })}
                className="input-field"
              />
            </label>
            <br />
            
            <br />
            <button type="submit" className="submit-button">Create Product</button>
          </form>
        </section>
        <br />
        <br />
        <section className="products-section">
          <h2>Products</h2>
          <ul className="product-list">
            {products.map((product, index) => (
              <li key={index} className="product-item">
                <span className="product-name">{product.name}</span>
                <span className="product-description">{product.description}</span>
                <span className="product-price">{product.price} ETH</span>
                <button onClick={() => handleProductClick(product.id)} className="view-details-button">View Details</button>
              </li>
            ))}
          </ul>
        </section>
  
        {selectedProduct && (
          <section className="product-details-section">
            <h2>Product Details</h2>
            <p><strong>Id:</strong> {selectedProduct.id}</p>
            <p><strong>Name:</strong> {selectedProduct.name}</p>
            <p><strong>Description:</strong> {selectedProduct.description}</p>
            <p><strong>Price:</strong> {selectedProduct.price} ETH</p>
          </section>
        )}
      </main>
    </div>
  );
  
};

export default SupplyChainUI;