'use strict';

requirejs.config({
    baseUrl: 'js/',

    paths: {
        'angular':       'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular.min',
        'angular-route': 'https://ajax.googleapis.com/ajax/libs/angularjs/1.4.3/angular-route.min',
        'angularAMD':    '//cdn.jsdelivr.net/angular.amd/0.2.0/angularAMD.min'
    },

    shim: {
        'angularAMD':    ['angular'],
        'angular-route': ['angular']
    },

    deps: ['app']
});
