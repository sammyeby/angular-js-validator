# EsNgValidator (AngularJs)

EsNgValidator is an AngularJs (alias Angular 1) based custom form input validation directives which is lightweight, easy to use.

**Version support:** v1.5.x and v1.6.x

**Disclaimer:** This validator plugin was programmed and tested mostly in AngularJs v1.6.5 but should work in AngularJs v1.5.x, if it doesn't work in v1.5.x, then maybe you should upgrade ;) 

## Concept

The main idea was to take advantage of the built-in AngularJs **$validators** and **$asyncValidators** arrays that take validator functions which AngularJs calls internally (**validate()** depending on your ngModel settings) whenever ngModel controller's **$modelValue**/**$viewValue changes**. The directives in **esNgValidator** plugin are implemented in such a way that we can now pass in our own custom validator functions as values of the directives when used in  html markup and our custom validator function will be added to the **$validators**/**asyncValidators** arrays and they get called as well by AngularJs together with other validator functions when Angular does its validation magic. 

E.g: **es-validator="myCustomValidatorFunction"** 

Or

 **es-validator="myCustomValidatorFunction(myModel.prop)"** That easy!!! 

**IMPORTANT POINT:** Our custom validator function **MUST** have **one parameter** which is the input model/value and **MUST** also return **boolean** for **$validators** and **promise** for **$asyncValidators** 

## Important features

- It supports multiple input dependent validation. Example: When the sum of two or more inputs values should be 100 for the inputs to be valid.

- It works with other Angular ngModel directives like `ng-model-options` 

- It works on custom input elements with ngModel e.g. 

  ```
  <my-custom-element
  	name="customInput"
  	es-validator="customValidatorFn"
  	ng-model="myModel.prop">
  </my-custom-element>
  ```

- Due to the inconsistency of validations states when using ngModel on custom input elements, it introduces a form control property **$inputsStates** which contains the correct form custom input states such as: **$dirty**, **$touched**, **$untouched**, **$pristine**, **$valid**, **$invalid**, **$pending** (for async validators) and **$error** object to fix the issue on checking input validation states on custom input elements. It can be used like below on the **input-error** attribute:

  ```
  <my-custom-element
  	name="customInput"
  	es-validator="customValidationFn"
  	input-error="formName.$inputsStates.customInput.$invalid"
  	ng-model="myModel.prop">
  </my-custom-element>
  ```

  ​

## Demo

Click here for the demo.

## Installation

Using Npm: `npm install es-ng-validator`

Inject `esNgValidator` as a dependency of your Angular module

## List of validator directives and usage

- **es-validator-initiator** - Attribute added to ```<form>``` element to initiate the esNgValidator. It is required by other validator directives for form validation to work very well.

  - ```<form name="formName" es-validator-initiator></form>```

- **es-validator** - Takes a single validator function that returns boolean.

  - **Usage**

    ```
    <input es-validator="customValidatorFn"
           class="text-box"
           name="single"
           ng-model="modelObj.single">
    ```

    ​

- **es-validator-multi** - Takes an array of objects containing validator **name** and **validator** functions

  `name: 'string', validator: function (modelValue) {return true || false}`

  - **Usage**

    ```
    //Somewhere in your controller
    $scope.myCustomValidatorsArry = [
    		{name: 'customValidator_1', validator: firstValidatorFn}, {name: 				'customValidator_2', validator: secondValidatorFn}
    ];

    // In html 
    <input class="text-box"
           name="multi"
           ng-model="modelObj.multi"
           es-validator-multi="myCustomValidatorsArry">
           
     // Of course you can do html inline
     es-validator-multi="[{name: 'first', validator: firstFn},...]"
    ```

    ​

- **es-validator-async** - Takes a single validator function that returns a Promise

  - **Usage**

    ```
    <input class="text-box"
           name="async"
           es-validator-async="customAsyncValidatorFn"
           ng-model="modelObj.async">
    ```

    ​

- **es-validator-async-multi** - Takes an array of objects containing validator **name** and **validator** functions (functions which return Promises).

  `name: 'string', validator: function (modelValue) {return defer.promise}`

  - **Usage** 

    ```
    //Somewhere in your controller
    $scope.myCustomAsyncValidatorsArry = [
    		{name: 'customAsyncValidator_1', validator: firstAsyncValidatorFn}, {name: 				'customAsyncValidator_2', validator: secondAsyncValidatorFn}
    ];

    // In html 
    <input class="text-box"
           name="multi"
           ng-model="modelObj.multi"
           es-validator-async-multi="myCustomAsyncValidatorsArry">
           
     // Of course you can do html inline
     es-validator-async-multi="[{name: 'firstAsync', validator: firstAsyncFn},...]"
    ```

    ​

- **es-dependent-validator** - Takes a single validator function (**which returns boolean**) and the same custom validator function should be added to the form inputs that depends on it. 

  - **Usage**

    ```
    <input type="number"
           class="text-box"
           name="dependant_1"
           ng-model="myModel.firstDependant"
           es-dependent-validator="customDependentValidatorFn">
           
    <input type="number"
           class="text-box"
           name="dependant_2"
           ng-model="myModel.secondDependant"
           es-dependent-validator="customDependentValidatorFn">
    ```

    ​

On the final note, all custom validator directives mentioned above can be used together with each other and other HTML in-built validators as they suit you.