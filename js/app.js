/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/21/13
 * Time: 11:55 PM
 */
'use strict';

/* App Module */

angular.module('mageShop', ['mageShopServices', 'mageShopDirectives', 'ngCookies']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/products', {templateUrl: 'templates/product-list.html',   controller: ProductListCtrl}).
      when('/products/:productId', {templateUrl: 'templates/product-detail.html', controller: ProductDetailCtrl}).
      when('/cart', {templateUrl: 'templates/cart.html', controller: CartCtrl}).
      when('/checkout', {templateUrl: 'templates/checkout.html', controller: CheckoutCtrl}).
      //controller didn't initiate without template
      when('/login/oauth_token', {templateUrl: 'templates/oauth-token.html', controller: AuthCtrl}).
      otherwise({redirectTo: '/products'});
  }]);
