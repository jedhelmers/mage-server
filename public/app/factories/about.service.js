angular
  .module('mage')
  .factory('AboutService', AboutService);

AboutService.$inject = ['$http'];

function AboutService($http) {
  var ***REMOVED*** = {
    about: about
  };

  return ***REMOVED***;

  function about() {
    return $http.get('/api/');
  };
}