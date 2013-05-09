/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/22/13
 * Time: 12:11 AM
 */
'use strict';

/* Services */

var mageShopModule = angular.module('mageShopServices', ['ngResource']);

mageShopModule
  .factory('Product', function ($resource) {
    return $resource('../api/rest/products/:productId', {}, {
      query: {method: 'GET', params: {productId: ''}, isArray: true}
    });
  })
  .factory('ProductImages', function ($resource) {
    return $resource('../api/rest/products/:productId/images', {}, {
      query: {method: 'GET', params: {productId: ''}, isArray: true}
    });
  })
  .factory('Category', function($resource){
    return $resource('../api/rest/single/category/store/1/top', {}, {
      query: {method:'GET', params:{}}
    });
  });