/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/21/13
 * Time: 11:55 PM
 */
'use strict';

/* App Module */

angular.module('mageShop', ['mageShopServices']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/products', {templateUrl: 'templates/product-list.html',   controller: ProductListCtrl}).
      when('/products/:productId', {templateUrl: 'templates/product-detail.html', controller: ProductDetailCtrl}).
      otherwise({redirectTo: '/products'});
  }]);
