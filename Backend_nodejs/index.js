var express = require("express");
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs')
var path = require('path');
var cors = require('cors');
// tensorflow.js package for node
var tf = require('@tensorflow/tfjs-node')

// Accept image files only
var helpers = require('./helpers/image_validate');

var app = express();

// Load the tensflow.js web model
async function load_model() {
  var model_file = tf.io.fileSystem('./helpers/model.json');
  let m = await tf.loadLayersModel(model_file);
  return m;
}

// Store the image file from the API in uploads folder
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
})
var upload = multer({storage: storage, fileFilter: helpers.imageFilter}).single('file')

// handle single file upload
// app.post('/api/v1/upload', upload.single('dataFile'), (req, res, next) => {
//   const file = req.file;
//   if (!file) {
//      return res.status(400).send({ message: 'Please upload a file.' });
//   }
//   var sql = "INSERT INTO `file`(`name`) VALUES ('" + req.file.filename + "')";
//   var query = db.query(sql, function(err, result) {
//       return res.send({ message: 'File is successfully.', file });
//    });
// });

// var mysql = require('mysql');
// var conn = mysql.createConnection({
//   host: 'localhost', // Replace with your host name
//   user: 'root',      // Replace with your database username
//   password: '',      // Replace with your database password
//   database: 'my-node' // // Replace with your database Name
// }); 
// conn.connect(function(err) {
//   if (err) throw err;
//   console.log('Database is connected successfully !');
// });
// module.exports = conn;

// var express = require('express');
// var path = require('path');
// var cors = require('cors');
// var bodyParser = require('body-parser');
// var multer = require('multer')
// var db=require('./database');
// var app = express();
// Read the image to be segmented
const readImage = path => {     
  const imageBuffer = fs.readFileSync(path);     
  const tfimage = tf.node.decodeImage(imageBuffer);    
  return tfimage;   
}

// CORS
app.use(cors())
 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Makeup API sends the path where the image is stored(taken from upload API)
// Image is read and passed through the segmentation model
// Response contains the segmentation mask of the image and the image itself
app.post('/api/v1/makeup', (req, res) => {
    console.log(req.body)
    if(!req.body.path) {
      return res.status(400).send({
        success: 'false',
        message: 'send the path of the image'
      });
    } 
    var imgLoc = req.body.path;
    let model = load_model();

    model.then(function (result) {
      var a = tf.scalar(255, dtype='float32')
      // Read the image from the given path
      // Expand dimension to 4D that is accepted by the model
      // Resize image to 256x256 that is accepted by the model
      // Normalize the image and return the result
      const imageInput =  tf.tidy(() => {
        var inter = readImage(path.join('./', imgLoc)).expandDims();
        console.log(inter.shape)
        const result = tf.image.resizeBilinear(inter, [256,256]).div(a);
        return result
      }); 

      //Resize the image to 500x500 to display in front-end
      const imgOutput = tf.tidy(() => {
        var inter = readImage(path.join('./', imgLoc));
        const result = tf.image.resizeBilinear(inter, [500, 500]);
        return result;
      })
      // Predicting the segmentation mask
      console.log((imageInput))
      const prediction = result.predict(imageInput).argMax(axis=-1);

      const out = Array.from(prediction.dataSync());
      const imgOut = Array.from(imgOutput.dataSync());
      console.log(out);
      return res.status(200).send({
        success: 'true',
        imageArray: imgOut,
        prediction: out
      });
    }, 
    function (err) {
      console.log(err);
      return res.status(400).send({
        success: 'false',
        message: err
      })
    });
  });

  // Upload API accepts image file as input
  // Stores this image in the uploads folder
  // The path where the image is stored is sent as response
  app.post('/api/v1/upload', function(req, res) {
    upload(req, res, function(err) {
        filesArray = req.files;
        if (req.fileValidationError) {
            return res.status(400).send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.status(400).send({
                message: 'Please select an image to upload'
            });
        }
        else if (err instanceof multer.MulterError) {
            return res.status(400).send(err);
        }
        else if (err) {
            return res.status(400).send(err);
        }
        res.status(200).send(req.file);
    })
});

// Port where backend application runs
const PORT = 8000;

app.listen(PORT, function() {
  console.log(`server running on port ${PORT}`);
});