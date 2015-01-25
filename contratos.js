Plantillas = new Mongo.Collection('Plantillas');
Contratos = new Mongo.Collection('Contratos');



if (Meteor.isClient) {
  Tracker.autorun(function () {
      Meteor.subscribe("Plantillas",Meteor.userId());
  Meteor.subscribe("Contratos",Meteor.userId());
    });
  

  Router.configure({
    layoutTemplate: 'baseLayout'
  });

  Router.route('/', function () {
    this.render('contratosTemplate');
    });

  Router.route('/contratos', function () {
    this.render('contratosTemplate');
  }, {name: 'contratos'});

  Router.route('/contratos/nuevo', function () {
    this.render('nuevoContrato');
  }, {name: 'contratos.nuevo'});


  Router.route('/plantillas', function () {
    this.render('plantillasTemplate');
  }, {name: 'plantillas'});

  Router.route('/plantillas/nueva', function () {
    this.render('nuevaPlantilla');
  }, {name: 'plantillas.nueva'});

  // counter starts at 0
  Session.setDefault('counter', 0);
  Session.setDefault('plantillaId', null);
  Session.setDefault('contratoId', null);
  Session.setDefault('editandoContrato', false);
  Session.setDefault('editandoPlantilla', false);


  Template.nuevaPlantilla.helpers({
    counter: function () {
      return Session.get('counter');
    }
  });

  Template.registerHelper('formatTemplate',function(contrato){
      var placeholder;
      var value;
      var plantilla=Plantillas.findOne({_id:contrato.template_id});
      var text=plantilla.text;
      var reg;
      for (var i = 0; i < contrato.values.length; i++) {
        placeholder = contrato.values[i].placeholder;
        value = contrato.values[i].value;
        console.log('placeholder: '+placeholder+', value:'+value);
        var text_array = text.split('%%'+placeholder+'%%');
        var newText = text_array.join(value);
        text=newText;
        console.log(newText);
      };
      return newText;
  });

  Template.registerHelper('isActiveRoute', function(route,root) {
    var value=false;
    if (root!=null) {
      value=Router.current().options.route._path == Router.routes[route]._path || Router.current().options.route._path == root;
    }else{
      value=Router.current().options.route._path == Router.routes[route]._path;
    };
    return value ? 'active':'';
  });

    Template.registerHelper('formatDate', function(date) {
    return moment(date).format('MM-DD-YYYY');
  });


  Template.nuevaPlantilla.events({
    'click button': function (event,template) {
      // increment the counter when button is clicked
      if (template.find('.text-area').value!="" && template.find('.name-text').value!="") {
      var myString = template.find('.text-area').value;
      var myName = template.find('.name-text').value;
      var myRegexp = /[%]{2}\w+[%]{2}/g;
      var match = myString.match(myRegexp);
      var wordReg = /\w+/g;
      var contratoId=Plantillas.insert({name:myName,text:myString, date:new Date(),user_id:Meteor.userId()});
      for (var i = 0; i < match.length; i++) {
        Plantillas.update({_id:contratoId},{$addToSet:{placeholders:{placeholder:match[i],name:match[i].match(wordReg)[0]}}});
      };
      Session.set('counter', Session.get('counter') + 1);
      template.find('.text-area').value="";
      Router.go('plantillas');
    }else{
      alert('Completa los campos.');
    };},
    'click .close-btn':function(event){
      Session.set('editandoPlantilla',false);
      Session.set('plantillaId',null);
    }
  });

  Template.plantillasTemplate.helpers({
    plantillas:function () {
      return Plantillas.find();
    }
  });
  Template.plantillasTemplate.events({
    'dblclick .del-btn':function(event){
      Plantillas.remove({_id:this._id});
    },
    'click .new-btn':function(event){
      Session.set('plantillaId',this._id);
      Session.set('editandoContrato',false);
      Router.go('contratos.nuevo');
    }
  });

  Template.contratosTemplate.helpers({
    contratos:function () {
      return Contratos.find();
    },
    contrato:function () {
      return Contratos.findOne({_id:Session.get('contratoId')});
    }
  });
  Template.contratosTemplate.events({
    'dblclick .del-btn':function(event){
      Contratos.remove({_id:this._id});
    },
    'click .see-btn':function(event){
      Session.set('contratoId',this._id);
    },
  });
  Template.nuevoContrato.helpers({
    plantilla:function(){
      return Plantillas.findOne({_id:Session.get('plantillaId')});
    },
    contrato:function () {
      return Contratos.findOne({_id:Session.get('contratoId')});
    }
  });
  Template.nuevoContrato.events({
    'submit .contrato-nuevo-forma':function(event,template){
      var plantilla=Plantillas.findOne({_id:Session.get('plantillaId')});
      var contratoID=Contratos.insert({name:template.find('#nombre-contrato').value,
        client:template.find('#cliente-contrato').value,
        date:new Date(),
        template_id:Session.get('plantillaId'),
        user_id:Meteor.userId()
      });
      for (var i = 0; i < plantilla.placeholders.length; i++) {
        var placeName=plantilla.placeholders[i].name;
        console.log(placeName);
        var elementID='#'+placeName;
          Contratos.update({_id:contratoID},{$addToSet:{values:{placeholder:placeName,value:template.find(elementID).value}}});
      };
      Router.go('contratos');
      return false;
    },
    'click .close-btn':function(event){
      Session.set('editandoContrato',false);
      Session.set('contratoId',null);
    }
  });

      Accounts.ui.config({
      passwordSignupFields: 'USERNAME_AND_EMAIL'
    });

  Template._loginButtonsLoggedInDropdown.events({
        'click #login-buttons-edit-profile': function(event) {
            event.stopPropagation();
            Template._loginButtons.toggleDropdown();
            Router.go('profileEdit');
        }
    });
  accountsUIBootstrap3.setLanguage('es'); 

}

if (Meteor.isServer) {

  Meteor.publish("Plantillas", function (user) {
    if (user!=null) {
      return Plantillas.find({user_id:user});
    }else{
      return null;
    };
  });

  Meteor.publish("Contratos", function (user) {
    if (user!=null) {
      return Contratos.find({user_id:user});
    }else{
      return null;
    };
    
  });

  Meteor.startup(function () {

  
  });
}