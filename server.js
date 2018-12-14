var express = require( "express" );
var bodyParser = require( "body-parser" );
var multer = require( "multer" );
var app = express();
var path = require( 'path' );
var fs = require( 'fs' );

let videoStitch = require( 'video-stitch' );
let videoConcat = videoStitch.concat;
const PORT = 57072;

module.exports = function() {
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded( {
        extended: true
    } ) );

    app.use( function ( req, res, next ) {
        res.header( "Access-Control-Allow-Origin", "*" );
        res.header( "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept" );
        next();
    } );

    var storage = multer.diskStorage( {
        destination: function ( request, file, callback ) {
            callback( null, './server/uploads' );
        },
        filename: function ( request, file, callback ) {
            console.log( file );
            callback( null, file.originalname )
        }
    } );

    var upload = multer( {
        storage: storage
    } ).single( 'video' );

    app.get( '/test', function ( req, res ) {
        res.sendFile( path.join( __dirname + '/static/index.html' ) );
    } );

    app.post( '/upload', function ( req, res ) {
        upload( req, res, function ( err ) {

            if ( err ) {
                console.log( 'Error Occured', err );
                return;
            }

            console.log( 'Video Uploaded', req.file );
            concat( req, res );

        } )
    } );

    var server = app.listen( PORT, function () {
        console.log( 'Listening on port ' + server.address().port )
    } );

    function concat( req, res ) {
        var clips = [];

        fs.readdir( path.join( __dirname + '/uploads' ), ( err, files ) => {

            files = files.filter( item => ( /\.mov|mp4|webm/i ).test( item ) );

            console.log( 'files', files );

            files.forEach( file => {
                console.log( file );

                clips.push( {
                    "fileName": path.join( __dirname + '/uploads/' + file ),
                } )

                console.log( clips )

                videoConcat( {
                        silent: false,
                        overwrite: true
                    } )
                    .clips( clips )
                    .output( path.join( __dirname + '/uploads/concat.mp4' ) ) //optional absolute file name for output file
                    .concat()
                    .then( ( outputFileName ) => {
                        console.log( outputFileName );
                    } ).catch( ( error ) => {
                        console.log( error );
                    } );

            } );

            res.send( 200 );

        } )
    };

    return app;
}