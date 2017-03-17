angular
  .module('jsnotebook', [
    'toastr',
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ui.router',
    'ngSanitize',
    'toggle-switch',
    'cfp.hotkeys',
    'ui.select',
    'datetimepicker',
    'ui.bootstrap'
  ])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, uiSelectConfig, datetimepickerProvider, hotkeysProvider, toastrConfig) {
		/*
		$stateProvider
			.state({
				name: 'empresas',
				url: '/empresas',
				controller: 'EmpresasCtrl',
				templateUrl: 'views/empresas.html'
			});
		$urlRouterProvider.otherwise('/empresas');
		*/
	})
	.run(function($rootScope){

		$rootScope.main_app = "Sample";
	});

