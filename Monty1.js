// Monty1 - Bob Metcalfe's first try at Monty Hall Paradox

// Open log of game results
var Monty1Log = new Mongo.Collection("Monty1Log");

// Create router for HTML rendering
Router.route('/', function() {
  Router.go("/steps/1");
});

Router.route('/steps/:step', function() {
  this.render('step' + this.params.step);
});

// Client side code
if (Meteor.isClient) {

  Monty1Log.insert({
    "time": new Date().toUTCString()
  });

  function initialize() { // Start or restart
    Session.set("prizedoor", 0); // Where prize was hidden
    Session.set("chosendoor", 0); // Door first chosen by player (1,2,3)
    Session.set("emptydoor", 0); // Door opened by host to show empty
    Session.set("thirddoor", 0) // Door neither chosen nor opened
    Session.set("finaldoor", 0); // Door chosen finally by player
    Session.set("gamecount", 0); // Number of games played
    Session.set("wincount", 0); // Number of games=prizes won
    Session.set("doorcounts", [0, 0, 0]); // Number of times door # had prize
    Session.set("strategycounts", [0, 0, 0]); // Stick, switch, flip

    // Assign colors to door randomly for this game
    var list = ["button-color-1", "button-color-2", "button-color-3"]
    door1color = _.sample(list);
    list = _.filter(list, function(color) {
      return color != door1color;
    });
    door2color = _.sample(list);
    list = _.filter(list, function(color) {
      return color != door2color;
    });
    door3color = _.first(list);

    Session.set("door1color", door1color);
    Session.set("door2color", door2color);
    Session.set("door3color", door3color);

    Router.go("/steps/1");
  }

  initialize() // Start

  function globalregister(name) {
    Template.registerHelper(name, function() {
      return Session.get(name)
    })
  }

  globalregister("step");
  globalregister("prizedoor");
  globalregister("door1color");
  globalregister("door2color");
  globalregister("door3color");
  globalregister("chosendoor");
  globalregister("emptydoor");
  globalregister("thirddoor");
  globalregister("finaldoor");
  globalregister("gamecount");
  globalregister("wincount");
  globalregister("doorcounts");
  globalregister("strategycounts")

  function gotostep2(cd) {
    var pd = _.random(1, 3); // Host hides prize behind random door
    Session.set("prizedoor", pd);

    var dc = Session.get("doorcounts");
    var list = [1, 2, 3];
    var ed, td;

    dc[pd - 1] = dc[pd - 1] + 1; // Increment priz count of door with prize

    Session.set("doorcounts", dc);

    Session.set("chosendoor", cd);

    list = _.filter(list, function(door) {
      return door != pd && door != cd
    });

    ed = _.sample(list)
    Session.set("emptydoor", ed); // Door shown empty to player
    list = [1, 2, 3];
    td = _.filter(list, function(door) {
      return door != cd && door != ed
    });

    Session.set("thirddoor", _.first(td)); // Door neither chosen nor opened empty

    Router.go("/steps/2");
  }

  Template.step1.events({
    'click .door1class': function() {
      gotostep2(1);
    },
    'click .door2class': function() {
      gotostep2(2);
    },
    'click .door3class': function() {
      gotostep2(3);
    },
    'click .puntclass': function() {
      initialize();
    }
  })

  function gotostep3(fd) {
    var pd = Session.get("prizedoor");
    fd = Session.get(fd);
    Session.set("finaldoor", fd);

    Session.set("gamecount", Session.get("gamecount") + 1);
    if (fd === pd) {
      Session.set("wincount", Session.get("wincount") + 1)
    };

    Session.set("strategycounts", play1000()); // Run game 1000 times to check stats

    Router.go("/steps/3");
  }

  Template.step2.events({
    'click button.stickclass': function() {
      gotostep3("chosendoor")
    },
    'click button.switchclass': function() {
      gotostep3("thirddoor")
    },
    'click button.flipclass': function() {
      gotostep3(_.sample(["chosendoor", "thirddoor"]))
    },
    'click button.puntclass': function() {
      initialize();
    }
  })

  Template.step3.events({
    'click button.again': function() {
      Router.go("/steps/1");
    },
    'click button.restart': function() {
      initialize()
    }
  })

  function play1000() {
    var pd, cd, ed, td, fd, dc
    var fdst, fdsw, fdfl
    var stct = 0,
      swct = 0,
      flct = 0

    for (var i = 0; i < 100000; i++) {
      pd = _.random(1, 3)

      dc = Session.get("doorcounts"); // Count all random door selections
      dc[pd - 1] = dc[pd - 1] + 1; // Increment priz count of door with prize
      Session.set("doorcounts", dc);

      cd = 1
      ed = _.sample(_.without([1, 2, 3], pd, cd));
      td = _.first(_.without([1, 2, 3], cd, ed));
      fdst = cd
      fdsw = td
      fdfl = _.sample([cd, td])
      if (fdst == pd) ++stct
      if (fdsw == pd) ++swct
      if (fdfl == pd) ++flct
    }
    return [stct, swct, flct]
  }
}


// -----------------------------------------------------------------------

// Nothing on server yet
if (Meteor.isServer) {
  Meteor.startup(function() {
    // code to run on server at startup
  });
}
