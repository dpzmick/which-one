'use strict';

define(function () {
    function Alternative (name) {
        this.name = name;
        this.ratings = [];
    }

    Alternative.prototype.addRatings = function (ratings) {
        this.ratings = this.ratings.concat(ratings);
    };

    return Alternative;
});
