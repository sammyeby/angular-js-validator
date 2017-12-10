
(function (angular) {
    'use strict';

    angular.module('esNgValidatorDemo')
        .directive('esCustomTextInput', function () {
            return {
                restrict: 'E',
                require: 'ngModel',
                scope: {
                    name: '@?',
                    inputError: '=?'
                },
                replace: true,
                templateUrl: 'customElement/es-custom-text-input.directive.html',
                link: function (scope, element, attrs, ctrl) {

                    scope.inputValue = '';

                    ctrl.$render = function () {
                        scope.inputValue = ctrl.$modelValue;
                    };

                    scope.$watch('inputValue', function () {
                        ctrl.$setViewValue(scope.inputValue);
                        ctrl.$render();
                    });
                },
                controller: [
                    '$rootScope',
                    '$scope',
                    '$log',
                    function ($rootScope, $scope, $log) {

                        $scope.$rs = $rootScope;

                    }
                ]
            };
        });
})(angular);
