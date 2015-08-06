'use strict';
define([
    'model/rating',
    'model/objective',
    'model/alternative',
    'lodash'
],
function (Rating, Objective, Alternative, _) {
    function Decision (name) {
        this.name = name;
        this.objectives   = [];
        this.alternatives = [];
    }

    Decision.defaultDecision = function () {
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

        var d = new Decision('test');
        d.addObjectives([o1, o2, o3]);
        d.addAlternatives([a1, a2, a3]);

        return d;
    };

    Decision.fromMatrixVectorNames = function (matrix, vector, altNames, objNames, name) {
        var i, j;
        var objectives = [];
        var alts = [];
        var tmpratings = [];
        var tmpo;
        var tmpalt;

        var d = new Decision(name);

        // make objectives
        if (vector.length !== objNames.length) {
            throw new Error('vector and objNames must be the same length');
        }

        _.map(_.zip(objNames, vector), _.spread(function (name, weight) {
            objectives.push(new Objective(name, weight))
        }));

        d.addObjectives(objectives);

        // make alternatives
        if (matrix.length !== altNames.length) {
            throw new Error('matrix first dimension must equal number of alternative names');
        }

        // TODO check internal length
        for (i = 0; i < matrix.length; i++) {
            tmpalt     = new Alternative(altNames[i]);
            tmpratings = [];

            for (j = 0; j < matrix[i].length; j++) {
                tmpratings.push(new Rating(objectives[j], matrix[i][j]));
            }

            tmpalt.addRatings(tmpratings);
            alts.push(tmpalt);
        }

        d.addAlternatives(alts);

        return d;
    };

    Decision.prototype.addNewObjective = function () {
        var objective = new Objective('new', 1);
        this.objectives.push(objective);

        this.alternatives.forEach(function (alt) {
            alt.addRating(new Rating(objective, 0));
        });
    };

    Decision.prototype.addObjectives = function (objectives) {
        this.objectives = this.objectives.concat(objectives);
    };

    Decision.prototype.getObjectives = function () {
        return this.objectives;
    };

    Decision.prototype.addNewAlternative = function () {
        var alt = new Alternative('new');

        this.objectives.forEach(function (obj) {
            alt.addRating(new Rating(obj, 0));
        });

        this.alternatives.push(alt);
    };

    Decision.prototype.addAlternatives = function (alternatives) {
        this.alternatives = this.alternatives.concat(alternatives);
    };

    Decision.prototype.getAlternatives = function () {
        return this.alternatives;
    };

    /**
     * Gets the alternative/rating matrix
     *
     * These will come out in the order that the alternatives and ratings are
     * currently in for the decision as this function just iterates over the
     * values
     */
    Decision.prototype.getMatrix = function () {
        var matrix = [];
        var row = [];

        this.alternatives.forEach(function (alt) {
            row = [];
            alt.ratings.forEach(function (rating) {
                row.push(rating.value);
            });
            matrix.push(row);
        });

        return matrix;
    };

    /**
     * Gets a vector of weights for the decision
     * eg. [1, 2, 5, 2, ...]
     */
    Decision.prototype.getWeightVector = function () {
        return this.objectives.map(function (obj) {
            return obj.weight;
        });
    };

    return Decision;
});
