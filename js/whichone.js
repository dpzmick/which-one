// global vars
var objCounter = 0;
var altCounter = 0;
var objectives = [];
var alternatives = [];

function objective( objName, objWeight ) {
    // set defaults
    objName = typeof objName !== 'undefined' ? objName : "New Objective";
    objWeight = typeof objWeight !== 'undefined' ? objWeight : 0;

    this.id = objCounter++;
    this.name = objName;
    this.weight = objWeight;
}

function alternative( altName ) {
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

// helper functions
function findObjectiveByName( name ) {
    return _.find( objectives, function(obj) { return obj.name === name } );
}

function findObjectiveById( id ) {
    return _.find( objectives, function(obj) { return obj.id === id } );
}

function findAlterativeById( id ) {
    return _.find( alternatives, function(alt) { return alt.id === id } );
}

function objComp(obj1, obj2) {
    return obj1.id > obj2.id;
}

// updates using global variable
function updateObjectivesTable() {
    $('#objectivesTable').handsontable({
        data: objectives,
        colHeaders: ["Name", "Importance"],
        columns: [
            { data: "name" },
            { data: "weight", type: "numeric" }
        ],
        afterChange: function(changes) {
            //_.each(changes, function(change) {
            //    var row = change[0];
            //    console.log(change[0]);
            //    var id = $("#altsTable").handsontable('getDataAtRow', row).id;
            //    var obj = findObjectiveById(id);
            //    obj[change[1]] = change[3];
            //});
            updateAlternativesTable();
            updateResultsTable();
        }
    });
}

function updateAlternativesTable() {
    tableData = _.map( objectives, function(obj) {
        return _.map( alternatives, function(alt) { return alt.ratingFor( obj ) } );
    });
    $('#altsTable').handsontable({
        data: tableData,
        colHeaders: _.pluck(alternatives, 'name' ),
        rowHeaders: _.pluck( objectives, 'name' ),
    });
}

function updateResultsTable() {
    var tableData = [];
    _.each( alternatives, function(alt) {
        var score = 0;
        _.each( objectives, function(obj) {
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

// Buttons
function bindAddObjectiveButton() {
    $('body').on('click', 'button[name=newObj]', function() {
        objectives.push( new objective() );
        updateObjectivesTable();
        updateAlternativesTable();
        updateResultsTable();
    });
}

// Defaults
function setDefaultObjectives() {
    objectives.push( new objective("Small Classes", 3) );
    objectives.push( new objective("Close to Home", 3) );
    objectives.push( new objective("Career Opportunity", 5) );
    objectives.push( new objective("Intellectual Growth", 5) );
    objectives.push( new objective("Cost", 3) );
}

function setDefaultAlternatives() {
    var a = new alternative( "UIUC" );
    a.rate( findObjectiveByName("Small Classes"), 2 );
    a.rate( findObjectiveByName("Close to Home"), 3 );
    a.rate( findObjectiveByName("Career Opportunity"), 5 );
    a.rate( findObjectiveByName("Intellectual Growth"), 4 );
    a.rate( findObjectiveByName("Cost"), 3 );
    alternatives.push( a );
    
    a = new alternative( "U of H" );
    a.rate( findObjectiveByName("Small Classes"), 3 );
    a.rate( findObjectiveByName("Close to Home"), 5 );
    a.rate( findObjectiveByName("Career Opportunity"), 2 );
    a.rate( findObjectiveByName("Intellectual Growth"), 3 );
    a.rate( findObjectiveByName("Cost"), 5 );
    alternatives.push( a );
}

$(document).ready(function () {
    setDefaultObjectives();
    setDefaultAlternatives();
    updateObjectivesTable();
    updateAlternativesTable();

    // register buttons
    bindAddObjectiveButton();
});

// TODO don't allow duplicate objectives
