/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 5/21/13
 * Time: 5:57 PM
 */
/**
 * @this Cart
 * @param cartName
 * @param localStorageService
 * @constructor
 */
function Cart(cartName, localStorageService) {
  this.cartName = cartName || 'cart';
  this.localStorage = localStorageService;
  this.clearCart = false;
  this.checkoutParameters = {};
  this.items = [];

  // load items from local storage when initializing
  this.loadItems();

  // save items to local storage when unloading
  var self = this;
  $(window).unload(function () {
    if (self.clearCart) {
      self.clearItems();
    }
    self.saveItems();
    self.clearCart = false;
  });
}

// load items from local storage
Cart.prototype.loadItems = function () {
  var data = this.localStorage.get(this.cartName + "_items");
  if (data != null) {
    try {
      var items = JSON.parse(data);
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.id != null && item.name != null && item.price != null && item.quantity != null) {
          item = new CartItem(item.id, item.name, item.price, item.quantity);
          this.items.push(item);
        }
      }
    }
    catch (e) {
      console.warn("Error while load cart items:" + e);
    }
  }
};

// save items to local storage
Cart.prototype.saveItems = function () {
  this.localStorage.add(this.cartName + "_items", JSON.stringify(this.items));
};

// adds an item to the cart
Cart.prototype.addItem = function (id, name, price, quantity) {
  quantity = this.toNumber(quantity);
  if (quantity != 0) {

    // update quantity for existing item
    var found = false;
    for (var i = 0; i < this.items.length && !found; i++) {
      var item = this.items[i];
      if (item.id == id) {
        found = true;
        item.quantity = this.toNumber(item.quantity + quantity);
        if (item.quantity <= 0) {
          this.items.splice(i, 1);
        }
      }
    }

    // new item, add now
    if (!found) {
      var item = new CartItem(id, name, price, quantity);
      this.items.push(item);
    }

    // save changes
    this.saveItems();
  }
};

// get the total price for all items currently in the cart
Cart.prototype.getTotalPrice = function (id) {
  var total = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (id == null || item.id == id) {
      total += this.toNumber(item.quantity * item.price);
    }
  }
  return total;
};

// get the total price for all items currently in the cart
Cart.prototype.getTotalCount = function () {
  var count = 0;
  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
      count += this.toNumber(item.quantity);
  }
  return count;
};

// clear the cart
Cart.prototype.clearItems = function () {
  this.items = [];
  this.saveItems();
};

// define checkout parameters
Cart.prototype.addCheckoutParameters = function (serviceName, merchantID, options) {

  // check parameters
  if (serviceName != "PayPal" && serviceName != "Google") {
    throw "serviceName must be 'PayPal' or 'Google'.";
  }
  if (merchantID == null) {
    throw "A merchantID is required in order to checkout.";
  }

  // save parameters
  this.checkoutParameters[serviceName] = new CheckoutParameters(serviceName, merchantID, options);
};

// check out
Cart.prototype.checkout = function (serviceName, clearCart) {

  // select serviceName if we have to
  if (serviceName == null) {
    var p = this.checkoutParameters[Object.keys(this.checkoutParameters)[0]];
    serviceName = p.serviceName;
  }

  // sanity
  if (serviceName == null) {
    throw "Use the 'addCheckoutParameters' method to define at least one checkout service.";
  }

  // go to work
  var params = this.checkoutParameters[serviceName];
  if (params == null) {
    throw "Cannot get checkout parameters for '" + serviceName + "'.";
  }
  switch (params.serviceName) {
    case "PayPal":
      this.checkoutPayPal(params, clearCart);
      break;
    case "Google":
      this.checkoutGoogle(params, clearCart);
      break;
    default:
      throw "Unknown checkout service: " + params.serviceName;
  }
};


Cart.prototype.toNumber = function (value) {
  value = value * 1;
  return isNaN(value) ? 0 : value;
};

//----------------------------------------------------------------
// checkout parameters (one per supported payment service)
//
function CheckoutParameters(serviceName, merchantID, options) {
  this.serviceName = serviceName;
  this.merchantID = merchantID;
  this.options = options;
}

//----------------------------------------------------------------
// items in the cart
//
function CartItem(id, name, price, quantity) {
  this.id = id;
  this.name = name;
  this.price = price * 1;
  this.quantity = quantity * 1;
}

