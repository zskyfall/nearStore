import { env, PersistentVector, PersistentMap } from "near-sdk-as";
@nearBindgen
export class Product {
  id: i32;
  owner: string;
  name: string;
  description: string;
  brand: string;
  image: string;
  price: i32;

  constructor(id: i32, owner: string, name: string, description: string, brand: string, image: string, price: i32) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.description = description;
    this.brand = brand;
    this.image = image;
    this.price = price;
  }

  greet(userId: string): string {
    return "Hello, " + userId;
  }
}// An array that stores messages on the blockchain
export const products = new PersistentVector<Product>("prds");


