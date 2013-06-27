/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/21/13
 * Time: 11:55 PM
 */
'use strict';

/* Controllers */

function CategoryCtrl($scope, TopCategory, Category) {
  var cachedCategories = {};
  $scope.topCategories = TopCategory.query();

  $scope.showSubCategories = function (categoryId) {
    //TODO rewrite - add cache and sub-access
    if (!cachedCategories[categoryId]) {
      Category.get({categoryId: categoryId}, function (category) {
        if (!jQuery.isEmptyObject(category.children)) {
          var path = category.path.split('/');
          //first 2 elements  in magento categories hierarchy - it's global parent category and store root category
          path.splice(0, 2);

          //assign top-level category
          var tmpCategories = $scope.topCategories[path.splice(0, 1)];
          for (var key in path) {
            if (path.hasOwnProperty(key)) {
              var index = path[key];
              tmpCategories = tmpCategories['children'][index];
            }
          }
          tmpCategories.children = category.children;
        }

        cachedCategories[categoryId] = true;
      });
    }

  };
}

function ProductListCtrl($scope, $routeParams, Product, Cart) {
  $scope.products = Product.query({categoryId: $routeParams.categoryId});

  $scope.cart = Cart;
}

//PhoneListCtrl.$inject = ['$scope', 'Phone'];


function ProductDetailCtrl($scope, $routeParams, Product, ProductImages, Cart) {
  $scope.cart = Cart;
  $scope.product = Product.get({productId: $routeParams.productId});

  $scope.productImages = ProductImages.query({productId: $routeParams.productId});

  $scope.qty = 1;

  $scope.$watch('qty', function () {
    $scope.qty = ($scope.qty > 0) ? $scope.qty : 1;
  });

  $scope.setImage = function (imageUrl) {
    $scope.product.image_url = imageUrl;
  };

  $scope.addToCart = function () {
    $scope.cart.addItem($scope.product.entity_id, $scope.product.name, $scope.product.final_price_with_tax, $scope.qty);
  };

}

//ProductDetailCtrl.$inject = ['$scope', '$routeParams', 'Product', 'ProductImages'];


function AuthCtrl($scope, $http, $routeParams, $cookieStore, Auth, User) {
  $scope.user = User;
  $scope.button = "";
  $scope.template = "";
  $scope.customerInformation = "";
  $scope.loginData = {email: "bel-azar@ya.ru", password: "test1234"};

  $scope.$watch('user', function () {
    $scope.button = !$scope.user.isLogged ? 'Login' : 'Profile';
    $scope.template = !$scope.user.isLogged ? 'templates/login.html' : 'templates/profile.html';
  }, true);

  $scope.login = function () {
    var auth = new Auth($scope.loginData);
    auth.$login(function (data) {
      $scope.user.config.oauth_token = data.oauth_token;
      $scope.user.config.oauth_token_secret = data.oauth_token_secret;
      $scope.user.config.oauth_consumer_key = data.oauth_consumer_key;
      $scope.user.config.oauth_signature = data.oauth_signature;
      $scope.user.isLogged = true;

      //TODO fix this dirty hack
      $('#login_form').css('left', '-9999px');

    }, function (data, v) {
      var errorMsg = '';
      try {
        errorMsg = data.data.messages.error[0].message;
      } catch (e) {
        console.log('Cannot parse error msg: ' + e);
      }
      alert('Cannot login, error: ' + errorMsg);
      console.log(v);
    });
  };


  $scope.load = function () {
    if ($scope.user.isLogged) {
      $scope.customerInformation = $scope.user.customerInfo();
    }
  };

}

function CartCtrl($scope, Cart) {
  $scope.cart = Cart;
}


function CheckoutCtrl($scope, Cart, Quote, Order, $route, $window, $location) {
  //TODO First we should create quote
  $scope.cart = Cart;
  //TODO change cart items on quote items
  $scope.orderData = {is_default_shipping: true, items: Cart.items};

  $scope.quote = Quote.query({});
  $scope.sameShippingAddress = true;

  $scope.placeOrder = function () {
    var order = new Order($scope.orderData);
    order.$save(function (userObj, putResponseHeaders) {
      var responseHeaders = putResponseHeaders();
      var newOrderId = parseInt(responseHeaders.location);
      if (newOrderId) {
        alert('Order placed - new order id: ' + newOrderId);
        Cart.clearItems();
        $location.path('/order/success/' + newOrderId);
      } else {
        alert('Something went wrong - please, connect to site admin');
      }
    }, function (data, v) {
      var errorMsg = '';
      try {
        errorMsg = data.data.messages.error[0].message;
      } catch (e) {
        console.log('Cannot parse error msg: ' + e);
      }
      alert('Cannot place order, error: ' + errorMsg);
      console.log(v);
    });
//    Order.create({order: $scope.orderForm});
  };

  //init section
  if (!$scope.cart.items.length) {
    alert('Cart is empty');
    if ($route.previousUrl !== $route.currentUrl) {
      $window.location = $route.previousUrl;
    } else {
      $window.location = '#';
//      $location.path("/");
    }
  }
}