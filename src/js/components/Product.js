import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import amountWidget from '../components/AmountWidget.js';

class Product {
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    // console.log('new Product:', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on templaete */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /*create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);

  }
  getElements() {
    const thisProduct = this;
    
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    const thisProduct = this;
    // console.log(thisProduct);
    /* find the clickable trigger (the element that should react to clicking) */
    /* old code
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log(clickableTrigger);
      */
    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
      event.preventDefault();
      /*toggle active class to thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find active product (product that has active class) */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* if there is active product and it's not thisProduct.element, remove class active from it */
      for (let activeProduct of activeProducts) {
        if (activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }
        /* toggle active class on thisProduct.element */
      }
    });
  }
  initOrderForm() {
    const thisProduct = this;
    // console.log(thisProduct);
    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });
      
    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }
      
    thisProduct.cartButton.addEventListener('click', function(){
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new amountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function(){
      thisProduct.processOrder();
    });
  }
  processOrder(){
    const thisProduct = this;
    // console.log(thisProduct);
    thisProduct.params = {};
    // convert form to object structuree,g {sause:['tomato]}
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);
    // set price to deafult price
    let price = thisProduct.data.price;
    //START LOOP for every category (param)
    for(let paramId in thisProduct.data.params) {
      //determine param value, e.g. paramId = 'toppings', param = {label:  'Toppings', type: 'checkboxes'...}
      const param = thisProduct.data.params[paramId];
      // console.log(paramId, param);
      // START LOOP
      for(let optionId in param.options) {
        //determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        // console.log(optionId, option);
        if(optionSelected && !option.default){  
          price += option.price;
          // console.log('price if: ', price);
        }
        else if(!optionSelected && option.default){
          price -= option.price;
          // console.log('price else:', price);
        }
        // options images
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        // console.log(images);
        //if the option is selected
        if(optionSelected){
          if(!thisProduct.params[paramId]){
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          // add class active
          for(let image of images){
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } 
        else {
          // remove class active
          for(let image of images){
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        // console.log(thisProduct.params);
      }
    }
    // update calculated price in the HTML
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    thisProduct.priceElem.innerHTML = thisProduct.price;
  }
  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //  app.cart.add(thisProduct);
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;