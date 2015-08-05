'use strict';

define(function () {
    /**
     * Constructor for rating object
     *
     * Ratings can have unknown value
     */
    function Rating (objective, value) {
        this.obj   = objective;
        this.value = value;
    }

    return Rating;
});
