/*
 * This file has been created by Ergosign GmbH - All rights reserved - http://www.ergosign.de
 * DO NOT ALTER OR REMOVE THIS COPYRIGHT NOTICE OR THIS FILE HEADER.
 *
 * This file and the code contained in it are subject to the agreed contractual terms and conditions,
 * in particular with regard to resale and publication.
 */

(function (angular) {
    'use strict';

    angular.module('esNgValidator', []);

    angular.module('esNgValidator')
    /**
     * @ngdoc directive
     * @name esNgValidator
     * @restrict A
     *
     * @description
     *
     *
     */
        .directive('esValidatorInitiator', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    var dependencyItemsWatchers = [];
                    var inputElementsWatchers = [];

                    /**
                     * Clear watchers on dependant input elements
                     * */
                    function unWatchDependencyItems () {
                        for (var i = 0; i < dependencyItemsWatchers.length; i++) {
                            if (typeof dependencyItemsWatchers[i] === 'function') {
                                dependencyItemsWatchers[i]();
                            }
                        }
                        dependencyItemsWatchers = [];
                    }

                    /**
                     * Clear all input elements watchers if there are any
                     * */
                    function unWatchInputElements () {
                        for (var w = 0; w < inputElementsWatchers.length; w++) {
                            if (typeof inputElementsWatchers[w] === 'function') {
                                inputElementsWatchers[w]();
                            }
                        }
                        inputElementsWatchers = [];
                    }

                    var scopeForm = scope.$parse(attrs.name)(scope);

                    // Custom input validation states is set on the scopeForm object.
                    scopeForm.$inputsStates = {};

                    var dependantsInputNamesAndValidators = [];

                    /**
                     * Sets validity status of dependant input elements
                     * */
                    function setInputValidityStatus () {
                        if (dependantsInputNamesAndValidators.length > 0) {
                            dependantsInputNamesAndValidators.map(function (dependantItem) {
                                if (scopeForm[dependantItem.inputName]) {
                                    scopeForm[dependantItem.inputName].$setValidity(dependantItem.validatorName, dependantItem.validator());
                                }
                            });
                        }
                    }

                    /**
                     * Watches all inputs $modelValue that are dependent on one another to set their valid/invalid status accordingly
                     * @param inputName (form input element name)
                     * */
                    function dependantInputWatcher (inputName) {
                        if (inputName && scopeForm[inputName]) {
                            var watcher = scope.$watch(function () {
                                if (scopeForm[inputName]) {
                                    return scopeForm[inputName].$modelValue;
                                }
                            }, function () {
                                scope.$timeout(function () {
                                    setInputValidityStatus();
                                });
                            });
                            dependencyItemsWatchers.push(watcher);
                        }
                    }

                    /**
                     * Re-formats form $error and sort them according to input names and their errors
                     * @param formErrorObject (scopeForm.$error)
                     * @return {*}
                     * */
                    function getFormErrorsByInputName (formErrorObject) {
                        var errorsForInput = {};
                        if (Object.keys(formErrorObject).length) {
                            for (var errKey in formErrorObject) {
                                for (var i = 0; i < formErrorObject[errKey].length; i++) {
                                    if (!errorsForInput.hasOwnProperty(formErrorObject[errKey][i].$name)) {
                                        errorsForInput[formErrorObject[errKey][i].$name] = {};
                                    }
                                    errorsForInput[formErrorObject[errKey][i].$name][errKey] = true;
                                }
                            }
                        }
                        return errorsForInput;
                    }

                    /**
                     * @param elName (form input element name)
                     * Watches all inputs validation states in the form scope and set them accordingly to the custom '$inputsStates' property
                     * */
                    function inputElementWatcher (elName) {
                        if (scopeForm[elName]) {
                            var elWatcher = scope.$watch(function () {

                                if (scopeForm[elName]) {
                                    scope.watchObj = {};
                                    scope.watchObj[elName] = {
                                        elDirty: scopeForm[elName].$dirty,
                                        elPristine: scopeForm[elName].$pristine,
                                        elTouched: scopeForm[elName].$touched,
                                        elUntouched: scopeForm[elName].$untouched,
                                        elPending: scopeForm[elName].$pending
                                    };
                                    return scope.watchObj[elName];
                                }
                            }, function (newVal) {
                                if (newVal && scopeForm.$inputsStates) {
                                    scopeForm.$inputsStates[elName].$dirty = newVal.elDirty;
                                    scopeForm.$inputsStates[elName].$touched = newVal.elTouched;
                                    scopeForm.$inputsStates[elName].$untouched = newVal.elUntouched;
                                    scopeForm.$inputsStates[elName].$pristine = newVal.elPristine;
                                    scopeForm.$inputsStates[elName].$pending = newVal.elPending;
                                }
                            }, true);

                            inputElementsWatchers.push(elWatcher);
                        }
                    }

                    /**
                     * Checks if form input has dependent validator set and prepares it for dependent validation process
                     * */
                    function isInputDependentValidation () {
                        // remove all watchers first if there are any
                        unWatchDependencyItems();

                        // clear all collected input names that have validations that depends on other inputs
                        dependantsInputNamesAndValidators = [];

                        angular.forEach(element.find('[es-dependent-validator]'), function (inputElement) {
                            inputElement = angular.element(inputElement);
                            var validatorFn = scope.$eval(inputElement.attr('es-dependent-validator'));
                            if (typeof validatorFn === 'function') {
                                // use the function name as the dependencyValidatorName
                                var validatorName = inputElement.attr('es-dependent-validator');
                                
                                if (inputElement.attr('name')) {
                                    var inputName = inputElement.attr('name'),
                                        validatorObj = {
                                            inputName: inputName,
                                            validatorName: validatorName,
                                            validator: validatorFn
                                        };
                                    dependantsInputNamesAndValidators.push(validatorObj);
                                    scope.$timeout(function () {
                                        dependantInputWatcher(inputName);
                                    });
                                } else {
                                    scope.$log.error('ERROR! esNgValidator => input name must be provided for dependent validation to work!');
                                }
                            }
                        });
                    }

                    /**
                     * Checks form element and its children to make sure that they have 'name' attribute defined
                     * If 'name' is not defined, logs error to notify the user
                     * */
                    function checkIfElementsHaveNames () {

                        if (!attrs.name) {
                            scope.$log.warn.error('ERROR! esNgValidator ==>> Form element is does not have a name. Please provide a name');
                        }

                        unWatchInputElements();
                        angular.forEach(element.find('input,select,textarea'), function (childElement) {
                            childElement = angular.element(childElement);
                            if (!childElement.attr('name')) {
                                scope.$log.error('ERROR! esNgValidator ==>> One of your form input elements does not have a name. Please provide a name for the input');
                            } else {
                                var childName = childElement.attr('name');
                                scopeForm.$inputsStates[childName] = {};

                                inputElementWatcher(childName);
                            }
                        });

                        scope.$timeout(function () {
                            isInputDependentValidation();
                        });
                    }

                    /**
                     * Sets the correct inputs validity and error status to the custom '$inputsStates' property to make it
                     * available on form object
                     * @param formErrorObjectByInputName
                     * */
                    function setInputValidAndErrorStatus (formErrorObjectByInputName) {
                        if (scopeForm.$inputsStates && Object.keys(scopeForm.$inputsStates).length > 0) {
                            for (var name in scopeForm.$inputsStates) {
                                if (formErrorObjectByInputName.hasOwnProperty(name)) {
                                    scopeForm.$inputsStates[name].$valid = false;
                                    scopeForm.$inputsStates[name].$invalid = true;
                                    scopeForm.$inputsStates[name].$error = formErrorObjectByInputName[name];
                                } else {
                                    scopeForm.$inputsStates[name].$valid = true;
                                    scopeForm.$inputsStates[name].$invalid = false;
                                    scopeForm.$inputsStates[name].$error = {};
                                }
                            }
                        }
                    }

                    scope.$watch(function () {
                        return scopeForm.$error;
                    }, function (newVal) {

                        var formattedFormErrorObj = getFormErrorsByInputName(newVal);
                        setInputValidAndErrorStatus(formattedFormErrorObj);

                    }, true);

                    scope.$watch(function () {
                        return Object.keys(scopeForm).length;
                    }, function () {
                        // Timeout is necessary here so that any possible custom element attribute evaluation (e.g. 'name={{inputNameGivenFromOutside}}' expression) would be done before checking for names
                        scope.$timeout(function () {
                            checkIfElementsHaveNames();
                            var formattedFormErrorObj = getFormErrorsByInputName(scopeForm.$error);
                            setInputValidAndErrorStatus(formattedFormErrorObj);
                        });
                    });

                    // initial check
                    checkIfElementsHaveNames();

                },
                controller: [
                    '$rootScope',
                    '$scope',
                    '$log',
                    '$compile',
                    '$filter',
                    '$parse',
                    '$timeout',
                    function ($rootScope, $scope, $log, $compile, $filter, $parse, $timeout) {
                        $scope.$rs = $rootScope;
                        $scope.$log = $log;
                        $scope.$compile = $compile;
                        $scope.$filter = $filter;
                        $scope.$parse = $parse;
                        $scope.$timeout = $timeout;
                    }
                ]
            };
        })
        .directive('esValidator', function () {
            return {
                require: ['^?esValidatorInitiator', 'ngModel'],
                link: function (scope, element, attrs, ctrl) {
                    if (ctrl[1] && attrs.esValidator) {


                        // AngularJs v 1.5x
                        if (!ctrl[1].$options) {
                            ctrl[1].$options = {
                                allowInvalid: true,
                                updateOnDefault: true
                            };
                            // AngularJs v 1.6x
                        } else if (ctrl[1].$options && typeof ctrl[1].$overrideModelOptions === 'function') {
                            ctrl[1].$overrideModelOptions({
                                allowInvalid: true,
                                updateOn: 'default'
                            });
                        }


                        scope.esValidatorFn = scope.$eval(attrs.esValidator);
                        if (typeof scope.esValidatorFn === 'function') {
                            var validatorName = attrs.esValidator;
                            ctrl[1].$validators[validatorName] = scope.esValidatorFn;
                        }
                    }
                }
            };
        })
        .directive('esValidatorMulti', function () {
            return {
                require: ['^?esValidatorInitiator', 'ngModel'],
                link: function (scope, element, attrs, ctrl) {
                    if (ctrl[1] && attrs.esValidatorMulti) {

                        // AngularJs v 1.5x
                        if (!ctrl[1].$options) {
                            ctrl[1].$options = {
                                allowInvalid: true,
                                updateOnDefault: true
                            };
                            // AngularJs v 1.6x
                        } else if (ctrl[1].$options && typeof ctrl[1].$overrideModelOptions === 'function') {
                            ctrl[1].$overrideModelOptions({
                                allowInvalid: true,
                                updateOn: 'default'
                            });
                        }

                        scope.esValidatorMultiFnsArray = scope.$eval(attrs.esValidatorMulti);
                        if (scope.esValidatorMultiFnsArray.length) {
                            scope.esValidatorMultiFnsArray.map(function (item, index) {
                                if (typeof item === 'function') {
                                    ctrl[1].$validators['validator_' + index] = item;
                                } else if (typeof item === 'object') {
                                    if (item.name && typeof item.name === 'string' && item.validator) {
                                        ctrl[1].$validators[item.name] = item.validator;
                                    }
                                }
                            });
                        }
                    }
                }
            };
        })
        .directive('esValidatorAsync', function () {
            return {
                require: ['^?esValidatorInitiator', 'ngModel'],
                link: function (scope, element, attrs, ctrl) {
                    if (ctrl[1] && attrs.esValidatorAsync) {

                        // AngularJs v 1.5x
                        if (!ctrl[1].$options) {
                            ctrl[1].$options = {
                                allowInvalid: true,
                                updateOnDefault: true
                            };
                            // AngularJs v 1.6x
                        } else if (ctrl[1].$options && typeof ctrl[1].$overrideModelOptions === 'function') {
                            ctrl[1].$overrideModelOptions({
                                allowInvalid: true,
                                updateOn: 'blur'
                            });
                        }

                        scope.esValidatorAsyncFn = scope.$eval(attrs.esValidatorAsync);
                        if (typeof scope.esValidatorAsyncFn === 'function') {
                            var validatorName = attrs.esValidatorAsync;
                            ctrl[1].$asyncValidators[validatorName] = scope.esValidatorAsyncFn;
                        }
                    }
                }
            };
        })
        .directive('esValidatorAsyncMulti', function () {
            return {
                require: ['^?esValidatorInitiator', 'ngModel'],
                link: function (scope, element, attrs, ctrl) {
                    if (ctrl[1] && attrs.esValidatorAsyncMulti) {

                        // AngularJs v 1.5x
                        if (!ctrl[1].$options) {
                            ctrl[1].$options = {
                                allowInvalid: true,
                                updateOnDefault: true
                            };
                            // AngularJs v 1.6x
                        } else if (ctrl[1].$options && typeof ctrl[1].$overrideModelOptions === 'function') {
                            ctrl[1].$overrideModelOptions({
                                allowInvalid: true,
                                updateOn: 'blur'
                            });
                        }

                        scope.esValidatorAsyncMultiFnsArray = scope.$eval(attrs.esValidatorAsyncMulti);
                        if (scope.esValidatorAsyncMultiFnsArray.length) {
                            scope.esValidatorAsyncMultiFnsArray.map(function (item, index) {
                                if (typeof item === 'function') {
                                    ctrl[1].$asyncValidators['validator_' + index] = item;
                                } else if (typeof item === 'object') {
                                    if (item.name && typeof item.name === 'string' && item.validator) {
                                        ctrl[1].$asyncValidators[item.name] = item.validator;
                                    }
                                }
                            });
                        }
                    }
                }
            };
        });
})(angular);
