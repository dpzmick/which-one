'use strict';

define(
    [
        'angularAMD',
        'model/decision',
        'model/alternative',
        'model/rating',
        'model/objective',
        'lodash',
        'angular-route'
    ],
function (angularAMD, Decision, Alternative, Rating, Objective, _) {
    function routes ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/index.html',
                controller: 'WhichOneController'
            });
    }

    function decisionFactory () {
        if (typeof localStorage['matrices'] === 'undefined') {
            console.log('no local storage found');
            return [Decision.defaultDecision()];
        } else {
            console.log('found local storage');
            var ms     = JSON.parse(localStorage['matrices']);
            var vs     = JSON.parse(localStorage['vectors']);
            var anames = JSON.parse(localStorage['altNames']);
            var onames = JSON.parse(localStorage['objNames']);
            var dnames = JSON.parse(localStorage['decisionNames']);

            return _.map(_.zip(ms, vs, anames, onames, dnames), _.spread(function (m, v, as, os, name) {
                return Decision.fromMatrixVectorNames(m, v, as, os, name);
            }));
        }
    }

    function whichOneController ($scope, decisions, $window) {
        $scope.decisions     = decisions;
        $scope.decisionIndex = 0;

        // TODO why
        $scope.f = function (index) {
            $scope.decisionIndex = index;
        };

        $scope.newDecision = function () {
            $scope.decisions.push(new Decision('new'));
        };

        $scope.addObjective = function () {
            $scope.decisions[$scope.decisionIndex].addNewObjective();
        };

        $scope.addAlternative = function () {
            $scope.decisions[$scope.decisionIndex].addNewAlternative();
        };

        $scope.clearLocalStorage = function () {
            delete localStorage['matrices'];
            delete localStorage['vectors'];
            delete localStorage['altNames'];
            delete localStorage['objNames'];
            delete localStorage['decisionNames'];
            $window.location.reload();
        };

        // make everyone cry because perfomance is sooo bad
        $scope.$watch(
            function (data) {
                localStorage['matrices'] = JSON.stringify(data.decisions.map(function (dec) {
                    return dec.getMatrix();
                }));

                localStorage['vectors'] = JSON.stringify(data.decisions.map(function (dec) {
                    return dec.getWeightVector();
                }));

                localStorage['altNames'] = JSON.stringify(data.decisions.map(function (dec) {
                    return dec.getAlternatives().map(function (alt) {
                        return alt.name;
                    });
                }));

                localStorage['objNames'] = JSON.stringify(data.decisions.map(function (dec) {
                    return dec.getObjectives().map(function (obj) {
                        return obj.name;
                    });
                }));

                localStorage['decisionNames'] = JSON.stringify(data.decisions.map(function (dec) {
                    return dec.name;
                }));
            }
        );
    }

    var app = angular.module('webapp', ['ngRoute']);

    // setup angular app
    app
        .factory('Decisions', decisionFactory)
        .controller('WhichOneController', whichOneController)
        .controller('WhichOneController', ['$scope', 'Decisions', '$window', whichOneController])
        .config(['$routeProvider', routes]);

    // do some magic with angularAMD
    return angularAMD.bootstrap(app);
});

