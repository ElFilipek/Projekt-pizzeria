import {select} from '../settings.js';
import amountWidget from '../components/AmountWidget.js';

class CartProduct {
  constructor (menuProduct, element) {
    const thisCartProduct = this;
    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
    console.log('thisCartProduct: ', thisCartProduct);
  }

  getElements(element) {
    const thisCartProduct = this;
    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }
  getData(){
    const thisCartProduct = this;
    const data = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount, 
      price: thisCartProduct.price, 
      priceSingle: thisCartProduct.priceSingle,
      params: thisCartProduct.params,
    };
    return data;
  }
  initAmountWidget() {
    const thisCartProduct = this;
    thisCartProduct.amountWidget = new amountWidget(thisCartProduct.dom.amountWidget);
    thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
    }); 
  }
  remove() {
    const thisCartProduct = this;
    const event = new CustomEvent('remove', {
      bubbles: true, 
      detail: {
        cartProduct: thisCartProduct, 
      },
    });
    thisCartProduct.dom.wrapper.dispatchEvent(event);
    console.log('test remove: ', event);
  }
  initActions() {
    const thisCartProduct = this;
    thisCartProduct.dom.edit.addEventListener('click', function(event) {
      event.preventDefault();
    });
    thisCartProduct.dom.remove.addEventListener('click', function(event) {
      event.preventDefault();
      thisCartProduct.remove();
      console.log('click', thisCartProduct.remove() );
    });
  }
}
export default CartProduct;