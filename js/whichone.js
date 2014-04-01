// global vars
decisions = [];
currentDecisionId = -1;
decisionCount = 0;

// Yum, parentHack!
function decision( name, objectives, alternatives ) {
    // PRIVATE MEMBERS
    this.objCounter = 0;
    this.altCounter = 0;

    // SET DEFAULTS
    name = typeof name !== 'undefined' ? name : "New Decision";
    objectives = typeof objectives !== 'undefined' ? objectives : [ ];
    alternatives = typeof alternatives !== 'undefined' ? alternatives : [ ];

    // PUBLIC MEMBERS
    this.id = decisionCount++;
    this.name = name;
    this.objectives = objectives;
    this.alternatives = alternatives;

    // INTERNAL CLASSES
    function objective( objName, objWeight, parentHack ) {
        // set defaults
        objName = typeof objName !== 'undefined' ? objName : "New Objective";
        objWeight = typeof objWeight !== 'undefined' ? objWeight : 0;
    
        this.id = parentHack.objCounter++;
        this.name = objName;
        this.weight = objWeight;

        this.impact = function() {
            var anotherHack = this
            var compound = _.map( parentHack.alternatives, function(alt) {
                return alt.ratingFor( anotherHack ) * anotherHack.weight;
            });

            var variance = function( lst ) {
                var avg = _.reduce( lst, function(memo, num) { return memo + num; } ) / lst.length;
                var result = 0;
                _.each(lst, function(e) {
                    var tmp = e - avg;
                    result += tmp * tmp;
                });
                return result;
            }

            return variance(compound);
        }
    }

    function alternative( altName, parentHack ) {
        // set defaults
        altName = typeof altName !== 'undefined' ? altName : "New Option";

        this.id = parentHack.altCounter++;
        this.name = altName;
        this.ratings = { }
    
        this.rate = function( objective, score ) {
            this.ratings[objective.id] = score;
        }

        this.removeRatingFor = function( objective ) {
            this.ratings[objective.id] = undefined;
        }
    
        this.ratingFor = function( objective ) {
            if (typeof this.ratings[objective.id] === 'undefined') {
                return 0;
            }
            return this.ratings[objective.id];
        }

        this.score = function() {
            var anotherHack = this; // TODO learn javascript
            return _.reduce( parentHack.objectives, function( sum, obj ) {
                return sum + anotherHack.ratingFor(obj) * obj.weight;
            }, 0);
        }
    }

    this.sortAlternatives = function() {
        this.alternatives.sort( function( alt1, alt2 ) { return alt2.score() - alt1.score(); } );
        saveToLocalStorge();
    }
    
    // ADDING NEW THINGS
    this.addObjective = function( objName, objWeight ) {
        var newObj = new objective( objName, objWeight, this )
        this.objectives.push( newObj );
        return newObj;
    }

    this.addAlternative = function( altName ) {
        var newAlt = new alternative( altName, this );
        this.alternatives.push( newAlt );
        return newAlt;
    }

    // HELPER FUNCTIONS
    this.findObjectiveById = function( id ) {
        return _.find( this.objectives, function(obj) { return obj.id === id } );
    }

    this.findAlterativeById = function( id ) {
        return _.find( this.alternatives, function(alt) { return alt.id === id } );
    }

    // for loading data
    this.addObjectiveWithId = function( objName, objWeight, objId ){
        this.addObjective(objName, objWeight).id = objId;
        if (objId > this.objCounter) {
            this.objCounter = objId + 1;
        }
    }

    this.addAlternativeWithId = function( altName, altId ) {
        this.addAlternative( altName ).id = altId;
        this.altCounter = this.altCounter - 1; // offset the creation
        if (altId > this.altCounter) {
            this.altCounter = altId + 1;
        }
    }

}

function addDecision() {
    var newDec = new decision();
    newDec.addObjective();
    newDec.addAlternative();
    decisions.push( newDec );
    addDecisionToList( newDec );
    saveToLocalStorge();
}

function currentDecision() {
    return _.find( decisions, function(d) { return d.id == currentDecisionId; })
}

// ******************************************************
// Buttons and clicks
// ******************************************************
function bindAddObjectiveButton() {
    $('body').on('click', 'button[name=newObj]', function() {
        currentDecision().addObjective();
        makeEditor( currentDecision() );
        buildObjectiveDropdown();
        drawPlots(currentDecision());
        saveToLocalStorge();
    });
}

function bindAddAlternativeButton() {
    $('body').on('click', 'button[name=newAlt]', function() {
        currentDecision().addAlternative();
        makeEditor( currentDecision() );
        saveToLocalStorge();
        buildOptionsDropdown();
    });
}

function bindDecisionListClick() {
    $('#decision_list').on( 'click', 'a', function(link) {
        currentDecisionId = parseInt( link.target.id );
        updateDecisionListActive();
        makeEditor( currentDecision() );
        drawPlots(currentDecision());
        buildObjectiveDropdown();
        buildOptionsDropdown();
    });
}

function bindAddDecisionButton() {
    $('body').on('click', 'a[id=addDesc]', function() {
        addDecision();
    });
}

function bindRemoveDecisionButton() {
    $('body').on('click', 'a[id=removeDesc]', function() {
        decisions = _.without( decisions, currentDecision() );
        currentDecisionId = decisions[0].id;
        redrawDecisionList();
        saveToLocalStorge();
        makeEditor( currentDecision() );
        buildObjectiveDropdown();
        buildOptionsDropdown();
        drawPlots(currentDecision());
    });
}

function bindResetButton() {
    $('body').on('click', 'a[id=reset]', function() {
        clearData();
        loadDefaults();
        setTimeout( function() { location.reload(); }, 100 );
    });
}

function bindSortButton() {
    $('body').on('click', 'button[name=sort]', function() {
        currentDecision().sortAlternatives();
        makeEditor( currentDecision() );
        buildOptionsDropdown();
        drawPlots(currentDecision());
        saveToLocalStorge();
    });
}

function bindObjRemoveClick() {
    $('#objMenu').on( 'click', 'a', function(link) {
        var id = parseInt( link.target.id );
        var obj = currentDecision().findObjectiveById( id );
        _.each( currentDecision().alternatives, function(alt) {
            alt.removeRatingFor( obj );
        });
        currentDecision().objectives = _.without(
            currentDecision().objectives,
            currentDecision().findObjectiveById( id )
        );
        makeEditor( currentDecision() );
        drawPlots( currentDecision() );
        buildObjectiveDropdown();
    });
}

function bindAltRemoveClick() {
    $('#altMenu').on( 'click', 'a', function(link) {
        var id = parseInt( link.target.id );
        currentDecision().alternatives = _.without(
            currentDecision().alternatives,
            currentDecision().findAlterativeById( id )
        );
        makeEditor( currentDecision() );
        drawPlots( currentDecision() );
        buildOptionsDropdown();
    });
}

// ******************************************************
// Data and storage
// ******************************************************
function buildDecisionFromData( data ) {
    var builtDecision = new decision( data.name );

    _.each( data.objectives, function(obj) {
        builtDecision.addObjectiveWithId( obj.name, obj.weight, obj.id );
    });

    _.each(data.alternatives, function(alt) {
        builtDecision.addAlternativeWithId( alt.name, alt.id );
        _.each(
            _.pairs(alt.ratings),
            function(pair) {
                var objId = parseInt(pair[0]);
                var score = pair[1];
                builtDecision.findAlterativeById( alt.id ).rate(
                    builtDecision.findObjectiveById( objId ),
                    score);
        });
    });

    return builtDecision;
}

function handleDecisionData( data ) {
    var builtDecision = buildDecisionFromData( data );
    decisions.push( builtDecision );

    if (currentDecisionId === -1) {
        currentDecisionId = 0;
        makeEditor( currentDecision() );
        drawPlots(currentDecision());
    }

    addDecisionToList( builtDecision );
    updateDecisionListActive();
    saveToLocalStorge();
}

function loadDefaultJSON( filename ) {
    $.getJSON(filename)
        .done(handleDecisionData)
        .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
        });
}

function loadLocalStorageData() {
    var stringData = localStorage.getItem("decisions");
    if (stringData !== null) {
        clearData();
        _.each( JSON.parse(stringData), function(d) { handleDecisionData( d ); });
    } else {
        loadDefaults();
    }
}

function saveToLocalStorge() {
    localStorage.setItem( "decisions", JSON.stringify( decisions ) );
}

function clearData() {
    decisions = [];
    currentDecisionId = -1;
    decisionCount = 0;
}

function loadDefaults() {
    loadDefaultJSON( 'defaults/college.json' );
    loadDefaultJSON( 'defaults/job.json' );
}

// ******************************************************
// Decision list
// ******************************************************
function addDecisionToList( decision ) {
    $('#decision_list').append(
        '<li id="' + decision.id + '">'
        + '<a href="#" id="'+ decision.id + '">' + decision.name
        + '</a></li>');
}

function updateDecisionListActive() {
    $('#decision_list .active').removeClass('active');
    $('#decision_list #' + currentDecisionId).addClass('active');
}

function redrawDecisionList() {
    $('#decision_list').empty();
    _.each( decisions, addDecisionToList );
    updateDecisionListActive();
}


// ******************************************************
// Objective Removal Dropdown
// ******************************************************
function buildObjectiveDropdown() {
    $('#objMenu').empty();
    _.each( currentDecision().objectives, function( obj ) {
        $('#objMenu').append('<li><a id="' + obj.id + '">' + obj.name + '</a></li>');
    });
}

// ******************************************************
// Option Removal Dropdown
// ******************************************************
function buildOptionsDropdown() {
    $('#altMenu').empty();
    _.each( currentDecision().alternatives, function( alt ) {
        $('#altMenu').append('<li><a id="' + alt.id + '">' + alt.name + '</a></li>');
    });
}

// ******************************************************
// Decision Editor
// ******************************************************
function makeEditor( decision ) {
    clearEditor();
    currentDecision().sortAlternatives();
    // add objectives row
    var str ="<tr> <td> </td>";
    _.each( decision.objectives, function(obj) {
        str += '<td>'
            + '<p> <a class="obj_name" id="' + obj.id + '">' + obj.name + '</a> </p>'
            + '<div class="obj_weight" id="' + obj.id + '"> </div>'
            + '</td>';
    });
    str += "</tr>";
    $('#decision_editor').append( str );

    // add each alternative's row
    str = '<tr>';
    _.each( decision.alternatives, function(alt) {
        str += '<td> <a class="alt_name" id="' + alt.id + '">' + alt.name + '</a> </td>';
        _.each( decision.objectives, function( obj ) {
            str += '<td>' + raterString(alt, obj) + '</td>';
        });
        str += '</tr> <tr>';
    });
    str += '</tr>';

    $('#decision_editor').append( str );

    // reload the other stuff
    loadEditables();
    loadStars();
    makeRaters();
}

function clearEditor() {
    $("#decision_editor").empty();
}

function loadEditables() {
    $('#renameDesc').editable({
        value: currentDecision().name,
        display: false,
        position: "left",
        url: function(data) {
            currentDecision().name = data.value;
            redrawDecisionList();
            saveToLocalStorge();
        }
    });

    $(".obj_name").editable({
        placement: "bottom",
        url: function(data) {
            var id = parseInt(data.name);
            var obj = currentDecision().findObjectiveById( id );
            obj.name = data.value;
            buildObjectiveDropdown();
            saveToLocalStorge();
        }
    });
    $(".alt_name").editable({
        placement: "right",
        url: function(data) {
            var id = parseInt(data.name);
            var alt = currentDecision().findAlterativeById( id );
            alt.name = data.value;
            buildOptionsDropdown();
            saveToLocalStorge();
        }
    });
}

function loadStars() {
    // set up for objectives
    _.each( currentDecision().objectives, function (obj) {
        $('#' + obj.id + '.obj_weight').rateit({
            "resetable" : false,
            "step": 1,
            "value": obj.weight
        });
    });
    $('.obj_weight').bind( 'rated', function (event, value) {
        var id = parseInt( event.currentTarget.id );
        currentDecision().findObjectiveById( id ).weight = parseInt( value );
        drawPlots( currentDecision() );
        saveToLocalStorge();
    });
}

function raterString( alt, obj ) {
    return '<select class="rater ' + alt.id + '_ratings" id="' + obj.id + '">'
                + '<option value="3" data-icon="icon-emo-grin"></option>'
                + '<option value="1" data-icon="icon-emo-happy"></option>'
                + '<option value="0" data-icon="icon-emo-sleep"></option>'
                + '<option value="-1" data-icon="icon-emo-displeased"></option>'
                + '<option value="-3" data-icon="icon-emo-unhappy"></option>'
            + '</select>';
}

function makeRaters() {
    function formatter(state) {
        var originalOption = state.element;
        return '<span class="' + $(originalOption).data('icon') + '"></span>';
    }

    $('.rater').select2({
        minimumResultsForSearch: -1,
        formatResult: formatter,
        formatSelection: formatter,
        escapeMarkup: function(m) { return m; },
    });

    _.each( currentDecision().alternatives, function(alt) {
        _.each( currentDecision().objectives, function(obj) {
            $('#' + obj.id + '.' + alt.id + '_ratings').select2("val", alt.ratingFor(obj));
            $('#' + obj.id + '.' + alt.id + '_ratings').on('change', function(event) {
                alt.rate( obj, parseInt( event.val ));
                drawPlots( currentDecision() );
                saveToLocalStorge();
            });
        });
    });
}

// ******************************************************
// Plots
// ******************************************************
function drawPlots( decision ) {
    drawAltPlot( decision );
    drawImpactPlot( decision );
}

function drawAltPlot( decision ) {
    $('#altPlot').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Relative Scores'
        },
        xAxis: {
            categories: _.map( decision.alternatives, function(alt) { return alt.name; } ),
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function() { return ''; }
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Alternatives',
            data: _.map( decision.alternatives, function(alt) { return alt.score(); } ),
            animation: false
        }],
        credits: {
            enabled: false
        }
    });
}

function drawImpactPlot( decision ) {
    $('#impactPlot').highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'Objective Impact'
        },
        xAxis: {
            categories: _.map( decision.objectives, function(obj) { return obj.name; } ),
            title: {
                text: null
            }
        },
        yAxis: {
            title: {
                text: null
            },
            labels: {
                formatter: function() { return ''; }
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'Alternatives',
            data: _.map( decision.objectives, function(obj) { return obj.impact(); } ),
            animation: false
        }],
        credits: {
            enabled: false
        }
    });
}

// ******************************************************
// Document Ready
// ******************************************************
$(document).ready(function () {
    //loadDefaults();
    loadLocalStorageData();

    // bind buttons
    // hmm, this doesn't quite scale does it
    bindAddObjectiveButton();
    bindAddAlternativeButton();
    bindDecisionListClick();
    bindAddDecisionButton();
    bindRemoveDecisionButton();
    bindResetButton();
    bindSortButton();
    bindObjRemoveClick();
    bindAltRemoveClick();

    // do UI stuff
    makeEditor( currentDecision() );
    drawPlots(currentDecision());
    buildObjectiveDropdown();
    buildOptionsDropdown();
});
