angular
  .module('jsnotebook', [
    'toastr',
		'ngMaterial',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
		'btford.markdown',
    'toggle-switch',
    'cfp.hotkeys',
    'ui.select',
    'datetimepicker',
    'ui.bootstrap'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, uiSelectConfig, datetimepickerProvider, hotkeysProvider, toastrConfig) {
		$stateProvider
			.state({
				name: 'main',
				url: '/main',
				controller: 'MainCtrl',
				templateUrl: 'views/main.html'
			});
		$urlRouterProvider.otherwise('/main');
	})
	.run(function($rootScope){

		$rootScope.main_app = "Sample";
	});

