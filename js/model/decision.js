'use strict';
define([
    'model/rating',
    'model/objective',
    'model/alternative'
],
function (Rating, Objective, Alternative) {
    function Decision (name) {
        this.name = name;
        this.objectives   = [];
        this.alternatives = [];
    }

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

    /**
     * Gets the alternative/rating matrix
     *
     * These will come out in the order that the alternatives and ratings are
     * currently in for the decision as this function just iterates over the
     * values
     */
    Decision.prototype.getMatrix = function () {
        var matrix = [];

        this.alternatives.forEach(function (alt) {
            var row = [];
            alt.ratings.forEach(function (rating) {
                row.push(rating.value);
            });
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
