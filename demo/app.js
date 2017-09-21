/*
 * This file has been created by Ergosign GmbH - All rights reserved - http://www.ergosign.de
 * DO NOT ALTER OR REMOVE THIS COPYRIGHT NOTICE OR THIS FILE HEADER.
 *
 * This file and the code contained in it are subject to the agreed contractual terms and conditions,
 * in particular with regard to resale and publication.
 */

(function (angular) {
    'use strict';

    // todo: write comments

    angular.module('esNgValidatorDemo', ['esNgValidator'])
        .run([
            '$rootScope',
            '$templateCache',
            function ($rootScope, $templateCache) {
                $templateCache.put('./customElement/es-custom-text-input.directive.html');
            }
        ]);

    angular.module('esNgValidatorDemo').controller('DemoCtrl', [
            '$scope',
            '$timeout',
            '$q',
            function ($scope, $timeout, $q) {


                $scope.testInput = function (value) {
                    return value === 'testing';
                };

                $scope.checkLength = function (value) {
                    if (value && typeof value === 'string') {
                        return value.length === 5;
                    }
                    return false;
                };

                $scope.isValidLength = function (value) {
                    if (value && typeof value === 'string') {
                        return value.length === 7;
                    }
                    return false;
                };

                $scope.isValidPercent = function (value) {
                    return (($scope.modelObj.dependants.one + $scope.modelObj.dependants.two + $scope.modelObj.dependants.three) <= 100);
                };

                $scope.customDependentValidator = function (value) {
                    // console.log(value);
                    return (($scope.modelObj.customDependants.one.length + $scope.modelObj.customDependants.two.length) === 10);
                };

                $scope.customElementValidate = function (value) {
                    return (value.length === 4);
                };

                $scope.asyncValidatorTest1 = function (value) {
                    var defer = $q.defer();

                    $timeout(function () {
                        if (value && value.length === 5) {
                            defer.resolve(true);
                        } else {
                            defer.reject(false);
                        }
                    }, 3000);

                    return defer.promise;
                };

                $scope.test2AsyncValidatorFn = function (value) {
                    var defer = $q.defer();

                    $timeout(function () {
                        if (value && value.length === 7) {
                            defer.resolve();
                        } else {
                            defer.reject('test2AsyncValidatorFn ==>> failed');
                        }
                    }, 1000);

                    return defer.promise;
                };

                $scope.customAsyncValidatorsArray = [
                    {
                        name: 'firstAsync',
                        validator: function (value) {
                            var defer = $q.defer();

                            $timeout(function () {
                                if (value && value.length === 5) {
                                    defer.resolve();
                                } else {
                                    defer.reject();
                                }
                            }, 4000);

                            return defer.promise;
                        }
                    },
                    {
                        name: 'secondAsync',
                        validator: function (value) {
                            var defer = $q.defer();

                            $timeout(function () {
                                if (value && value.length === 7) {
                                    defer.resolve();
                                } else {
                                    defer.reject();
                                }
                            }, 4000);

                            return defer.promise;
                        }
                    }
                ];

                $scope.addNewInput = false;

                $scope.modelObj = {
                    single: '',
                    multi: 'Test',
                    dependants: {
                        one: 30,
                        two: 70,
                        three: 0
                    },
                    async: '',
                    asyncMulti: 'A',
                    customSingle: 'custom',
                    customMulti: 'custom 2',
                    customDependants: {
                        one: '',
                        two: '',
                        three: ''
                    },
                    customAsync: ''
                };

                $scope.toggleInput = function () {
                    $scope.addNewInput = !$scope.addNewInput;

                    if ($scope.addNewInput) {
                        $scope.modelObj.dependants.three = 10;
                        return;
                    }

                    $scope.modelObj.dependants.three = 0;
                };
                
                $scope.formInputErrors = {};


                $scope.$watch(function () {
                    return $scope.testForm.$error;
                }, function (newVal, oldVal) {
                    // console.log(getFormErrors(newVal));
                    if (newVal) {
                        // console.log(newVal);
                    }
                }, true);
            }
        ]);
})(angular);
