import 'regenerator-runtime/runtime'
import { utils } from 'near-api-js';
import { initContract, login, logout, sendToken } from './utils'
import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

// global variable used throughout
let currentGreeting

const submitButton = document.querySelector('form button')

document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault()

  // get elements from the form using their id attribute
  const { fieldset, greeting } = event.target.elements

  // disable the form while the value gets updated on-chain
  fieldset.disabled = true

  try {
    // make an update call to the smart contract
    await window.contract.setGreeting({
      // pass the value that the user entered in the greeting field
      message: greeting.value
    })
  } catch (e) {
    alert(
      'Something went wrong! ' +
      'Maybe you need to sign out and back in? ' +
      'Check your browser console for more info.'
    )
    throw e
  } finally {
    // re-enable the form, whether the call succeeded or failed
    fieldset.disabled = false
  }

  // disable the save button, since it now matches the persisted value
  submitButton.disabled = true

  // update the greeting in the UI
  await fetchGreeting()

  // show notification
  document.querySelector('[data-behavior=notification]').style.display = 'block'

  // remove notification again after css animation completes
  // this allows it to be shown again next time the form is submitted
  setTimeout(() => {
    document.querySelector('[data-behavior=notification]').style.display = 'none'
  }, 11000)
}

document.querySelector('input#greeting').oninput = (event) => {
  if (event.target.value !== currentGreeting) {
    submitButton.disabled = false
  } else {
    submitButton.disabled = true
  }
}

async function fetchProducs() {
  let products = await contract.getProducts();
  console.log(products);

  products.forEach((product) => {
    let id = product.id;
    let owner = product.owner;
    let name = product.name;
    let description = product.description;
    let brand = product.brand;
    let image = product.image;
    let price = product.price;

    let product_item = '<div class="col-md-4 mb-3"><div class="card h-100"><div class="d-flex justify-content-between position-absolute w-100"><div class="label-new"><span class="text-white bg-success small d-flex align-items-center px-2 py-1"><i class="fa fa-star" aria-hidden="true"></i><span class="ml-1">New</span></span></div><div class="label-sale"><span class="text-white bg-primary small d-flex align-items-center px-2 py-1"><i class="fa fa-tag" aria-hidden="true"></i><span class="ml-1">Sale</span></span></div></div><a href="#"><img src="'+ image +'" class="card-img-top" alt="Product"></a><div class="card-body px-2 pb-2 pt-1"><div class="d-flex justify-content-between"><div><p class="h4 text-primary">$ '+ price +'</p></div><div><a href="#" class="text-secondary lead" data-toggle="tooltip" data-placement="left" title="Compare"><i class="fa fa-line-chart" aria-hidden="true"></i></a></div></div><p class="mb-0"><strong><a href="#" class="text-secondary">'+ name +'</a></strong></p><p class="mb-1"><small><a href="#" class="text-secondary">'+ brand +'</a></small></p><div class="d-flex mb-3 justify-content-between">'+ description +'</div><div class="d-flex justify-content-between"><div class="col px-0"><button class="btn btn-outline-primary btn-block btn_buy" id="'+ id+'" owner="'+ owner +'" price="'+ price +'">BUY<i class="fa fa-shopping-basket" aria-hidden="true"></i></button></div></div></div></div></div>';
    $("div#products_list").append(product_item);
  });
}

async function addProduct() {
  let name = $('input#name').val();
  let description = $('input#description').val();
  let brand = $('input#brand').val();
  let image = $('input#image').val();
  let price = $('input#price').val();
      price = parseInt(price);

      try {
        await window.contract.addProduct({
          name: name,
          description: description,
          brand: brand,
          image: image,
          price: price
        });
      } catch (e) {
        alert(
          'ERROR: ' + e
        )
        throw e
      } finally {
        console.log("product added");
      }
}

async function buyProduct(productId, receiverAccount, amount) {
  let myAccount = window.accountId;
  //console.log(myAccount);
  let result = await sendToken(myAccount, receiverAccount, amount);
  console.log(result);
  let transactionStatus = result.status.SuccessValue;
  
  if(transactionStatus === '') {
    //console.log("status: " + transactionStatus);
    let isSucceed = await contract.buyProduct({_id: parseInt(productId),_newOwner: myAccount});
    if(isSucceed) {
      alert("SUCCEED TO BUY PRODUCT!");
    }
    else {
      alert("ERROR!");
    }
  }
  else {
    console.log("ERROR: " + result);
  }
}

$(document).ready(async function(){
  //fetch all products
  await fetchProducs();
  
  $('button#submit').click(async function(e) {
    e.preventDefault();
    await addProduct();
  });

  $('button.btn_buy').click(async function() {
    let id = $(this).attr("id");
    let owner = $(this).attr("owner");
    let price = $(this).attr("price");
    let priceInNear = utils.format.parseNearAmount(price.toString());
    console.log(id + owner + priceInNear);

    await buyProduct(id, owner, priceInNear);
  });

});

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
function signedInFlow() {
  document.querySelector('#signed-in-flow').style.display = 'block'

  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = window.accountId
  })

  // populate links in the notification box
  const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
  accountLink.href = accountLink.href + window.accountId
  accountLink.innerText = '@' + window.accountId
  const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
  contractLink.href = contractLink.href + window.contract.contractId
  contractLink.innerText = '@' + window.contract.contractId

  // update with selected networkId
  accountLink.href = accountLink.href.replace('testnet', networkId)
  contractLink.href = contractLink.href.replace('testnet', networkId)

  fetchGreeting()
}

// update global currentGreeting variable; update DOM with it
async function fetchGreeting() {
  currentGreeting = await contract.getGreeting({ accountId: window.accountId })
  document.querySelectorAll('[data-behavior=greeting]').forEach(el => {
    // set divs, spans, etc
    el.innerText = currentGreeting

    // set input elements
    el.value = currentGreeting
  })
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow()
    else signedOutFlow()
  })
  .catch(console.error)
