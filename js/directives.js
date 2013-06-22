/**
 *
 * @author Artem Azarov <bel-azar@ya.ru>
 * Date: 5/11/13
 * Time: 11:59 PM
 */
'use strict';

/* Directives */
var app = angular.module('mageShopDirectives', []);
app
  .directive('ngFrame', function () {
    return{
      restrict: "E",
      transclude: true,
      replace: true,
      compile: function compile(tElement, tAttrs, transclude) {
        return {
          pre: function (scope) {
            transclude(scope, function (clone) {
              scope.transcluded_content = clone;
            });
          },
          post: function (scope, element, attrs) {
            element.contents().find('body').html(scope.transcluded_content);
          }
        };
      },
      template: "<iframe></iframe>"
    };
  })
  .directive('ngBack', function () {
    return{
      restrict: "A",
      controller: function ($scope, $element) {
        $element.click(function () {
          window.history.back();
        });
      }
    };
  })
  .directive('ngGo', function () {
    return{
      restrict: "A",
      controller: function ($scope, $element, $attrs) {
        $element.click(function () {
            window.location=$attrs.ngGo;
  });
      }
    };
  });
