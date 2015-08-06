'use strict';

define(function () {
    function Alternative (name) {
        this.name = name;
        this.ratings = [];
    }

    Alternative.prototype.addRatings = function (ratings) {
        this.ratings = this.ratings.concat(ratings);
    };

    Alternative.prototype.getScore = function () {
        var score = 0;
        this.ratings.forEach(function (rating) {
            score += rating.value * rating.obj.weight;
        });

        return score;
    };

    return Alternative;
});
