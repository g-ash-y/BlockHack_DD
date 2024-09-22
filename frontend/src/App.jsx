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
      <header>
        <h1>Supply Chain UI</h1>
        <p>Account: {account}</p>
      </header>
      <main>
        <section>
          <h2>Create New Product</h2>
          <form onSubmit={handleNewProductSubmit}>
            <label>
              Name:
              <input type="text" value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} />
            </label>
            <br />
            <label>
              Description:
              <input type="text" value={newProduct.description} onChange={(event) => setNewProduct({ ...newProduct, description: event.target.value })} />
            </label>
            <br />
            <label>
              Price:
              <input type="number" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })} />
            </label>
            <br />
            <button type="submit">Create Product</button>
          </form>
        </section>
        <section>
          <h2>Products</h2>
          <ul>
            {products.map((product, index) => (
              <li key={index}>
                <span>{product.name}</span>
                <span>{product.description}</span>
                <span>{product.price} ETH</span>
                <button onClick={() => handleProductClick(product.id)}>View Details</button>
              </li>
            ))}
          </ul>
        </section>
        {selectedProduct && (
          <section>
            <h2>Product Details</h2>
            <p>Id: {selectedProduct.id}</p>
            <p>Name: {selectedProduct.name}</p>
            <p>Description: {selectedProduct.description}</p>
            <p>Price: {selectedProduct.price} ETH</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default SupplyChainUI;