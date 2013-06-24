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

  $scope.$watch('qty', function() {
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


function AuthCtrl($scope, $http, $routeParams, $cookieStore) {
  $scope.callbackUrl = "http://magento-demo.local/singleMage/index.html#/login/oauth_token";
  $scope.consumerKey = 'i6zwhtf7jd7t9yql2jug5oerj4tyugd9';
  $scope.consumerSecret = '2bdtt65b2zyxrtmlgyt850jasd6t40f1';
  $scope.requestToken = null;
  $scope.requestVerifier = null;
  $scope.token = null;
  $scope.tokenSecret = null;
  $scope.signatureMethod = 'PLAINTEXT';

  $scope.initUrl = '../oauth/initiate';
  $scope.initAction = 'POST';
  $scope.initToken = null;
  $scope.initTokenSecret = null;

  $scope.authUrl = '../oauth/authorize/simple';
  $scope.authAction = 'GET';

  $scope.accessUrl = '../oauth/token';
  $scope.accessAction = 'POST';

  $scope.loginForm = '';
  $scope.isLogged = false;

  $scope.init = function () {
    var oAuth = OAuthSimple($scope.consumerKey, $scope.consumerSecret);
    var oAuthInit = oAuth.sign({
      action: $scope.initAction,
      path: $scope.initUrl,
      method: $scope.signatureMethod,
      parameters: {
        oauth_callback: $scope.callbackUrl,
        oauth_method: $scope.signatureMethod
      }
    });

    //init step
    $http({
      method: $scope.initAction,
      url: $scope.initUrl,
      headers: {
        Authorization: oAuthInit.header
      }
    }).
      success(function (data) {
        //authorize step
        var authData = oAuth._parseParameterString(data);

        //set temp tokens
        $scope.initToken = authData.oauth_token;
        $scope.initTokenSecret = authData.oauth_token_secret;

        //we need store secret for future window reload
        $cookieStore.put('initTokenSecret', $scope.initTokenSecret);


        var oAuthAuth = oAuth.sign({
          action: $scope.authAction,
          path: $scope.authUrl,
          parameters: {
            oauth_token: $scope.initToken,
            oauth_token_secret: $scope.initTokenSecret
          }
        });

        $http({
          method: $scope.authAction,
          url: oAuthAuth.signed_url,
          headers: {
            Authorization: oAuthAuth.header
          }
        }).
          success(function (data) {
            //Access step
            $scope.loginForm = data;

            //TODO fix form getter
            var authForm = jQuery(data).find('#oauth_authorize_confirm');

            if (authForm.length !== 0) {
              window.location = (authForm.attr('action') + "?oauth_token=" + authForm.find('input[name="oauth_token"]').val());
            } else {
              var loginForm = jQuery(data).find('#loginForm');
              if (loginForm.length !== 0) {
                alert('TODO - implement authentication');
              } else {
                alert('TODO - implement smthing unknown');
              }
            }
          }).
          error(function (data, status) {
            data = data || "Auth request failed";
            console.log(data);
            console.log(status);
          });


      }).
      error(function (data, status) {
        data = data || "Init request failed";
        console.log(data);
        console.log(status);
      });
  };

  $scope.accessStep = function () {
    $scope.requestToken = $routeParams.oauth_token;
    $scope.requestVerifier = $routeParams.oauth_verifier;
    $scope.initTokenSecret = $cookieStore.get('initTokenSecret');

    var oAuth = OAuthSimple($scope.consumerKey, $scope.consumerSecret);

    var oAuthAccess = oAuth.sign({
      action: $scope.accessAction,
      path: $scope.accessUrl,
      method: $scope.signatureMethod,
      parameters: {
        oauth_token: $scope.requestToken,
        oauth_verifier: $scope.requestVerifier,
        oauth_method: $scope.signatureMethod
      },
      signatures: {
        oauth_token_secret: $scope.initTokenSecret
      }
    });

    $http({
      method: $scope.accessAction,
      url: $scope.accessUrl,
      headers: {
        Authorization: oAuthAccess.header
      }
    }).
      success(function (data) {
        //Get access tokens
        var accessData = oAuth._parseParameterString(data);

        //set access tokens
        $scope.token = accessData.oauth_token;
        $scope.tokenSecret = accessData.oauth_token_secret;
        $cookieStore.put('token', $scope.token);
        $cookieStore.put('tokenSecret', $scope.tokenSecret);

        $scope.isLogged = true;
      }).
      error(function (data, status) {
        data = data || "Access request failed";
        console.log(data);
        console.log(status);
      });
  };

  $scope.getInfo = function () {
    var infoUrl = '../api/rest/single/order';
    var oAuth = OAuthSimple($scope.consumerKey, $scope.consumerSecret);
    $scope.token = $cookieStore.get('token');
    $scope.tokenSecret = $cookieStore.get('tokenSecret');

    var oAuthAccess = oAuth.sign({
      path: infoUrl,
      method: $scope.signatureMethod,
      parameters: {
        oauth_token: $scope.token,
        oauth_method: $scope.signatureMethod
      },
      signatures: {
        oauth_token_secret: $scope.tokenSecret
      }
    });

    console.log(oAuthAccess);

    $http({
      url: infoUrl,
      method: 'POST',
      headers: {
        Authorization: oAuthAccess.header
      }
    }).
      success(function (data) {
        console.log(data);
        //Get access tokens
//        var accessData = oAuth._parseParameterString(data);


      }).
      error(function (data, status) {
        data = data || "Customer info request failed";
        console.log(data);
        console.log(status);
      });
  }


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