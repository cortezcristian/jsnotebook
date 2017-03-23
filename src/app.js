$(document.body).on('click', 'a', function(e) {
  // https://github.com/electron/electron/issues/4191
  var href = $(this).attr("href");
  var regex = new RegExp('' + document.location.pathname + '.*');
  if (!href.match(regex)) {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(function() {
      var path = e.target.href;
      ipc.send('element-clicked', path);
    }, 100);
    return false;
  }
});

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
    'ui.ace',
    'ui.bootstrap'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, uiSelectConfig, datetimepickerProvider, hotkeysProvider, toastrConfig) {
    $stateProvider
      .state({
        name: 'main',
        url: '/main',
        controller: 'MainCtrl',
        templateUrl: 'views/main.html'
      });
    $urlRouterProvider.otherwise('/main');
  })
  .run(function($rootScope) {

    $rootScope.main_app = "Sample";
  });
