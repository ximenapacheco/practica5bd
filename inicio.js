var http=require('http');
var url=require('url');
var fs=require('fs');
var querystring = require('querystring');
var mysql=require('mysql');

var conexion=mysql.createConnection({
    host:'sql10.freemysqlhosting.net',
    port:'3306',
    user:'sql10397182',
    password:'GiPHFmHXZm',
    database:'sql10397182'
    });
    conexion.connect(function (error){
        if (error)
            console.log('Problemas de conexion con mysql');
            console.log(error)
    });

    var mime = {
        'html'  :   'text/html',
        'css'   :   'text/css',
        'jpg'   :   'text/jpg',
        'ico'   :   'text/x-icon',
        'mp3'   :   'text/mp3',
        'mp4'   :   'text/mp4'
        
    }

    var servidor=http.createServer(function(pedido,respuesta){
        var objetourl = url.parse(pedido.url);
        var camino='public'+objetourl.pathname;
        if (camino=='public/')
            camino='public/index.html';
        encaminar(pedido,respuesta,camino);
    });

    servidor.listen(3000);

    function encaminar (pedido,respuesta,camino) {
        switch (camino) {
            case 'public/creartabla': {
                crear(respuesta);
                break;
            }   
            case 'public/alta': {
                alta(pedido,respuesta);
                break;
            }           
            case 'public/listado': {
                listado(respuesta);
                break;
            }
            case 'public/consultaporcodigo': {
                consulta(pedido,respuesta);
                break;
            }                           
            default : {  
                fs.exists(camino,function(existe){
                    if (existe) {
                        fs.readFile(camino,function(error,contenido){
                            if (error) {
                                respuesta.writeHead(500, {'Content-Type': 'text/plain'});
                                respuesta.write('Error interno');
                                respuesta.end();                    
                            } else {
                                var vec = camino.split('.');
                                var extension=vec[vec.length-1];
                                var mimearchivo=mime[extension];
                                respuesta.writeHead(200, {'Content-Type': mimearchivo});
                                respuesta.write(contenido);
                                respuesta.end();
                            }
                        });
                    } else {
                        respuesta.writeHead(404, {'Content-Type': 'text/html'});
                        respuesta.write('<!doctype html><html><head></head><body>Recurso inexistente</body></html>');       
                        respuesta.end();
                    }
                }); 
            }
        }   
    }
function crear(respuesta) {
    conexion.query('drop table if exists articulos',function (error,resultado){
        if (error)
            console.log(error);               
    }); 
    conexion.query('create table articulos ('+
                    'codigo int primary key auto_increment,'+
                    'descripcion varchar(50),'+
                    'precio float'+
                    ')', function (error,resultado){
        if (error) {
            console.log(error);               
            return;
        }  
    });
    respuesta.writeHead(200, {'Content-Type': 'text/html'});
    respuesta.write('<!doctype html><html><head></head><body style="background-color:rgb(117, 175, 223);">'+
                    'Se creo la tabla</body></html>');     
    respuesta.end();    
}
function alta(pedido,respuesta) {
    var info='';
    pedido.on('data', function(datosparciales){
        info += datosparciales;
    });
    pedido.on('end', function(){
        var formulario = querystring.parse(info);
    var registro={
        descripcion:formulario['descripcion'],
        precio:formulario['precio']
    };
    conexion.query('insert into articulos set ?',registro, function (error,resultado){
        if (error) {
            console.log(error);
            return;
        }   
    });       
    respuesta.writeHead(200, {'Content-Type': 'text/html'});
    respuesta.write('<!doctype html><html><head></head><body style="background-color:rgb(117, 175, 223);">'+
                    'Se cargo el articulo</body></html>');     
    respuesta.end();
    });     
}
function listado(respuesta) {
    conexion.query('select codigo,descripcion,precio from articulos', function(error,filas){
        if (error) {            
            console.log('error en el listado');
            return;
        }
        respuesta.writeHead(200, {'Content-Type': 'text/html'});
        var datos='';
        for(var f=0;f<filas.length;f++){
            datos+='Codigo:'+filas[f].codigo+'<br>';
            datos+='Descripcion:'+filas[f].descripcion+'<br>';
            datos+='Precio:'+filas[f].precio+'<hr>';
        }
        respuesta.write('<!doctype html><html><head></head><body style="background-color:rgb(117, 175, 223);">');
        respuesta.write(datos); 
        respuesta.write('</body></html>');
        respuesta.end();        
    });
}

function consulta(pedido,respuesta) {
    var info='';
    pedido.on('data', function(datosparciales) {
        info += datosparciales;
    });
    pedido.on("end", function(){
        var formulario = querystring.parse(info);
        var dato=[formulario['codigo']];
        conexion.query('select descripcion,precio from articulos where codigo=?',dato, function(error,filas){
        if (error) {
            console.log('error en la consulta');
            return;
        }
        respuesta.writeHead (200, {'Content-Type': 'text/html'});
        var datos='';
        if (filas.length>0){
            datos+='Descripcion:'+filas[0].descripcion+'<br>';
            datos+='Precio:'+filas[0].precio+' <hr>';
        } else {
            datos='No existe un artículo con dicho codigo.';
        }
        respuesta.write('<!doctype html><html><head></head><body style="background-color:rgb(117, 175, 223);">');
        respuesta.write(datos);
        respuesta.write('</body></html>');
        respuesta.end();
        });
    });
}
console.log('Servidor web iniciado: 3000');
    
    



