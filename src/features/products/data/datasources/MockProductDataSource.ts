import { NewProduct, Product } from "../../domain/entities/Product";
import { ProductDataSource } from "./ProductDataSource";

/**
 * Mock implementation of ProductDataSource for local development
 * No backend connection required
 */
export class MockProductDataSource implements ProductDataSource {
  private products: Product[] = [
    {
      _id: "1",
      name: "Sample Product 1",
      quantity: 10,
      description: "This is a sample product",
    },
    {
      _id: "2",
      name: "Sample Product 2",
      quantity: 5,
      description: "Another sample product",
    },
  ];
  
  private nextId = 3;

  async getProducts(): Promise<Product[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.products];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.products.find(p => p._id === id);
  }

  async addProduct(product: NewProduct): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newProduct: Product = {
      ...product,
      _id: String(this.nextId++),
    };
    this.products.push(newProduct);
    console.log("Mock product added:", newProduct);
  }

  async updateProduct(product: Product): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.products.findIndex(p => p._id === product._id);
    if (index !== -1) {
      this.products[index] = product;
      console.log("Mock product updated:", product);
    }
  }

  async deleteProduct(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    this.products = this.products.filter(p => p._id !== id);
    console.log("Mock product deleted:", id);
  }
}
