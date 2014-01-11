// global vars
decisions = [];
currentDecisionIndex = -1;
decisionCount = 0;

function decision( name, objectives, alternatives ) {
    // PRIVATE MEMBERS
    objCounter = 0;
    altCounter = 0;

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
    function objective( objName, objWeight) {
        // set defaults
        objName = typeof objName !== 'undefined' ? objName : "New Objective";
        objWeight = typeof objWeight !== 'undefined' ? objWeight : 0;
    
        this.id = objCounter++;
        this.name = objName;
        this.weight = objWeight;
    }

    function alternative( altName ) {
        // set defaults
        altName = typeof altName !== 'undefined' ? altName : "New Option";

        this.id = altCounter++;
        this.name = altName;
        this.ratings = { }
    
        this.rate = function( objective, score ) {
            this.ratings[objective.id] = score;
        }
    
        this.ratingFor = function( objective ) {
            if (typeof this.ratings[objective.id] === 'undefined') {
                return 0;
            }
            return this.ratings[objective.id];
        }
    }
    // ADDING NEW THINGS
    this.addObjective = function( objName, objWeight ) {
        if ( undefined !== _.find(
            this.objectives, function(obj) { return obj.name === objName;}))
        {
            throw "Objective already added";
        }
        this.objectives.push( new objective( objName, objWeight ) );
    }

    this.addAlternative = function( altName ) {
        if ( undefined !== _.find(
            this.alternatives, function(alt) { return alt.name === altName;}))
        {
            throw "Objective already added";
        }
        this.alternatives.push( new alternative( altName ) );
    }

    // HELPER FUNCTIONS
    this.findObjectiveByName = function( name ) {
        return _.find( this.objectives, function(obj) { return obj.name === name } );
    }
    
    this.findObjectiveById = function( id ) {
        return _.find( this.objectives, function(obj) { return obj.id === id } );
    }
    
    this.findAlterativeByName = function( name ) {
        return _.find( this.alternatives, function(alt) { return alt.name === name } );
    }

    this.findAlterativeById = function( id ) {
        return _.find( this.alternatives, function(alt) { return alt.id === id } );
    }

    // for loading data
    this.setObjectiveId = function( objName, newId ) {
        if (newId >= objCounter) {
            objCounter = newId + 1;
        }
        this.findObjectiveByName( objName ).id = newId;
    }

    this.setAlternativeId = function( altName, newId ) {
        if (newId >= altCounter) {
            altCounter = newId + 1;
        }
        this.findAlterativeByName( altName ).id = newId;
    }

}

function addDecision() {
    var newDec = new decision();
    newDec.addObjective();
    newDec.addAlternative();
    decisions.push( newDec );
    addDecisionToList( newDec );
}

// utility functions
function objComp(obj1, obj2) {
    return obj1.id > obj2.id;
}

// updates objectives table using values from a certain decision
function updateObjectivesTable( decision ) {
    $('#objectivesTable').handsontable({
        data: decision.objectives,
        colHeaders: ["Name", "Importance"],
        columns: [
            { data: "name" },
            { data: "weight", type: "numeric" }
        ],
        afterChange: function(changes) {
            updateAlternativesTable( decision );
            updateResultsTable( decision );
        }
    });
}

// updates alternatives table using values from a certain decision
function updateAlternativesTable( decision ) {
        var tableData = decision.alternatives.map( function(alt) {
        var ret = { id: alt.id, name: alt.name };
        decision.objectives.forEach( function(obj) {
            ret["rating_" + obj.id] = alt.ratingFor( obj );
        });
        return ret;
    });
    $('#altsTable').handsontable({
        data: tableData,
        colHeaders: [ 'Option Name' ].concat( decision.objectives.sort(objComp).map( function(obj) { return obj.name } ) ),
        columns: [ { data: "name" } ].concat( decision.objectives.sort(objComp).map(
            function(obj) {
                return { data: "rating_" + obj.id, type: "numeric" }
        })),
        afterChange: function(changes) {
            _.each(changes, function(change) {
                var row = change[0];
                var id = $('#altsTable').handsontable('getDataAtRow', row).id;
                var alt = decision.findAlterativeById(id);
                if (change[1].lastIndexOf("rating_") == 0) {
                    var obj = decision.findObjectiveById( parseInt(change[1].substring(7)) ); // TODO wow
                    alt.rate( obj, parseInt(change[3]) );
                } else {
                    alt[change[1]] = change[3];
                }
            });
            updateResultsTable( decision );
        }
    });
}
// updates results table using values from a certain decision
function updateResultsTable( decision ) {
    var tableData = [];
    _.each( decision.alternatives, function(alt) {
        var score = 0;
        _.each( decision.objectives, function(obj) {
            score += obj.weight * alt.ratingFor( obj );
        });
        tableData.push( [ score, alt.name ] );
    });

    tableData.sort( function(dat1, dat2) { return dat1[0] < dat2[0]; });
    $('#resTable').handsontable({
        data: tableData,
        colHeaders: [ "Score", "Option Name" ]
    });
}

function updateAllTables( decision ) {
    updateObjectivesTable(decision);
    updateAlternativesTable(decision);
    updateResultsTable(decision);
}

// decision list stuff
function addDecisionToList( decision ) {
    $('#decision_list').prepend(
        "<li id=\"" + decision.id +"\"><a href=\"#\" id=\""
        + decision.id +"\">" + decision.name + "</a></li>");
}

function updateDecisionListActive() {
    $('#decision_list .active').removeClass('active');
    $('#decision_list #' + currentDecisionIndex).addClass('active');
}

// Buttons and clicks
function bindAddObjectiveButton() {
    $('body').on('click', 'button[name=newObj]', function() {
        var currentDecision = decisions[ currentDecisionIndex ];
        currentDecision.addObjective();
        updateAllTables( currentDecision );
    });
}

function bindAddAlternativeButton() {
    $('body').on('click', 'button[name=newAlt]', function() {
        var currentDecision = decisions[ currentDecisionIndex ];
        currentDecision.addAlternative();
        updateAllTables( currentDecision );
    });
}

function bindDecisionListClick() {
    $('#decision_list').on( 'click', 'a', function(link) {
        var tid = link.target.id;
        if (tid === 'add') {
            addDecision();
        } else {
            currentDecisionIndex = parseInt( link.target.id );
            updateAllTables( decisions[currentDecisionIndex] );
            updateDecisionListActive();
        }
    });
}

// nasty
function buildDecisionFromData( data ) {
    var builtDecision = new decision( data.name );

    _.each( data.objectives, function(obj) {
        builtDecision.addObjective( obj.name, obj.weight );
        builtDecision.setObjectiveId( obj.name, obj.id );
    });

    _.each(data.alternatives, function(alt) {
        builtDecision.addAlternative( alt.name );
        builtDecision.setAlternativeId( alt.name, alt.id );
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

function handleData( data ) {
    var builtDecision = buildDecisionFromData( data );
    decisions.push( builtDecision );

    if (currentDecisionIndex === -1) {
        currentDecisionIndex = 0;
        updateAllTables( decisions[currentDecisionIndex] );
    }

    addDecisionToList( builtDecision );
    updateDecisionListActive();
}

function loadDefaultJSON( filename ) {
    $.getJSON(filename)
        .done(handleData)
        .fail(function( jqxhr, textStatus, error ) {
                var err = textStatus + ", " + error;
                    console.log( "Request Failed: " + err );
        });
}

function loadDefaults() {
    loadDefaultJSON( 'defaults/college.json' );
    loadDefaultJSON( 'defaults/job.json' );
}

$(document).ready(function () {
    loadDefaults();

    // register buttons
    bindAddObjectiveButton();
    bindAddAlternativeButton();
    bindDecisionListClick();
});
