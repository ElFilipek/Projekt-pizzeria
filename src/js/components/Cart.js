import {settings, select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from '../components/CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
  }
  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];
    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    thisCart.dom.form = element.querySelector(select.cart.form);
    thisCart.dom.phone = element.querySelector(select.cart.phone);
    thisCart.dom.address = element.querySelector(select.cart.address);
  }
  initActions(){
    const thisCart = this;
    const triggerCart = thisCart.dom.toggleTrigger;
    triggerCart.addEventListener('click', function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function (){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct) {
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (let cartProduct of thisCart.products) {
      thisCart.subtotalPrice += cartProduct.price;
      thisCart.totalNumber += cartProduct.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    for (let key of thisCart.renderTotalsKeys){
      for (let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    //console.log('sendOrder URL: ', url);
    const payload = {
      phone: thisCart.dom.phone.value,
      address: thisCart.dom.address.value,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      totalPrice: thisCart.totalPrice,
      product: [],
    };
    for(let cartProduct of thisCart.products){
      cartProduct.getData();
      payload.product.push(cartProduct.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      });
  }
}
export default Cart;