/*
 * This is an example of an AssemblyScript smart contract with two simple,
 * symmetric functions:
 *
 * 1. setGreeting: accepts a greeting, such as "howdy", and records it for the
 *    user (account_id) who sent the request
 * 2. getGreeting: accepts an account_id and returns the greeting saved for it,
 *    defaulting to "Hello"
 *
 * Learn more about writing NEAR smart contracts with AssemblyScript:
 * https://docs.near.org/docs/develop/contracts/as/intro
 *
 */

import { Context, logging, storage } from 'near-sdk-as'
import { Product, products} from './model';

const DEFAULT_MESSAGE = 'Hello'
const INIT_ID = 0;

// Exported functions will be part of the public interface for your smart contract.
// Feel free to extract behavior to non-exported functions!
export function getGreeting(accountId: string): string | null {
  // This uses raw `storage.get`, a low-level way to interact with on-chain
  // storage for simple contracts.
  // If you have something more complex, check out persistent collections:
  // https://docs.near.org/docs/concepts/data-storage#assemblyscript-collection-types
  return storage.get<string>(accountId, DEFAULT_MESSAGE)
}
export function setGreeting(message: string): void {
  const account_id = Context.sender

  // Use logging.log to record logs permanently to the blockchain!
  logging.log(
    // String interpolation (`like ${this}`) is a work in progress:
    // https://github.com/AssemblyScript/assemblyscript/pull/1115
    'Saving greeting "' + message + '" for account "' + account_id + '"'
  )

  storage.set(account_id, message)

}
export function addProduct(name: string, description: string, brand: string, image: string, price: i32):void {
  let product_owner = Context.sender;
  let product_id = products.length + 1;
  let product = new Product(product_id, product_owner, name, description, brand, image, price);
  let index = products.push(product);
  logging.log(product);
}

export function getProducts() : Product[] {
  let results = new Array<Product>();

  for(let i = 0; i < products.length; i ++) {
      results.push(products[i]);
  }
  return results;
}
export function buyProduct(_id: i32, _newOwner: string):bool {
  for(let i = 0; i < products.length; i ++) {
    let id = products[i].id;

    if(id == _id) {
      let name = products[i].name;
      let description = products[i].description;
      let brand = products[i].brand;
      let image = products[i].image;
      let price = products[i].price;

      let updatedProduct = new Product(id, _newOwner, name, description, brand, image, price);
      products.replace(i, updatedProduct);
      return true;
    }
  }
  return false;
}


