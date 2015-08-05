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
            })
            .when('/:id', {
                templateUrl: '/decision_editor.html',
                controller: 'DecisionEditor'
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

        return [d1];
    }

    function whichOneController ($scope, decisions) {
        $scope.decisions = decisions;
    }

    function decisionEditor ($scope, $routeParams, Decisions) {
        $scope.decision = Decisions[$routeParams.id];

        $scope.scoreFor = function (alt) {
            var score = 0;
            alt.ratings.forEach(function (rating) {
                score += rating.value * rating.obj.weight;
            });

            return score;
        };
    }

    // TODO move to util
    function convertToNumber (string) {
        console.log(string);
        return parseInt(string);
    }

    var app = angular.module("webapp", ['ngRoute']);

    // setup angular app
    app
        .factory('Decisions', decisionFactory)
        .controller('WhichOneController', whichOneController)
        .controller('WhichOneController', ['$scope', 'Decisions', whichOneController])
        .controller('DecisionEditor',     ['$scope', '$routeParams', 'Decisions', decisionEditor])
        .config(['$routeProvider', routes])
        .directive('convert-to-number',   convertToNumber);

    // do some magic with angularAMD
    return angularAMD.bootstrap(app);
});
