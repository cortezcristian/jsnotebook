(function(){

angular
  .module('jsnotebook')
  .filter('keyboardShortcut', function($window) {
    return function(str) {
      if (!str) return;
      var keys = str.split('-');
      var isOSX = /Mac OS X/.test($window.navigator.userAgent);

      var seperator = (!isOSX || keys.length > 2) ? '+' : '';

      var abbreviations = {
        M: isOSX ? '⌘' : 'Ctrl',
        A: isOSX ? 'Option' : 'Alt',
        S: 'Shift'
      };

      return keys.map(function(key, index) {
        var last = index == keys.length - 1;
        return last ? key : abbreviations[key];
      }).join(seperator);
    };
  })
  .controller('MainCtrl', function($scope, $timeout, $location, $log,
    $q, toastr, $uibModal, $mdDialog){

		$scope.doc = {
		 "data": [
				{
				 "rowtype": "markdown",
				 "metadata": {},
				 "source": [
					"# JS Notebook"
				 ]
				},
				{
				 "rowtype": "markdown",
				 "metadata": {},
				 "source": [
					"Download it from [jsnotebook](https://github.com/cortezcristian/jsnotebook/)"
				 ]
				},
				{
				 "rowtype": "code",
				 "execution_count": 1,
				 "metadata": {
					"collapsed": false
				 },
				 "outputs": [],
				 "source": [
					"var os = require('os')\n",
					"os.hostname()"
				 ]
				}
			]
		};

	  $scope.settings = {
      printLayout: true,
      showRuler: true,
      showSpellingSuggestions: true,
      presentationMode: 'edit'
    };

    $scope.sampleAction = function(name, ev) {
      $mdDialog.show($mdDialog.alert()
        .title(name)
        .textContent('You triggered the "' + name + '" action')
        .ok('Great')
        .targetEvent(ev)
      );
    };

	})
	.directive('smartrow', function($log, $http, $compile, $parse, $templateCache){
		 return {
			 restrict: 'EA',
			 template: "",
			 scope: {
         rowmodel : '=rowmodel'
			 },
			 link: function(scope, element, attrs){
				// http://stackoverflow.com/questions/19501584/how-to-pass-in-templateurl-via-scope-variable-in-attribute

				/*
				scope.$watch(attrs.rowmodel, function (value) {
					if (value) {
						loadTemplate(value);
					}
				});
				*/
				 var templates = {
					 'code': 'views/smartrow-editor.html',
					 'markdown': 'views/smartrow-markdown.html'
				 };


				if(scope.rowmodel && !scope.rowmodel.loaded){
					loadTemplate(scope.rowmodel);
				}

				function loadTemplate(item) {
					var template =  templates[item.rowtype] || "";
					if(template !== "") {

					$http.get(template, { cache: $templateCache })
						.then(function(templateContent) {
							console.log(template, templateContent);
							scope.rowmodel.loaded = true;
							element.replaceWith($compile(templateContent.data)(scope));
							//var s = angular.copy(scope);
							//element.html($compile(templateContent.data)({}));
						});
					}
				}


			 }
			 /*
			 templateUrl: function(elem, attr){
				 var templates = {
					 'markdown': 'markdown'
				 };
				 $log.log(attr);
				 return 'smartrow-markdown.html';
			 }
			 */
		 };

   });

})();
