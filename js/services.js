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
  .factory('Quote', function ($resource, $cookieStore, User) {
    return $resource('../api/rest/single/quote/:action/store/1', {}, {
      items: {
        method: 'GET',
        params: {'action': 'items'},
        headers: {'Authorization': User.getHeaders()},
        isArray: true
      },
      query: {method: 'GET', cache: true, params: {}, headers: {'Authorization': User.getHeaders()}}
    });
  })
  .factory('Order', function ($resource, $cookieStore, User) {
     return $resource('../api/rest/single/order', {}, {
      create: {method: 'POST', cache: true, params: {}, headers: {'Authorization': User.getHeaders()}},
      save: {
        method: 'POST',
        headers: {'Authorization': User.getHeaders()}
      }
    });
  })
  .factory('Auth', function ($resource, User) {
    var authUrl = '../api/rest/single/auth/store/1';
    var authMethod = 'POST';


    return $resource(authUrl, {}, {
      login: {method: authMethod, cache: false, params: {}}
    });
  })
  .service('User', function ($resource, $location) {
    var user = {
      isLogged: false,
      info: null,
      config: {
        callbackUrl: "http://magento-demo.local/singleMage/index.html#/login/oauth_token",
        consumerKey: 'i6zwhtf7jd7t9yql2jug5oerj4tyugd9',
        consumerSecret: '2bdtt65b2zyxrtmlgyt850jasd6t40f1',
        signatureMethod: 'PLAINTEXT',
        oauth_token: null,
        oauth_token_secret: null,
        oauth_consumer_key: null,
        oauth_signature: null
      },
      getHeaders: function () {
        if (!this.isLogged){
          $location.path('/');
          return;
        }

        return 'OAuth ' +
          'oauth_signature_method="'+this.config.signatureMethod+'", ' +
          'oauth_token="'+this.config.oauth_token+'", ' +
          'oauth_consumer_key="'+this.config.oauth_consumer_key+'", ' +
          'oauth_signature="'+this.config.consumerSecret+'&'+this.config.oauth_token_secret+'"';
      },
      customerInfo: function(){
        if (!this.info){
          var headers = this.getHeaders();
          //switch on http
          var resource =  $resource('../api/rest/customers/', {}, {
            get: {method: 'GET', cache: true, params: {}, headers: {'Authorization': headers}}
          });

          this.info = resource.get();
        }

        return this.info;
      }
    };
    return user;
  });