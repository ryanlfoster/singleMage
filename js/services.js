/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/22/13
 * Time: 12:11 AM
 */
'use strict';

/* Services */

var mageShopModule = angular.module('mageShopServices', ['ngResource', 'LocalStorageModule']);

mageShopModule
  .factory('Product', function ($resource) {
    return $resource('../api/rest/products/:productId?limit=6&category_id=:categoryId', {}, {
      query: {method: 'GET', cache: true, params: {productId: '', categoryId: ''}, isArray: true}
    });
  })
  .factory('ProductImages', function ($resource) {
    return $resource('../api/rest/products/:productId/images', {}, {
      query: {method: 'GET', cache: true, params: {productId: ''}, isArray: true}
    });
  })
  .factory('TopCategory', function ($resource) {
    return $resource('../api/rest/single/category/store/1/top', {}, {
      query: {method: 'GET', cache: true, params: {}}
    });
  })
  .factory('Category', function ($resource) {
    return $resource('../api/rest/single/category/:categoryId', {}, {
      query: {method: 'GET', cache: true, params: {categoryId: ''}, isArray: true}
    });
  })
  .service('Cart', function (localStorageService) {
    var cart = new Cart(undefined, localStorageService);
    return cart;
  })
  .factory('Quote', function ($resource, $cookieStore) {
    //TODO into service!!!!!!!!!1
    var consumerKey = 'i6zwhtf7jd7t9yql2jug5oerj4tyugd9';
    var consumerSecret = '2bdtt65b2zyxrtmlgyt850jasd6t40f1';
    var signatureMethod = 'PLAINTEXT';
    var token = $cookieStore.get('token');
    var tokenSecret = $cookieStore.get('tokenSecret');
    var oAuth = OAuthSimple(consumerKey, consumerSecret);
    var oAuthSign = oAuth.sign({
      method: signatureMethod,
      parameters: {
        oauth_token: token,
        oauth_method: signatureMethod
      },
      signatures: {
        oauth_token_secret: tokenSecret
      }
    });


    return $resource('../api/rest/single/quote/:action/store/1', {}, {
      items: {
        method: 'GET',
        params: {'action':'items'},
        headers:{'Authorization': oAuthSign.header},
        isArray: true
      },
      query: {method: 'GET', cache: true, params: {},headers:{'Authorization': oAuthSign.header}}
    });
  })
  .factory('Order', function ($resource, $cookieStore) {
    //TODO into service!!!!!!!!!1
    var consumerKey = 'i6zwhtf7jd7t9yql2jug5oerj4tyugd9';
    var consumerSecret = '2bdtt65b2zyxrtmlgyt850jasd6t40f1';
    var signatureMethod = 'PLAINTEXT';
    var token = $cookieStore.get('token');
    var tokenSecret = $cookieStore.get('tokenSecret');
    var oAuth = OAuthSimple(consumerKey, consumerSecret);
    var oAuthSign = oAuth.sign({
      method: signatureMethod,
      parameters: {
        oauth_token: token,
        oauth_method: signatureMethod
      },
      signatures: {
        oauth_token_secret: tokenSecret
      }
    });


    return $resource('../api/rest/single/order', {}, {
      create: {method: 'POST', cache: true, params: {},headers:{'Authorization': oAuthSign.header}},
      save:{
        method: 'POST',
        headers:{'Authorization': oAuthSign.header}
      }
    });
  });