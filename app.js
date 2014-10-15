
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport=require('passport');
var LocalEstrategy=require('passport-local').Strategy;
var flash = require('connect-flash');
var moment = require('moment')
moment().localeData('es')
moment().format('dddd, MMMM Do YYYY, h:mm:ss a')



var app = express();

// all environments
app.set('port', process.env.PORT || 2811);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('8763hduir09374hbbcj39937'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


//database connection
// aqui se conecta la base de datos con mongoose, en el caso de la primera vez en ser corrida la aplicacion;
// valida si la base de datos con ese nombre existe en mongodb, si existe el toma todos la base de datos ya existente,
// si no existe el crea la base de datos y toma el modelado que se va a dar a continuacion.
mongoose.connect('mongodb://localhost/espsoft');

//database model
//a partir del modelo de la base de datos, creamos un modelo de objetos que sera interpretado por mongoose, y que se
//utilizara para la interaccion de los objetos.

var ProgramaSchema=new mongoose.Schema({
    nombre:String
});
Programa=mongoose.model('Programa', ProgramaSchema);

var PostgradoSchema= new mongoose.Schema({
    programa_id:String,
    tipo_postgrado:String,
    nombre:String,
    duracion:Number,
    modalidad:String,
    modo:String,
    dirigido:String,
    registro_cal:String,
    estado:Number
});
Postgrado=mongoose.model('Postgrado', PostgradoSchema);

var InscritoSchema=new mongoose.Schema({
    fecha_incripcion:Date,
    postgrado_id:String,
    datos_personales:String,
    comentario:String,
    estado:Number,
    fecha_pago:Date,
    concepto:String,
    valor:Number
});
Inscrito=mongoose.model('Inscrito', InscritoSchema);

var DirectorSchema=new mongoose.Schema({
    usuario:String,
    contrasena:String,
    programa_id:String,
    datos_personales:String,
    privilegio:Number,
    primeravez:Number
});
Director=mongoose.model('Director', DirectorSchema);

var EstudianteSchema=new mongoose.Schema({
    codigo:String,
    cohorte:String,
    datos_personales:String,
    modalidad:String
});
Estudiante=mongoose.model('Estudiante', EstudianteSchema);

var DatosFinancierosSchema=new mongoose.Schema({
    estudiante_id:String,
    fecha_pago:Date,
    concepto:String,
    valor:Number
});
DatoFinanciero=mongoose.model('DatoFinanciero', DatosFinancierosSchema);

var ProfesorSchema=new mongoose.Schema({
    codigo:String,
    contrasena:String,
    datos_personales:String,
    programa_id:String
});
Profesor=mongoose.model('Profesor', ProfesorSchema);

var DatoAcademicoSchema=new mongoose.Schema({
    titulo:String,
    universidad:String,
    Profesor_id:String
});
DatoAcademico=mongoose.model('DatoAcademico', DatoAcademicoSchema);

var DatosPersonalesSchema=new mongoose.Schema({
    tipo_documento:String,
    documento:String,
    nombres:String,
    apellidos:String,
    email:String,
    telefono:Number
});
DatosPersonales=mongoose.model('DatosPersonales', DatosPersonalesSchema);

var CohorteSchema=new mongoose.Schema({
    resolucion:String,
    nombre:String,
    postgrado_id:String,
    pensum_id:String,
    fecha_inicio_insc:Date,
    fecha_limite_insc:Date,
    fecha_entrevista:Date,
    fecha_resultados:Date,
    fecha_matricula:Date,
    fecha_introduccion:Date,
    fecha_receso:Date,
    fecha_termina_clase:Date,
    valor:Number,
    otros:Number,
    nivel:Number,
    link:String
});
Cohorte=mongoose.model('Cohorte', CohorteSchema);

var PensumSchema=new mongoose.Schema({
    postgrado_id:String,
    nombre:String,
    fecha:Date,
    resolucion:String,
    status:Number
});
Pensum=mongoose.model('Pensum', PensumSchema);

var AsignaturaSchema=new mongoose.Schema({
    pensum_id:String,
    nombre:String,
    nivel:Number,
    cradito:Number,
    electiva:Boolean,
    modo:String,
    profesor_id:String,
    material_url:String
});
Asignatura=mongoose.model('Asignatura', AsignaturaSchema);

var HorarioSchema=new mongoose.Schema({
    asignatura_id:String,
    dia:String,
    hora_inicia:String,
    duracion:String,
    Lugar:String
});
Horario=mongoose.model('Horario', HorarioSchema);

var NotaSchema=new mongoose.Schema({
    estudiante_id:String,
    asignatura_id:String,
    nota:Number
});
Nota=mongoose.model('Nota', NotaSchema);




// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);


// LOGIN
app.get('/login', function(req, res){
    var x=req.flash('error')
    if(x[0] == 1 || x[0] == 2){
        res.render('loginAdmin', {error:x[0]})
    }else{
        res.render('loginAdmin')
    }
});
app.get('/loginAdmin', function(req, res){
    var x=req.flash('error')
    if(x[0] == 1 || x[0] == 2){
        res.render('loginAdministrador', {error:x[0]})
    }else{
        res.render('loginAdministrador')
    }
});

passport.use('Directores', new LocalEstrategy(
    {
        usernameField: 'usuario',
        passwordField: 'contrasena'
    },
    function(usuario, contrasena, done) {
        console.log('entro por director')
        Director.findOne({ usuario: usuario }, function(err, dir) {
            if (err) { return done(err); }
            if (!dir) {
                return done(null, false, { message: '1'});
            }
            if (validPass(dir, contrasena)==false) {
                return done(null, false, { message: '2'});
            }
            return done(null, dir);
        });
    }
));
passport.use('Administrador', new LocalEstrategy(
    {
        usernameField: 'usuario',
        passwordField: 'contrasena'
    },
    function(usuario, contrasena, done) {
        console.log('entro por administrador')
        Director.findOne({ usuario: usuario }, function(err, dir) {
            if (err) { return done(err); }
            if (!dir) {
                return done(null, false, { message: '1'});
            }
            if (validAdministrador(dir, contrasena)==false) {
                return done(null, false, { message: '2'});
            }
            return done(null, dir);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Director.findById(id, function(err, user) {
        done(err, user);
    });
});

app.post('/login',
    passport.authenticate('Directores', { successRedirect: '/director/profile',
        failureRedirect: '/login',
        failureFlash: true })
);

app.post('/loginAd',
    passport.authenticate('Administrador', { successRedirect: '/administrador/profile',
        failureRedirect: '/loginAdmin',
        failureFlash: true })
);

function validPass(d, p){
    if(d.privilegio==2){
        return false
    }
    if(d.contrasena!==p){
        return false
    }
    return true;
}

function validAdministrador(d, p){
    if(d.privilegio==1 && d.contrasena==p){
        return true
    }
    return false;

}

function isLoggedIn(req, res, next){
    if(req.isAuthenticated('Director')){
        return next();
    }
    res.redirect('/login');
}
function isLoggedInAdmin(req, res, next){
    if(req.isAuthenticated('Administrador')){
        return next();
    }
    res.redirect('/loginAdmin');
}

//END LOGIN

// LOGOUT

app.get('/logOut', function(req, res){
    req.logOut();
    res.redirect('/login');
});
app.get('/logOutAdmin', function(req, res){
    req.logOut();
    res.redirect('/loginAdmin');
});

// END LOGOUT

// APP CALLS

// DIRECTOR


//home
app.get('/director/profile', isLoggedIn, function(req, res){
    if(req.user.primeravez!==1){
        DatosPersonales.findOne({_id:req.user.datos_personales}, function(err, datos){
            Programa.findOne({_id:req.user.programa_id}, function(err, programa){
                Postgrado.find({programa_id:programa.id}, function(err, postgrados){
                    Postgrado.count({programa_id:programa.id}, function(err, num){
                        res.render('director/profile', {user:req.user, datos:datos, programa:programa, postgrados:postgrados, numpostgrados:num})
                    });
                });
            });
        });
    }else{
        res.redirect('/director/firstime');
    }
});
//update pass
app.put('/director/firstime', isLoggedIn, function(req, res){
    var b=req.body;
    Director.update(
        {_id: b.director},
        {
            contrasena: b.pass,
            primeravez:0
        },
        function(err){
            if(err) res.json(err)
            res.redirect('/director/profile')
        }
    );
});
app.put('/director/changepass', isLoggedInAdmin, function(req, res){
    var b=req.body;
    switch(b.action){
        case '1':
            DatosPersonales.update(
                {_id: b.datopersonal},
                {
                    tipo_documento: b.tipodoc,
                    documento: b.documento,
                    nombres: b.nombres,
                    apellidos: b.apellidos,
                    email: b.email,
                    telefono: b.telefono
                },
                function(err){
                    if(err) res.json(err)
                    res.redirect('/director/edit/'+ b.director+'/'+ b.datos)
                }
            );
            break
        case '2':
            Director.update(
                {_id: b.director},
                {
                    contrasena: b.pass,
                    primeravez:1
                },
                function(err){
                    if(err) res.json(err)
                    res.redirect('/director/edit/'+ b.director+'/'+ b.datos)
                }
            );

    }
});

app.get('/director/firstime', isLoggedIn, function(req, res){
    DatosPersonales.findOne({_id:req.user.datos_personales}, function(err, datos){
        res.render('director/firstime', {user:req.user, datos:datos});
    });

});
app.get('/director/changepass/:id/:datosper', isLoggedInAdmin, function(req, res){
    res.render('director/changepass', {director:req.director, datos:req.datospersonales})
});


// director options
app.get('/director/:id/assign', isLoggedInAdmin, function(req, res){
    res.render('director/asignDirector', {programa:req.programa})
});

// create
app.get('/director/:id/create', isLoggedInAdmin, function(req, res){
    res.render('director/create', {programa:req.programa})

});

function ifDirector(p){
    Director.findOne({programa_id:p}, function(err, d){
        if(d!=null){
            Director.update(
                {_id: d.id},
                {
                    programa_id:null,
                    privilegio:2
                }
            );
            return;
        }
    });
}
app.post('/director/create', function(req, res){
    var b=req.body;
    ifDirector(b.programa);
    DatosPersonales.findOne({documento: b.numdoc}, function(err, persona){
        if(!persona){
            new DatosPersonales({
                tipo_documento: b.tipodoc,
                documento: b.numdoc,
                nombres: b.nombres,
                apellidos: b.apellidos,
                email: b.email,
                telefono: b.telefono
            }).save(function(err, dato){
                    if(err) res.json(err)
                    new Director({
                        usuario: dato.email,
                        contrasena: dato.documento,
                        programa_id: b.programa,
                        datos_personales:dato.id,
                        privilegio:0,
                        primeravez:1

                    }).save(function(err, director){
                            if(err) res.json(err)
                            res.redirect('/programa/'+ b.programa+'/view');
                        });
                });
        }else{
            new Director({
                usuario: persona.email,
                contrasena: persona.documento,
                programa_id: b.programa,
                datos_personales:persona.id,
                privilegio:0,
                primeravez:1

            }).save(function(err, director){
                    if(err) res.json(err)
                    res.redirect('/programa/'+ b.programa+'/view');
                });
        }
    });

});
app.param('id', function(req, res, next, id){
    Director.findOne({_id:id}, function(err, director){
        req.director=director;
        next();
    });
});
app.param('datosper', function(req, res, next, id){
    DatosPersonales.findOne({_id:id}, function(err, datos){
        req.datospersonales=datos;
        next();
    });
});
// edit director
app.get('/director/edit/:id/:datosper', isLoggedInAdmin, function(req, res){
    Programa.findOne({_id:req.director.programa_id}, function(err, programa){
        res.render('director/edit', {director:req.director, datos:req.datospersonales, programa:programa})
    });
});

// select
app.get('/director/select/:id', isLoggedInAdmin, function(req, res){
    Director.count({privilegio:2}, function(err, directorsCount){
        if(directorsCount > 0){
            Director.find({privilegio:2}, function(err, directores){
                var ids=new Array();
                var all=new Array();

                for(i=0; directorsCount > i; i++){
                    ids.push(directores[i].datos_personales)
                }

                DatosPersonales.find({_id : {$in : ids}}, function(err, results){
                    if(err) res.json(err)
                    for(i=0; results.length > i; i++){
                        for(j=0; directorsCount > j; j++){
                            if(results[i].id == directores[j].datos_personales){
                                var a=Array();
                                a['id']=directores[j].id;
                                a['nombre']=results[i].nombres +' '+ results[i].apellidos
                                all.push(a)
                                break;
                            }
                        }
                    }
                    res.render('director/select', {programa:req.programa, directorscount:directorsCount, directores:all});
                });

            });
        }else{
            res.render('director/select', {programa:req.programa, directorscount:directorsCount})
        }

    });
});
app.post('/director/select', isLoggedInAdmin, function(req, res){
    var b=req.body
    Director.update(
        {_id: b.director},
        {
            programa_id: b.programa,
            privilegio:0
        },
        function(err){
            if(err) res.json(err)
            res.redirect('/programa/'+ b.programa +'/view')
        }
    );
});

// END DIRECTOR

// -- Programas --
// index
app.get('/programa', function(req, res){
    var query=Programa.find({});
    query.sort('nombre');
    query.exec(function(err, docs){
        res.render('programa/index', {programas:docs})

    });
});

// new and create
app.get('/programa/new', function(req, res){
    res.render('programa/new')
});
app.post('/programa', function(req, res){
    var b=req.body;

    //experiment code
    Programa.count({nombre: b.nombre}, function(err, programaCount){
       if(programaCount > 0){
           res.render('programa/error', {nombre: b.nombre});
       }else{
           new Programa({
               nombre: b.nombre
           }).save(function(err, programa){
                   if(err) res.json(err);
                   res.redirect('/programa/'+programa._id+'/view');
               })
       }
    });
    // end experiment code
});
app.param('id', function(req, res, next, id){
    Programa.findOne({_id:id}, function(err, Programa){
        req.programa=Programa;
        next();
    });
});

// show
app.get('/programa/:id', function(req, res){

    Postgrado.find({programa_id:req.programa.id}, function(err, docs){
        Director.findOne({programa_id:req.programa.id}, function(err, director){
            if(!director) director=false;
            DatosPersonales.findOne({_id:director.datos_personales}, function(err, dato){
                res.render('programa/show', {postgrados:docs, programa:req.programa, director:director, datos:dato});
            })
        })

    });
});

app.get('/programa/:id/view', isLoggedInAdmin, function(req, res){
    Postgrado.count({programa_id:req.programa.id}, function(err, postgradosCount){
        Postgrado.find({programa_id:req.programa.id}, function(err, postgrados){
            Director.count({programa_id:req.programa.id}, function(err, directorCount){
                if(directorCount > 0){
                    Director.findOne({programa_id:req.programa.id}, function(err, director){
                        DatosPersonales.findOne({_id:director.datos_personales}, function(err, datos){
                            res.render('programa/view', {postgradocount:postgradosCount, postgrados:postgrados, directorcount:directorCount, director:director, datos:datos, programa:req.programa})
                        });
                    });
                }else{
                    res.render('programa/view', {postgradocount:postgradosCount, postgrados:postgrados, directorcount:directorCount, programa:req.programa})

                }
            });
        });
    });
});

// edit
app.get('/programa/:id/edit', function(req, res){
    res.render('programa/edit', {programa:req.programa})
});
//update
app.put('/programa/:id', function(req, res){
    var b=req.body;
    Programa.update(
        {_id:req.params.id},
        {nombre: b.nombre},
        function(err){
            res.redirect('/programa/'+ b.id)
        }
    );
});

// delete programa
app.get('/programa/delete/:id', function(req, res){
    Director.count({programa_id:req.programa.id}, function(err, directorCount){
        if(directorCount == 1){
            Director.update(
                {programa_id:req.programa.id},
                {
                    programa_id:null,
                    privilegio:2
                },
                function(err){
                    if(err) res.json(err)
                }
            );

        }
        Programa.remove(
            {_id:req.programa.id},
            function(err){
                if(err) res.json(err)
                res.redirect('/administrador/profile');
            }
        );


    });
});

// error page
app.get('/programa/error', function(req, res){
    res.render('programa/error')
});
// -- end programas --

// -- Postgrados --

//new
app.get('/postgrado/:id/new', isLoggedIn, function(req, res){
    res.render('postgrado/new', {programa:req.programa})
});
app.post('/postgrado/newlinfo', isLoggedIn, function(req, res){
    var b=req.body;
    res.render('postgrado/newlinfo', {programaid: b.id, programa: b.programa, tipo: b.tipo, nombre: b.nombre, modo: b.modo})
});
app.post('/postgrado/create', isLoggedIn, function(req, res){
    var b=req.body
    Postgrado.findOne({programa_id: b.id, nombre: b.nombrepost}, function(err, doc){
        if(doc){
            res.render('postgrado/error', {programa: b.id, nombrepost: b.nombrepost})
        }else{
            var modo;
            if(b.tipo=='Máestria'){
                modo= b.modo
            }else{
                modo=''
            }
            console.log(modo)
            new Postgrado({
                programa_id: b.id,
                tipo_postgrado: b.tipo,
                nombre: b.nombrepost,
                duracion: b.duracion,
                modalidad: b.modalidad,
                modo: modo,
                dirigido: b.leyenda,
                registro_cal: b.regiscal,
                estado:0
            }).save(function(err, postgrado){
                    if(err) res.json(err)
                    res.redirect('/postgrado/'+postgrado.id)
                });
        }

    })

});
app.param('id', function(req, res, next, id){
    Postgrado.findOne({_id:id}, function(err, Postgrado){
        req.postgrado=Postgrado;
        next();
    });
});
//show
app.get('/postgrado/:id', isLoggedIn, function(req, res){
    Programa.findOne({_id:req.postgrado.programa_id}, function(err, programa){
        Pensum.find({postgrado_id:req.postgrado.id}, function(err, pen){
            Cohorte.find({postgrado_id:req.postgrado.id}, function(err, co){
                Inscrito.find({postgrado_id:req.postgrado.id}, function(err, inscritos){
                    var ids=new Array();
                    for(i=0; co.length > i; i++){
                        ids.push(co[i].id)
                    }
                    Estudiante.count({cohorte: {$in: ids}}, function(err, num){
                        if(inscritos.length > 0){
                            var ids=new Array();
                            var all=new Array();
                            for(i=0; inscritos.length > i; i++){
                                ids.push(inscritos[i].datos_personales)
                            }
                            DatosPersonales.find({_id : {$in : ids}}, function(err, datos){

                                for(i=0; inscritos.length > i; i++){
                                    for(j=0; datos.length > j; j++){
                                        if(inscritos[i].datos_personales == datos[j].id){
                                            var a=new Array();
                                            a['id']=inscritos[i].id
                                            a['nombre']=datos[j].nombres +' '+ datos[j].apellidos
                                            a['fecha']=inscritos[i].fecha_incripcion
                                            a['estado']=inscritos[i].estado
                                            all.push(a)
                                            break;
                                        }
                                    }
                                }
                                Pensum.findOne({postgrado_id:req.postgrado.id, status:1}, function(err, validPensum){
                                    res.render('postgrado/show', {postgrado:req.postgrado, programa:programa, pensums:pen, cohortes:co, inscritos:all, numcoh:co.length, numpen:pen.length, numpre:inscritos.length, numes:num, validpensum:validPensum, datenow:new Date()});
                                });


                            });

                        }else{
                            Pensum.findOne({postgrado_id:req.postgrado.id, status:1}, function(err, validPensum){
                                res.render('postgrado/show', {postgrado:req.postgrado, programa:programa, pensums:pen, cohortes:co, inscritos:all, numcoh:co.length, numpen:pen.length, numpre:inscritos.length, numes:num, validpensum:validPensum, datenow:new Date()});
                            });
                        }
                    });


                });

            });

        });
    });
});

//edit
app.get('/postgrado/:id/edit', isLoggedIn, function(req, res){
    res.render('postgrado/edit', {postgrado:req.postgrado});
});
app.put('/postgrado/:id', function(req, res){
    var b=req.body;
    Postgrado.count({nombre: b.nombre}, function(err, postgradosCount){
        if(postgradosCount == 0){
            Postgrado.update(
                {_id:b.id},
                {tipo_postgrado: b.tipo, nombre: b.nombre, duracion: b.duracion, modalidad: b.modalidad, modo: b.modo, dirigido: b.leyenda, registro_cal: b.regiscal},
                function(err){
                    res.redirect('/postgrado/'+ b.id);
                }
            );
        }else{
            res.redirect('/postgrado/error')
        }
    });
});

app.get('/postgrado/delete/:id',isLoggedIn, function(req, res){
    Cohorte.count({postgrado_id:req.postgrado.id}, function(err, cohortesCount){
        if(cohortesCount == 0){
            Pensum.find({postgrado_id:req.postgrado.id}, function(err, pensums){
                pensums.forEach(deletePensum);
                Inscrito.remove(
                    {postgrado_id:req.postgrado.id},
                    function(err){
                        if(err) res.json(err)
                        Postgrado.remove(
                            {_id:req.postgrado.id},
                            function(err){
                                if(err) res.json(err)
                                res.redirect('/director/profile')
                            }
                        );
                    }
                );

            });
        }
    });
});

function deletePensum(e, i, a){
    Asignatura.remove(
        {pensum_id: e.id},
        function(err){
            if(err) res.json(err)
            Pensum.remove(
                {_id: e.id},
                function(err){
                    if(err) res.json(err)
                }
            );
        }
    );
}


// reporte de postgrados
app.param('programa', function(req, res, next, id){
    Programa.findOne({_id:id}, function(err, programa){
        req.programa=programa;
        next();
    });
});
app.param('postgrado', function(req, res, next, id){
    Postgrado.findOne({_id:id}, function(err, postgrado){
        req.postgrado=postgrado;
        next();
    });
});

app.get('/postgrado/report/:postgrado/:programa', isLoggedInAdmin, function(req, res){
    var date=new Date();
    console.log(date.toISOString().slice(0, 10));
    Cohorte.count({postgrado_id:req.postgrado.id}, function(err, cohortesCount){
        if(cohortesCount > 0){
            Cohorte.find({postgrado_id:req.postgrado.id}, function(err, cohortes){
                var cohortesId=new Array();
                for(i=0; cohortesCount > i; i++){
                    cohortesId.push(cohortes[i].id)
                }
                Estudiante.count({cohorte: {$in : cohortesId}}, function(err, estudiantesCount){
                    if(estudiantesCount > 0){
                        Estudiante.find({cohorte: {$in : cohortesId}}, function(err, estudiantes){
                            var estudiantesId=new Array();
                            for(j=0; estudiantesCount > j; j++){
                                estudiantesId.push(estudiantes[j].datos_personales)
                            }
                            DatosPersonales.find({_id: {$in : estudiantesId}}, function(err, datos){
                                var cohortePackage=new Array();
                                for(a=0; cohortesCount > a; a++){
                                    var cohorteNow=cohortes[a];
                                    var cohorte={cohorte:cohorteNow, estudiantes:new Array()}
                                    for(b=0; estudiantesCount > b; b++){
                                        var estudianteNow=estudiantes[b];
                                        var estudiante={estudiante:null, datos:null}
                                        if(estudianteNow.cohorte == cohorteNow.id){
                                            for(c=0; datos.length > c; c++){
                                                var datoNow=datos[c];
                                                if(estudianteNow.datos_personales == datoNow.id){
                                                    estudiante.estudiante=estudianteNow
                                                    estudiante.datos=datoNow
                                                    cohorte.estudiantes.push(estudiante)
                                                    //estudiantePackage.push(estudiante)
                                                    break;
                                                }

                                            }
                                        }
                                    }
                                    //cohorte.estudiantes=estudiantePackage
                                    cohortePackage.push(cohorte)
                                }
                                res.render('postgrado/report', {programa:req.programa, postgrado:req.postgrado, cohortescount:cohortesCount, cohortes:cohortePackage, estudiantescount:estudiantesCount});
                            });
                        });
                    }
                });

            });
        }else{
            res.render('postgrado/report', {programa:req.programa, postgrado:req.postgrado, cohortescount:cohortesCount});
        }
    });
});



// -- end postgrado --

// -- pensum --

//new
app.get('/pensum/:id/new', isLoggedIn, function(req, res){
    Programa.findOne({_id:req.postgrado.programa_id}, function(err, doc){
        res.render('pensum/new', {postgrado:req.postgrado, programa:doc});
    });
});

//create
app.post('/pensum/create', isLoggedIn, function(req, res){
    var b=req.body;
    Pensum.findOne({nombre: b.nombre, postgrado_id: b.postgradoid}, function(err, doc){
        if(doc){
            res.render('pensum/error', {postgrado: b.postgradoid, message:'ADVERTENCIA: En el sistema ya se encuentra registrado un pensum con el nombre:', tnombre: b.nombre})
        }else{
            new Pensum({
                postgrado_id: b.postgradoid,
                nombre: b.nombre,
                fecha: b.fecha,
                resolucion: b.resolucion,
                status:0
            }).save(function(err, pensum){
                    res.redirect('/pensum/'+pensum.id);
                });
        }
    })

});
app.param('id', function(req, res, next, id){
    Pensum.findOne({_id:id}, function(err, pensum){
        req.pensum=pensum;
        next();
    });
});
app.param('pensum', function(req, res, next, id){
    Pensum.findOne({_id:id}, function(err, pensum){
        req.pensum=pensum;
        next();
    });
});
//show
app.get('/pensum/shownext/:id', isLoggedIn, function(req, res){
    var pos;
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, doc){
        pos=doc;
        Programa.findOne({_id:pos.programa_id}, function(err, pro){
            res.render('pensum/shownext', {pensum:req.pensum, postgrado:pos, programa:pro});
        });
    });
});

app.get('/pensum/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, postgrado){
        Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
            var query=Asignatura.find({pensum_id:req.pensum.id});
            query.sort({nivel:1});
            query.exec(
                function(err, materias) {
                    Asignatura.count({pensum_id: req.pensum.id}, function (err, materiasnum) {
                        Asignatura.findOne({pensum_id: req.pensum.id}, {nivel: 1}, {sort: {nivel: -1}}, function (err, maxnivel) {
                            res.render('pensum/show', {programa: programa, postgrado: postgrado, pensum: req.pensum, asignaturas: materias, num: materiasnum, maxnivel: maxnivel});
                        });

                    })
                }
            );

        });
    });

});

// edit

app.get('/pensum/edit/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, postgrado) {
        Programa.findOne({_id: postgrado.programa_id}, function (err, programa) {
            res.render('pensum/edit', {programa:programa, postgrado:postgrado, pensum:req.pensum})
        });
    });
});

app.put('/pensum/edit', isLoggedIn, function(req, res){
    var b=req.body;

    switch(b.accion){
        case '1':
            Pensum.update(
                {_id: b.id},
                {
                    nombre: b.nombre,
                    resolucion: b.resolucion
                },
                function(err){
                    if(err) res.json(err)
                    res.redirect('/pensum/edit/'+ b.id);
                }
            );
            break;
        case '2':
            Asignatura.count({pensum_id: b.pensum}, function(err, materiasCount){
                if(materiasCount == 0){
                    res.render('pensum/error', {postgrado: b.postgrado, message:'ADVERTENCIA: No se puede cambiar el estado del pensum a seguro por que se encintro que no existen materias asociadas a este pensum. lo que no permite la accion que desea hacer', tnombre: ''})
                }else{
                    Pensum.update(
                        {_id: b.pensum},
                        {
                            status:1
                        },
                        function(err){
                            if(err) res.json(err)
                            res.redirect('/pensum/'+ b.pensum);
                        }
                    );
                }

            });
            break;
    }
});

// delete
app.get('/pensum/delete/:id', isLoggedIn, function(req, res){
    Asignatura.remove(
        {pensum_id:req.pensum.id},
        function(err){
            if(err) res.json(err)
            Pensum.remove(
                {_id:req.pensum.id},
                function(err){
                    if(err) res.json(err)
                    res.redirect('/postgrado/'+req.pensum.postgrado_id)
                }
            );
        }
    );
});

// -- end pensum --

// -- asignaturas --

app.get('/asignatura/new/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, postgrado){
        Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
            var maestria=false
            if(postgrado.tipo_postgrado == 'Máestria') maestria=true
            res.render('asignatura/new', {pensum:req.pensum, postgrado:postgrado, programa:programa, maestria:maestria});
        });
    });
});
app.get('/asignatura/newelectiva/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, postgrado){
        Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
            var maestria=false
            if(postgrado.tipo_postgrado == 'Máestria') maestria=true
            res.render('asignatura/newElectiva', {pensum:req.pensum, postgrado:postgrado, programa:programa, maestria:maestria});
        });
    });
});

// create

app.post('/asignatura/timetable', isLoggedIn, function(req, res){
    var b=req.body;
    res.render('asignatura/timetable', {programa: b.programa, postgrado: b.postgrado, pensumid: b.pensumid, pensumn: b.pensumnom, nombre: b.nombre, nivel: b.nivel, creditos: b.credito});
});
app.post('/asignatura/create/:pensum', function(req, res){
    var b=req.body;
    Postgrado.findOne({_id:req.pensum.postgrado_id}, function(err, postgrado){
        var modalidad=''
        if(postgrado.tipo_postgrado == 'Máestria'){
            if(b.electiva == 'true'){
                modalidad= b.modalidad
            }
        }
        Asignatura.findOne({nombre: b.nombre, pensum_id: b.pensumid}, function(err, doc){
            if(doc){
                res.render('asignatura/error', {pensum: b.pensumid})
            }else{
                new Asignatura({
                    pensum_id: b.pensumid,
                    nombre: b.nombre,
                    nivel: b.nivel,
                    cradito: b.creditos,
                    electiva: b.electiva,
                    modo: modalidad,
                    profesor_id:'',
                    material_url:''
                }).save(function(err, asignatura){
                        if(err) res.json(err)
                        // addtime(asignatura.id, b)
                        res.redirect('/asignatura/'+asignatura.id)
                    });
            }
        });
    });


});
app.param('id', function(req, res, next, id){
    Asignatura.findOne({_id:id}, function(err, asignatura){
        req.asignatura=asignatura;
        next();
    });
});
app.param(':asignatura', function(req, res, next, id){
    Asignatura.findOne({_id:id}, function(err, asignatura){
        req.asignatura=asignatura;
        next();
    });
});

//show
app.get('/asignatura/:id', isLoggedIn, function(req, res){
    Pensum.findOne({_id:req.asignatura.pensum_id}, function(err, pensum){
        Postgrado.findOne({_id:pensum.postgrado_id}, function(err, post){
            Programa.findOne({_id:post.programa_id}, function(err, pro){
                Horario.find({asignatura_id:req.asignatura.id}, function(err, docs){
                    Horario.count({asignatura_id:req.asignatura.id}, function(err, horariosNum){
                        if(req.asignatura.profesor_id.length > 0){
                            Profesor.findOne({_id:req.asignatura.profesor_id}, function(err, docente){

                                DatosPersonales.findOne({_id:docente.datos_personales}, function(err, dp){
                                    console.log(req.asignatura)
                                    res.render('asignatura/show', {asignatura:req.asignatura, horarios:docs, pensum:pensum, postgrado:post, programa:pro, docente:docente, datos:dp, horariosnum:horariosNum})
                                });
                            });
                        }else{
                            res.render('asignatura/show', {asignatura:req.asignatura, horarios:docs, pensum:pensum, postgrado:post, programa:pro, horariosnum:horariosNum})
                        }
                    });

                });
            });
        });
    });
});

//edit
app.get('/asignatura/:id/edit', isLoggedIn, function(req, res){
    Pensum.findOne({_id:req.asignatura.pensum_id}, function(err, pensum){
        Postgrado.findOne({_id:pensum.postgrado_id}, function(err, post){
            Programa.findOne({_id:post.programa_id}, function(err, pro){
                res.render('asignatura/edit', {asignatura:req.asignatura, pensum:pensum, postgrado:post, programa:pro})
            });
        });
    });
});
app.put('/asignatura/edit', function(req, res){
    var b=req.body;
    Asignatura.update(
        {_id: b.id},
        {nombre: b.nombre, nivel: b.nivel, cradito: b.credito, material_url: b.material},
        function(err){
            if(err) res.json(err)
            res.redirect('/asignatura/'+ b.id);
        }
    );
});

// delete
app.get('/asignatura/delete/:id', isLoggedIn, function(req, res){
    Asignatura.remove(
        {_id:req.asignatura.id},
        function(err){
            if(err) res.json(err)
            res.redirect('/pensum/'+req.asignatura.pensum_id);
        }
    );
});


// electives

app.get('/asignatura/:estudiante/elective', isLoggedIn, function(req, res){
    Cohorte.findOne({_id:req.estudiante.cohorte}, function(err, cohorte){
        Postgrado.findOne({_id:cohorte.postgrado_id}, function(err, postgrado){
            Pensum.findOne({_id:cohorte.pensum_id}, function(err, pensum){
                Nota.find({estudiante_id:req.estudiante.id}, function(err, matriculadas){
                    var ids=new Array()
                    for(i=0; matriculadas.length > i; i++){
                        ids.push(matriculadas[i].asignatura_id)
                    }
                    Asignatura.findOne({_id: {$in : ids}}, {nivel:1}, {sort:{nivel:-1}}, function(err, max){
                        console.log(ids)
                        if(postgrado.modo == 'Mixta'){
                            Asignatura.find({_id: {$nin: ids},pensum_id:pensum.id, electiva:true, modo:req.estudiante.modalidad, nivel:max.nivel}, function(err, electivas){
                                console.log(electivas)
                                res.render('asignatura/electiveAsign', {cohorte:cohorte, postgrado:postgrado, estudiante:req.estudiante, pensum:pensum, electivas:electivas, electivascount:electivas.length})
                            });
                        }else{
                            Asignatura.find({pensum_id:pensum.id, electiva:true, nivel:max.nivel}, function(err, electivas){
                                res.render('asignatura/electiveAsign', {cohorte:cohorte, postgrado:postgrado, estudiante:req.estudiante, pensum:pensum, electivas:electivas, electivascount:electivas.length})
                            });
                        }
                    });
                });
            });
        });
    });
});
app.post('/asignatura/asign', isLoggedIn, function(req, res){
    var b=req.body
    new Nota(
        {
            estudiante_id: b.estudiante,
            asignatura_id: b.electiva,
            nota:''
        }
    ).save(function(err, nota){
            res.redirect('/estudiante/'+ b.estudiante)
        });
});

//remove matriculada
app.get('/asignatura/remove/:asignatura/:estudiante', isLoggedIn, function(req, res){
    Nota.remove(
        {
            estudiante_id:req.estudiante.id,
            asignatura_id:req.asignatura.id

        },
        function(err){
            if(err) res.json(err)
            res.redirect('/estudiante/'+req.estudiante.id)
        }
    );
});
// -- end asignaturas --

// -- horario --
var diasa=new Array('Lunes','Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo');
var horasa=new Array('00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00');
// edit
app.get('/horario/edit/:id/:asig', isLoggedIn, function(req, res){
    res.render('horario/edit', {dias:diasa, horas:horasa, horario:req.horario, asignatura:req.asig});
});
app.param('id', function(req, res, next, id){
    Horario.findOne({_id:id}, function(err, horario){
        req.horario=horario;
        next();
    });
});
app.put('/horario/edit', function(req, res){
    var b=req.body;
    Horario.update(
        {_id: b.horario},
        {dia: b.dia, hora_inicia: b.hora, duracion: b.duracion, Lugar: b.lugar},
        function(err){
            res.redirect('/asignatura/'+ b.asignatura)
        });
});

// new
app.get('/horario/new/:id', isLoggedIn, function(req, res){
    res.render('horario/new', {asignatura:req.asignatura, dias:diasa, horas:horasa});
});
app.post('/horario/create', isLoggedIn, function(req, res){
    var b=req.body;
    addtimeSingle(b.asignatura, b);
    res.redirect('/asignatura/'+ b.asignatura);
});

// delete
app.get('/horario/:id/delete', isLoggedIn, function(req, res){
    var a=req.horario.asignatura_id;
    Horario.remove({_id:req.horario.id}, function(err){
        if(err) res.json(err)
        res.redirect('/asignatura/'+ a);
    });
});

// -- end horario --


// -- cohorte --
//new
app.get('/cohorte/:id/new', isLoggedIn, function(req, res){
    Pensum.find({postgrado_id:req.postgrado.id}, function(err, pen){
        if(pen.length==0){
            res.render('cohorte/error', {title:'El Sistema Detecto un Error al tratar de crear una cohorte', msg:'No es permitido crear una cohorte sin que exista un pensum registrado en el sistema', btn:'/postgrado/'+req.postgrado.id, postgrado:req.postgrado})
        }else{
            Programa.findOne({_id:req.postgrado.programa_id}, function(err, pro){
                res.render('cohorte/new', {postgrado:req.postgrado, programa:pro, pensums:pen});
            });
        }
    });
});
app.post('/cohorte/selectdates', isLoggedIn, function(req, res){
    var b=req.body;
    res.render('cohorte/selectdates', {programa: b.programa, postgradoi: b.postgradoid, postgradon: b.postgradon, resolucion: b.resolucion, nombre: b.nombre, pensum: b.pensum});
});

app.post('/cohorte/create', isLoggedIn, function(req, res){
    var b=req.body;
    Cohorte.findOne({postgrado_id: b.postgradoid, nombre: b.nombreco}, function(err, coh){
        if(coh){
            res.render('cohorte/error', {msg:'Error, en el sistema se encuentra registrado una Cohorte con un nombre similar'});
        }else{
            new Cohorte({
                resolucion: b.resolco,
                nombre: b.nombreco,
                postgrado_id: b.postgradoid,
                pensum_id: b.pensum,
                fecha_inicio_insc: b.finscripciones,
                fecha_limite_insc: b.flinscripciones,
                fecha_entrevista: b.fentrevista,
                fecha_resultados: b.fresultados,
                fecha_matricula: b.fmatricula,
                fecha_introduccion: b.fintroduccion,
                fecha_receso: b.freceso,
                fecha_termina_clase: b.fcclases,
                valor: b.valor,
                otros: b.otro,
                nivel:1,
                link:''
            }).save(function(err, coho){
                if(err) res.json(err)
                res.redirect('/cohorte/'+coho.id)
            });
        }
    });
});
app.param('id', function(req, res, next, id){
    Cohorte.findOne({_id:id}, function(err, cohorte){
        req.cohorte=cohorte;
        next();
    });
});

// show
app.get('/cohorte/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.cohorte.postgrado_id}, function(err, p){
        Programa.findOne({_id: p.programa_id}, function(err, pr){
            Pensum.findOne({_id:req.cohorte.pensum_id}, function(err, pe){
                Estudiante.count({cohorte: req.cohorte.id}, function(err, estudiantesCount){
                    if(estudiantesCount > 0){
                        Estudiante.find({cohorte: req.cohorte.id}, function(err, docs){
                            var ids=new Array();
                            var all=new Array();
                            var ides=new Array();

                            for(i=0; docs.length>i; i++){
                                ids.push(docs[i].datos_personales)
                                ides.push(docs[i].id)
                            }
                            DatosPersonales.find({_id : {$in : ids}}, function(err, results){
                                if(err) res.json(err)
                                for(i=0; results.length > i; i++){
                                    for(j=0; docs.length > j; j++){
                                        if(results[i].id == docs[j].datos_personales){
                                            var a=Array();
                                            a['id']=docs[j].id;
                                            a['codigo']=docs[j].codigo
                                            a['nombre']=results[i].nombres +' '+ results[i].apellidos
                                            a['modalidad']=docs[j].modalidad
                                            all.push(a)
                                            break;
                                        }
                                    }
                                }
                                Asignatura.find({pensum_id:pe.id}, {nivel:1}, {sort:{nivel:-1}}, function(err, nivels){
                                    Cohorte.find({postgrado_id: p.id}, function(err, cohortes){
                                        var cohortesIds=new Array()
                                        for(w=0; cohortes.length > w; w++){
                                            cohortesIds.push(cohortes[w].id)
                                        }
                                        Estudiante.count({cohorte: {$in : cohortesIds}}, function(err, estudiantesTotal){
                                            if(p.tipo_postgrado == 'Máestria'){
                                                Estudiante.count({cohorte:req.cohorte.id, modalidad:'Profundización'}, function(err, profunCount){
                                                    Estudiante.count({cohorte:req.cohorte.id, modalidad:'Investigación'}, function(err, invesCount){
                                                        DatoFinanciero.find({estudiante_id: {$in : ides}}, function(err, dfinan){
                                                            var recaudos=0
                                                            for(t=0; dfinan.length > t; t++){
                                                                recaudos=recaudos + dfinan[t].valor
                                                            }
                                                            res.render('cohorte/show', {pensum:pe, postgrado:p, programa:pr, cohorte:req.cohorte, estudiantes:all, numes:estudiantesCount, nivel:nivels[0], estudiantestotal:estudiantesTotal, profucount:profunCount, invescount:invesCount, recaudos:recaudos});
                                                        });

                                                    });
                                                });

                                            }else{
                                                DatoFinanciero.find({estudiante_id: {$in : ides}}, function(err, dfinan){
                                                    var recaudos=0
                                                    for(t=0; dfinan.length > t; t++){
                                                        recaudos=recaudos + dfinan[t].valor
                                                    }
                                                    res.render('cohorte/show', {pensum:pe, postgrado:p, programa:pr, cohorte:req.cohorte, estudiantes:all, numes:estudiantesCount, nivel:nivels[0], estudiantestotal:estudiantesTotal, recaudos:recaudos});
                                                });
                                            }


                                        });
                                    });
                                });


                            });
                        });
                    }else {
                        Asignatura.find({pensum_id: pe.id}, {nivel: 1}, {sort: {nivel: -1}}, function (err, nivels) {
                            res.render('cohorte/show', {pensum:pe, postgrado:p, programa:pr, cohorte:req.cohorte, numes:estudiantesCount, nivel:nivels[0]});
                        });

                    }
                });
            });
        });
    });
});
//edit
app.get('/cohorte/:id/edit', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.cohorte.postgrado_id}, function(err, p){
        Programa.findOne({_id:p.programa_id}, function(err, pr){
            Pensum.findOne({_id:req.cohorte.pensum_id}, function(err, pensum){
                res.render('cohorte/edit', {cohorte:req.cohorte, postgrado:p, programa:pr, pensum:pensum, datenow:new Date()})
            });

        })
    })

});
app.put('/cohorte/:id', isLoggedIn, function(req, res){
    var b=req.body
    Cohorte.update(
        {_id: b.id},
        {
            resolucion: b.resolucion,
            nombre: b.nombre,
            fecha_inicio_insc: b.finscrip,
            fecha_limite_insc: b.flinscrip,
            fecha_entrevista: b.fentrevista,
            fecha_resultados: b.fresultados,
            fecha_matricula: b.fmatricula,
            fecha_introduccion: b.fintro,
            fecha_termina_clase: b.ftermina,
            valor: b.valor,
            otros: b.otro,
            link: b.linkdata
        },
        function(err){
            if(err) res.json(err)
            res.redirect('/cohorte/' + b.id +'/edit')
        }
    );




});

//delete
app.get('/cohorte/:id/delete', isLoggedIn, function(req, res){
    var i=req.cohorte.postgrado_id;
    Cohorte.remove({_id:req.cohorte.id}, function(err){
        if(err) res.json(err)
        res.redirect('/postgrado/'+i);
    });
});

// matricular inscrito en cohorte
app.post('/cohorte/register', isLoggedIn, function(req, res){
    var b=req.body;
    var modalidad='';

    Cohorte.findOne({_id: b.cohorte}, function(err, cohorte){
        Postgrado.findOne({_id:cohorte.postgrado_id}, function(err, postgrado){
            Inscrito.findOne({_id: b.inscrito}, function(err, inscrito){
                DatosPersonales.findOne({_id:inscrito.datos_personales}, function(err, datos){
                    //pregunto si es el caso especaial, en este caso la maestria
                    if(postgrado.tipo_postgrado == 'Máestria'){

                        // pregunto si la modalidad del postgrado es mixto, tiene las dos modalidades profundizacion y investigacion
                        if(postgrado.modo == 'Mixta') modalidad= b.modalidad
                        else modalidad=postgrado.modo
                        console.log(modalidad)
                    }
                    // se crea el estudiantes y sus datos respectivos
                    new Estudiante(
                        {
                            codigo:datos.documento,
                            cohorte: cohorte.id,
                            datos_personales:datos.id,
                            modalidad: modalidad
                        }
                    ).save(function(err, estudiante){
                            if(err) res.json(err)
                            new DatoFinanciero(
                                {
                                    estudiante_id:estudiante.id,
                                    fecha_pago: inscrito.fecha_pago,
                                    concepto: inscrito.concepto,
                                    valor: inscrito.valor
                                }
                            ).save(function(err, datofinanciero){
                                    if(err) res.json(err)
                                    Asignatura.find({pensum_id:cohorte.pensum_id, nivel:1, electiva:false}, function(err, asignaturas){
                                        for(i=0; asignaturas.length > i; i++){
                                            new Nota(
                                                {
                                                    estudiante_id:estudiante.id,
                                                    asignatura_id:asignaturas[i].id,
                                                    nota:''
                                                }
                                            ).save(function(err, nota){
                                                    if(err) res.json(err)
                                                });
                                        }
                                        Inscrito.remove({_id:inscrito.id}, function(err){
                                            if(err) res.json(err)
                                            res.redirect('/estudiante/'+estudiante.id)
                                        });
                                    });
                                });
                        });


                });
            });
        });
    });
});

// ESTUDIANTE

app.param('id', function(req, res, next, id){
    Estudiante.findOne({_id:id}, function(err, estudiante){
        req.estudiante=estudiante;
        next();
    });
});
app.param('estudiante', function(req, res, next, id){
    Estudiante.findOne({_id:id}, function(err, estudiante){
        req.estudiante=estudiante;
        next();
    });
});

// show student
app.get('/estudiante/:id', isLoggedIn, function(req, res){
   Cohorte.findOne({_id:req.estudiante.cohorte}, function(err, cohorte){
       Postgrado.findOne({_id:cohorte.postgrado_id}, function(err, postgrado){
           Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
               DatosPersonales.findOne({_id:req.estudiante.datos_personales}, function(err, datos){
                    DatoFinanciero.find({estudiante_id:req.estudiante.id}, function(err, datofi){
                        Nota.find({estudiante_id:req.estudiante.id}, function(err, notas){
                            var ids=new Array();
                            for(i=0; notas.length > i; i++){
                                ids.push(notas[i].asignatura_id)
                            }
                            Asignatura.count({_id: {$in: ids}}, function(err, asignaturaCount){
                                if(asignaturaCount > 0){
                                    Asignatura.find({_id: {$in: ids}}, {}, {nivel:-1}, function(err, asignaturas) {
                                        var signatures = new Array();
                                        for (i = 0; asignaturas.length > i; i++) {
                                            var y = new Array();
                                            for (j = 0; notas.length > j; j++) {
                                                if (asignaturas[i].id == notas[j].asignatura_id) {
                                                    y['id'] = asignaturas[i].id
                                                    y['nombre'] = asignaturas[i].nombre
                                                    y['nivel'] = asignaturas[i].nivel
                                                    y['credito'] = asignaturas[i].cradito
                                                    y['electiva'] = asignaturas[i].electiva
                                                    y['nota'] = notas[j].nota
                                                    signatures.push(y)
                                                    break
                                                }
                                            }

                                        }
                                        res.render('estudiante/show', {programa: programa, postgrado: postgrado, cohorte: cohorte, estudiante: req.estudiante, datos: datos, nivel: asignaturas[0].nivel, asignaturas: signatures, datafinancieras: datofi});
                                    });
                                }else{
                                    res.redirect('/cohorte/'+req.estudiante.cohorte)
                                }
                            });

                        });
                    });

               });
           })
       })
   });
});

// edit estudiante

app.put('/estudiante/:id', isLoggedIn, function(req, res){
    var b=req.body;
    DatosPersonales.update(
        {_id: req.estudiante.datos_personales},
        {
            tipo_documento: b.tipodoc,
            documento: b.documento,
            nombres: b.nombres,
            apellidos: b.apellidos,
            email: b.email,
            telefono: b.telefono
        },
        function(err){
            if(err) res.json(err)
            res.redirect('/estudiante/'+ b.eid)
        }

    );
});


// show students in cohort
app.get('/estudiante/:id/students', isLoggedIn, function(req, res){
    Estudiante.find({cohorte:req.cohorte.id}, function(err, estudiantes){
        Postgrado.findOne({_id:req.cohorte.postgrado_id}, function(err, postgrado){
            Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
                var ids=new Array();
                var all=new Array();

                for(i=0; estudiantes.length>i; i++){
                    ids.push(estudiantes[i].datos_personales)
                }

                DatosPersonales.find({_id : {$in : ids}}, function(err, results) {
                    if (err) res.json(err)
                    for (i = 0; results.length > i; i++) {
                        for (j = 0; estudiantes.length > j; j++) {
                            if (results[i].id == estudiantes[j].datos_personales) {
                                var a = Array();
                                a['id'] = estudiantes[j].id;
                                a['nombre'] = results[i].nombres + ' ' + results[i].apellidos
                                all.push(a)
                                break;
                            }
                        }
                    }
                    res.render('estudiante/studentshow', {programa:programa, postgrado:postgrado, cohorte:req.cohorte, estudiantes:all})

                });
            });
        });
    });
});

// proof payment
app.get('/estudiante/proofPayment/:estudiante', isLoggedIn, function(req, res){
    DatosPersonales.findOne({_id:req.estudiante.datos_personales}, function(err, datos){
        res.render('estudiante/proofPayment', {estudiante:req.estudiante, datos:datos})
    });

});
app.post('/estudiante/proof', isLoggedIn, function(req, res){
    var b=req.body
    new DatoFinanciero(
        {
            estudiante_id: b.estudiante,
            fecha_pago: b.fecha,
            concepto: b.concepto,
            valor: b.valor
        }
    ).save(function(err, datof){
            if(err) res.json(err)
            Estudiante.findOne({_id: b.estudiante}, function(err, estudiante){
                //console.log('estudiante:'+estudiante)
                Cohorte.findOne({_id:estudiante.cohorte}, function(err, cohorte){
                    //console.log('cohorte:'+cohorte)
                    Nota.find({estudiante_id:estudiante.id}, function(err, notas){
                        //console.log('notas:'+notas)
                        var ids=new Array()
                        for(i=0; notas.length > i; i++){
                            ids.push(notas[i].asignatura_id)
                        }
                        Asignatura.find({_id: {$in : ids}}, {nivel:1}, {sort:{nivel:-1}}, function(err, nivelEstudiante){
                            //console.log('semestre del estudiante:'+nivelEstudiante[0].nivel)
                            var n=nivelEstudiante[0].nivel+1
                            //console.log('semestra a promover:'+n)
                            Asignatura.count({pensum_id:cohorte.pensum_id, nivel:n, electiva:false}, function(err, asignaturasCount){

                                if(asignaturasCount > 0){
                                    Asignatura.find({pensum_id:cohorte.pensum_id, nivel:n, electiva:false}, function(err, asignaturas){
                                        for(i=0; asignaturas.length > i; i++){
                                            new Nota(
                                                {
                                                    estudiante_id:estudiante.id,
                                                    asignatura_id:asignaturas[i].id,
                                                    nota:''
                                                }
                                            ).save(function(err, nota){
                                                    if(err) res.json(err)
                                                });
                                        }

                                        Cohorte.update(
                                            {_id:cohorte.id},
                                            {
                                                nivel:n
                                            },
                                            function(err){
                                                if(err) res.json(err)
                                                res.redirect('/estudiante/'+estudiante.id)
                                            }
                                        );

                                    });
                                }else{
                                    //console.log('no hay asignaturas')
                                }

                            });
                        });
                    });
                });
            });
            //res.redirect('/estudiante/'+b.estudiante)
        });
});
// END ESTUDIANTE

// PRE-INSCRIPCIONES

app.get('/preinscripcion/:id/add', isLoggedIn, function(req, res){
    Programa.findOne({_id:req.postgrado.programa_id}, function(err, programa){
        res.render('preinscripcion/index', {programa:programa, postgrado:req.postgrado});
    });
});
app.post('/preinscripcion/create', isLoggedIn, function(req, res){
    var b=req.body;
    DatosPersonales.findOne({documento: b.numdoc}, function(err, dato){
        if(dato != null){
            Inscrito.findOne({postgrado_id: b.postgrado}, function(err, inscrito){
                if(inscrito != null){
                    res.render('/preinscripcion/error', {message:'ADVERTENCIA: Ya se encuentra registrado una solicitud de preinscripcion en este postgrado con el numero de documento'+dato.documento, postgrado: b.postgrado});
                }else{

                    new Inscrito(
                        {
                            fecha_incripcion:moment(),
                            postgrado_id: b.postgrado,
                            datos_personales:dato.id,
                            comentario: b.comentario,
                            estado:0,
                            fecha_pago:''
                        }
                    ).save(function(err, i){
                            if(err) res.json(err)
                            res.redirect('/preinscripcion/'+ i.id)
                        });

                }
            });
        }else{
            new DatosPersonales(
                {
                    tipo_documento: b.tipodoc,
                    documento: b.numdoc,
                    nombres: b.nombres,
                    apellidos: b.apellidos,
                    email: b.email,
                    telefono: b.telefono
                }
            ).save(function(err, da){
                    if(err) res.json(err)
                    new Inscrito(
                        {
                            fecha_incripcion:moment(),
                            postgrado_id: b.postgrado,
                            datos_personales:da.id,
                            comentario: b.comentario,
                            estado:0,
                            fecha_pago:'',
                            concepto:'',
                            valor:0
                        }
                    ).save(function(err, i){
                            if(err) res.json(res)
                            res.redirect('/preinscripcion/'+ i.id)
                        });
                });
        }
    });
});
app.param('id', function(req, res, next, id){
    Inscrito.findOne({_id:id}, function(err, inscrito){
        req.inscrito=inscrito;
        next();
    });
});

// show
app.get('/preinscripcion/:id', isLoggedIn, function(req, res){
    Postgrado.findOne({_id:req.inscrito.postgrado_id} ,function(err, postgrado){
        Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
            DatosPersonales.findOne({_id:req.inscrito.datos_personales}, function(err, datos){
                var daten=new Date()
                Cohorte.find({postgrado_id:postgrado.id, fecha_introduccion: {"$gte": daten}}, function(err, cohortes){
                    Cohorte.count({postgrado_id:postgrado.id}, function(err, numcoh){
                        res.render('preinscripcion/show', {programa:programa, postgrado:postgrado, datos:datos, inscrito:req.inscrito, cohortes:cohortes, numcoh:numcoh})
                    });
                });
            });
        })
    })
});

// reporte de pago
app.get('/preinscripcion/:id/report', isLoggedIn, function(req, res){
    DatosPersonales.findOne({_id:req.inscrito.datos_personales}, function(err, datos){
        res.render('preinscripcion/report', {inscrito:req.inscrito, datos:datos});
    });
});

app.post('/preinscripcion/report', isLoggedIn, function(req, res){
    var b=req.body;
    Inscrito.update(
        {_id: b.inscrito},
        {
            estado: 1,
            fecha_pago: b.fecha,
            concepto:'Pago de matricula para inicio de postgrado',
            valor: b.valor
        },
        function(err){
            if(err) res.json(err)
            res.redirect('/preinscripcion/'+ b.inscrito);
        }
    );
});

// delete
app.get('/preinscripcion/delete/:id', isLoggedIn, function(req, res){
    Inscrito.remove(
        {_id:req.inscrito.id},
        function(err){
            if (err) res.json(err)
            res.redirect('/postgrado/'+req.inscrito.postgrado_id)
        }
    );
});



// end PRE-INSCRIPCIONES

// DOCENTE

// create
app.get('/docente/change/:id', isLoggedIn, function(req, res){
    res.render('docente/index', {asignatura:req.asignatura});
});

app.get('/docente/select/:id', isLoggedIn, function(req, res){
    Pensum.findOne({_id:req.asignatura.pensum_id}, function(err, pensum){
        Postgrado.findOne({_id:pensum.postgrado_id}, function(err, postgrado){
            Profesor.find({programa_id:postgrado.programa_id}, function(err, docs){
                var ids=new Array();
                var all=new Array();

                for(i=0; docs.length>i; i++){
                    ids.push(docs[i].datos_personales)
                }

                DatosPersonales.find({_id : {$in : ids}}, function(err, results){
                    if(err) res.json(err)
                    for(i=0; results.length > i; i++){
                        for(j=0; docs.length > j; j++){
                            if(results[i].id == docs[j].datos_personales){
                                var a=Array();
                                a['id']=docs[j].id;
                                a['nombre']=results[i].nombres +' '+ results[i].apellidos
                                all.push(a)
                                break;
                            }
                        }
                    }
                    res.render('docente/select', {docentes:all, asignatura:req.asignatura, postgrado:postgrado});
                });

            });
        })
    })

});
app.post('/docente/select', isLoggedIn, function(req, res){
    var b=req.body;
    Asignatura.update(
        {
            _id: b.asignatura
        },
        {
            profesor_id: b.docente
        },
        function(err){
            res.redirect('/asignatura/'+ b.asignatura);
        }
    );

});

app.get('/docente/create/:id', isLoggedIn, function(req, res){
    Pensum.findOne({_id:req.asignatura.pensum_id}, function(err, pensum){
        Postgrado.findOne({_id:pensum.postgrado_id}, function(err, postgrado){
            Programa.findOne({_id:postgrado.programa_id}, function(err, programa){
                res.render('docente/create', {asignatura:req.asignatura, pensum:pensum, postgrado:postgrado, programa:programa});
            });
        });
    })

});

app.post('/docente/add', isLoggedIn, function(req, res){
    var b=req.body;
    DatosPersonales.findOne({cedula: b.numdoc}, function(err, d){
        if(!d){
            new DatosPersonales(
                {
                    tipo_documento: b.tipodoc,
                    documento: b.numdoc,
                    nombres: b.nombres,
                    apellidos: b.apellidos,
                    email: b.email,
                    telefono: b.telefono

                }
            ).save(function(err, dato){
                    if(err) res.json(err)
                    console.log(dato)
                    Profesor.create(
                        {
                            codigo:dato.documento,
                            contrasena:dato.documento,
                            datos_personales:dato.id,
                            programa_id: b.programa

                        },
                        function(err, profesor){
                            if(err) res.json(err)
                            console.log(b.asignatura)

                            Asignatura.update(
                                {
                                    _id: b.asignatura
                                },
                                {
                                    profesor_id:profesor.id
                                },
                                function(err){
                                    res.redirect('/asignatura/'+ b.asignatura);
                                }
                            );

                        }
                    );
                })
        }
    });
});
app.param('id', function(req, res, next, id){
    Profesor.findOne({_id:id}, function(err, profesor){
        req.profesor=profesor;
        next();
    });
});
app.param('asig', function(req, res, next, id){
    Asignatura.findOne({_id:id}, function(err, asignatura){
        req.asig=asignatura;
        next();
    });
});

// show
app.get('/docente/:id/:asig', isLoggedIn, function(req, res){

    DatosPersonales.findOne({_id:req.profesor.datos_personales}, function(err, dt){
        DatoAcademico.find({Profesor_id:req.profesor.id}, function(err, docs){
            Programa.findOne({_id:req.profesor.programa_id}, function(err, programa){
                res.render('docente/show', {docente:req.profesor, datos:dt, titulos:docs, programa:programa, asignatura:req.asig});
            })


        });
    });

});

app.put('/docente/edit', isLoggedIn, function(req, res){
    var b=req.body;
    console.log(b.case)
    switch(b.case){
        case '1':
            DatosPersonales.update(
                {_id: b.persona},
                {
                    tipo_documento: b.tipodoc,
                    documento: b.documento,
                    nombres: b.nombres,
                    apellidos: b.apellidos,
                    email: b.email,
                    telefono: b.telefono
                },
                function(err){
                    if(err) res.json(err)
                    res.redirect('/docente/'+ b.docente+'/'+ b.asignatura)
                }
            );
            break;

        case '2':
            Profesor.update(
                {_id: b.docente},
                {
                    contrasena: b.pass
                },
                function(err){
                    if(err) res.json(err)
                    res.redirect('/docente/'+ b.docente+'/'+ b.asignatura)
                }
            );
            break;
    }
});

app.get('/docente/changepass/:id/:asig', isLoggedIn, function(req, res){
    DatosPersonales.findOne({_id:req.profesor.datos_personales}, function(err, datos){
        res.render('docente/changepass', {docente:req.profesor, datos:datos, asignatura:req.asig})
    });
});

// END DOCENTE

// TITULOS

// create
app.get('/titulo/new/:id/:asig', isLoggedIn, function(req, res){
    DatosPersonales.findOne({_id:req.profesor.datos_personales}, function(err, datos){
        res.render('titulo/create', {docente:req.profesor, datos:datos, asignatura:req.asig})
    });
});

app.post('/titulo/create', isLoggedIn, function(req, res){
    var b=req.body;
    DatoAcademico.findOne({titulo: b.titulo}, function(err, dato){
        if(dato){
            res.render('titulo/error', {asignatura: b.asignatura, docente: b.docente, message:'ADVERTENCIA: en el sistema ya se encuentra registrado un titulo academico del docente con el nombre', tnombre: b.titulo})
        }else{
            DatoAcademico.create(
                {
                    titulo: b.titulo,
                    universidad: b.universidad,
                    Profesor_id: b.docente
                },
                function(err){
                    if(err) req.json(err)
                    res.redirect('/docente/'+ b.docente +'/'+ b.asignatura);
                }
            );
        }
    });

});
app.param('id', function(req, res, next, id){
    DatoAcademico.findOne({_id:id}, function(err, datoAcademico){
        req.datoAcademico=datoAcademico;
        next();
    });
});
// delete
app.get('/titulo/delete/:id/:asig', isLoggedIn, function(req, res){
    DatoAcademico.remove({_id:req.datoAcademico.id}, function(err){
        if(err) req.json(err)
        res.redirect('/docente/'+req.datoAcademico.Profesor_id+'/'+req.asig.id)
    });
});

// END TITULOS


// ADMIN

app.get('/administrador/profile', isLoggedInAdmin, function(req, res){
    Programa.find({}, {}, {sort:{nombre:1}}, function(err, programas){
        Programa.count({}, function(err, countProgramas){
            res.render('administrador/profile', {user:req.user, programas:programas, numprogramas:countProgramas})
        });
    });
});

// END ADMIN


// END APP CALLS




// -- functions tools --

function addtime(asignatura, body){
    if(body.horad !== 'xxx'){
        Horario.create({
            asignatura_id:asignatura,
            dia:body.dia,
            hora_inicia:body.hora,
            duracion:body.duracion,
            Lugar:body.lugar
        },{
            asignatura_id:asignatura,
            dia:body.diad,
            hora_inicia:body.horad,
            duracion:body.duraciond,
            Lugar:body.lugard
        }, function(err, horarios){
            if(err) res.json(err)
        });
    }else{
        new Horario({
            asignatura_id:asignatura,
            dia:body.dia,
            hora_inicia:body.hora,
            duracion:body.duracion,
            Lugar:body.lugar
        }).save(function(err, hora){
                if(err) res.json(err)
            });
    }
}
function addtimeSingle(asignatura, body){
    new Horario({
        asignatura_id:asignatura,
        dia:body.dia,
        hora_inicia:body.hora,
        duracion:body.duracion,
        Lugar:body.lugar
    }).save(function(err, hora){
            if(err) res.json(err)
        });
}

function formatDate(obj){
    obj.fecha_inicio_insc= obj.fecha_inicio_insc.split(' ');
    obj.fecha_limite_insc= obj.fecha_limite_insc.slice(1, 8);
    obj.fecha_entrevista= obj.fecha_entrevista.slice(1, 8);
    obj.fecha_resultados= obj.fecha_resultados.slice(1, 8);
    obj.fecha_matricula= obj.fecha_matricula.slice(1, 8);
    obj.fecha_introduccion= obj.fecha_introduccion.slice(1, 8);
    obj.fecha_receso= obj.fecha_receso.slice(1, 8);
    obj.fecha_termina_clase= obj.fecha_termina_clase.slice(1, 8);
    return(obj);
}
// -- END FUNCTION TOOLS


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
