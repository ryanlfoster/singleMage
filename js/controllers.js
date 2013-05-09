/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 4/21/13
 * Time: 11:55 PM
 */
'use strict';

/* Controllers */

function CategoryCtrl($scope, TopCategory, Category) {
  $scope.topCategories = TopCategory.query();

  $scope.showSubCategories = function(categoryId){
    if (!$scope.topCategories[categoryId].children){
      Category.get({categoryId: categoryId}, function(category) {
        $scope.topCategories[categoryId].children = category.children;
        console.log($scope.topCategories);
      });
    }
  };
}

function ProductListCtrl($scope, Product) {
  $scope.products = Product.query();
}

//PhoneListCtrl.$inject = ['$scope', 'Phone'];



function ProductDetailCtrl($scope, $routeParams, Product, ProductImages) {
  $scope.product = Product.get({productId: $routeParams.productId}, function(product) {
  });

  $scope.productImages = ProductImages.query({productId: $routeParams.productId}, function(productImages) {
  });

  $scope.setImage = function(imageUrl) {
    $scope.product.image_url = imageUrl;
  };

}

//ProductDetailCtrl.$inject = ['$scope', '$routeParams', 'Product', 'ProductImages'];
