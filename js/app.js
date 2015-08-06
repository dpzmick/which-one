define(
    [
        'angularAMD',
        'angular-route',
        'model/decision',
        'model/alternative',
        'model/rating',
        'model/objective'
    ],
function (angularAMD, _, Decision, Alternative, Rating, Objective) {
    function routes ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: '/index.html',
                controller: 'WhichOneController'
            });
    }

    function decisionFactory () {
        var o1 = new Objective('o1', 3);
        var o2 = new Objective('o2', 5);
        var o3 = new Objective('o3', 2);

        var a1 = new Alternative('a1');
        a1.addRatings([
            new Rating(o1, 5),
            new Rating(o2, -5),
            new Rating(o3, 3)
        ]);

        var a2 = new Alternative('a2');
        a2.addRatings([
            new Rating(o1, 3),
            new Rating(o2, 0),
            new Rating(o3, -3)
        ]);

        var a3 = new Alternative('a3');
        a3.addRatings([
            new Rating(o1, -5),
            new Rating(o2, 0),
            new Rating(o3, 5)
        ]);

        var d1 = new Decision('test');
        d1.addObjectives([o1, o2, o3]);
        d1.addAlternatives([a1, a2, a3]);

        o1 = new Objective('o1', 1);
        o2 = new Objective('o2', 2);
        o3 = new Objective('o3', 5);

        a1 = new Alternative('a1');
        a1.addRatings([
            new Rating(o1, 5),
            new Rating(o2, -5),
            new Rating(o3, 3)
        ]);

        a2 = new Alternative('a2');
        a2.addRatings([
            new Rating(o1, 3),
            new Rating(o2, 0),
            new Rating(o3, -3)
        ]);

        a3 = new Alternative('a3');
        a3.addRatings([
            new Rating(o1, -5),
            new Rating(o2, 0),
            new Rating(o3, 5)
        ]);

        var d2 = new Decision('test 1');
        d2.addObjectives([o1, o2, o3]);
        d2.addAlternatives([a1, a2, a3]);

        return [d1, d2];
    }

    function whichOneController ($scope, decisions) {
        $scope.decisions     = decisions;
        $scope.decisionIndex = 0;

        // TODO why
        $scope.f = function (index) {
            $scope.decisionIndex = index;
        }

        $scope.newDecision = function () {
            $scope.decisions.push(new Decision('new'));
        };

        $scope.addObjective = function () {
            $scope.decisions[$scope.decisionIndex].addNewObjective();
        };

        $scope.addAlternative = function () {
            $scope.decisions[$scope.decisionIndex].addNewAlternative();
        };
    }

    var app = angular.module("webapp", ['ngRoute']);

    // setup angular app
    app
        .factory('Decisions', decisionFactory)
        .controller('WhichOneController', whichOneController)
        .controller('WhichOneController', ['$scope', 'Decisions', whichOneController])
        .config(['$routeProvider', routes]);

    // do some magic with angularAMD
    return angularAMD.bootstrap(app);
});

