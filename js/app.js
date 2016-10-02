
(function(){
  'use strict';
	
  angular.module('NarrowItDownApp', [])
  .controller('NarrowItDownController', NarrowItDownController)
  .service('MenuSearchService', MenuSearchService)  
  .directive('foundItems', FoundItems)
  .constant('ApiBasePath', "https://davids-restaurant.herokuapp.com"); 
  
//Directive
  function FoundItems(){
	var ddo = {
		templateUrl: 'foundItems.html',
		//template: '<ul><li ng-repeat="item in menu.found">{{item.name}}  {{item.id}}<button ng-click="menu.onRemove({index: $index});">Dont want this one!</button></li></ul><div class="error" ng-transclude></div>',
	    scope: {
		  //one directional bind of the var found in NarrowItDownController by declaring found = menu.found in HTML
		  found: '<', 
		  onRemove: '&' //HTML: on-remove='menu.removeItem(index)' | Template: ng-click="menu.onRemove({index: $index});"
		},
		controller: FoundItemsDirectiveController,
		controllerAs: 'menu',
		bindToController: true,
		link: ShoppingListDirectiveLink,
		transclude: true
	  };
	  return ddo;  
  }

//Directive Controller, checks for "Nothing Found" message
  function FoundItemsDirectiveController(){
	var menu = this;
	  
	menu.checkInput = function(){
	  if(menu.found.length === 0){
		return true;
	  }
	  return false;
	};
  }
  
//Directive Link for jQuery	- looks for change in function "checkInput" inside scope.$watch
  function ShoppingListDirectiveLink(scope, element, attrs, controller){
	scope.$watch('menu.checkInput()', function(newValue, oldValue){
	  if(newValue === true){
		displayMessage();
	  }
	  else{
		removeMessage();
	  }
	});
	  
	function displayMessage(){
		
	  //Using full JQuery
	  var warningElem = element.find('div.error');
	  warningElem.css('display', 'block');
	}
	function removeMessage(){
		
	  //Using full JQuery
	  var warningElem = element.find('div.error');
	  warningElem.css('display', 'none');
	}
  }
  
//Main Controller
  NarrowItDownController.$inject = ['MenuSearchService'];
  function NarrowItDownController(MenuSearchService){
	
	var menu = this;
	menu.warning = "";
	menu.found = [];
	menu.entry = "";
	
	menu.searchFoundList = function(searchItem){
	  if(menu.entry === ""){
		menu.warning = "NOTHING FOUND!";
	  }
	  else{
	    menu.found = MenuSearchService.getMatchedMenuItems(searchItem);
	  }
    };
	
	menu.removeItem = function (itemIndex){
	  MenuSearchService.removeItem(itemIndex);
	};
  }
	
//Service
  MenuSearchService.$inject = ['$http', 'ApiBasePath'];
  function MenuSearchService($http, ApiBasePath){
    
	var service = this;
	var foundItems = [];
	
	service.getMatchedMenuItems = function(searchItem){ //searchItem example: 'chicken'
      foundItems = []; //empty on every search
	  var response = $http({
		method: "GET",
		url: (ApiBasePath + "/menu_items.json"),
	  });
      response.then(function(result){
        service.items = result.data; // result.data = Object {menu_items: Array[219]}
		//service.items.menu_items = array of 219 objects with attributes; description, id, name...
	    for(var i = 0; i < service.items.menu_items.length; i++){
		  if (service.items.menu_items[i].description.indexOf(searchItem) !== -1){ //if in array - > NOT not in array
		    foundItems.push(service.items.menu_items[i]);
		  }
	    }
	  });
	  return foundItems;
	};
	
	service.removeItem = function(itemIndex){
	  foundItems.splice(itemIndex, 1);
	};
	 
  }//closes MenuSearchService
	
	  
})(); // closes IIFE



