var express    = require('express'); 

var fs  = require('fs');

var path = require('path');

// call express
var app  = express();    


var multer = require('multer');

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



// connect database 
var mongoose   = require('mongoose');

var uri = 'mongodb://wanglei85119:123456@ds149049.mlab.com:49049/wangleidb';

//var uri = 'mongodb://<dbuser>:<dbpassword>@ds149049.mlab.com:49049/<dbname>'; //the standard MongoDB URI from mLab
mongoose.Promise = global.Promise
mongoose.connect(uri, function(err) {
if (err) {
    console.log('haha' + err);
}
});

var db = mongoose.connection;

// Error handler
db.on('error', function (err) {
console.log(err);
});


var Grid = require('mongoose-gridfs')({
    collection:'photo',
    model:'Attachment'
 });

app.use(express.static(path.join(__dirname, '/www')));
app.use('/uploads', express.static(path.join(__dirname + '/uploads')));

//using multer to upload image to a static folder named uploads

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    console.log(req);
    cb(null, file.originalname);     //rename the image as the originalname
  }
});

var upload = multer({storage: storage});

//var upload = multer({ dest: 'uploads/' })



app.post('/img/upload', upload.single('img'), function(req,res){
    console.log("Start uploading image!")
    //console.log(req.file);
    imgName = req.file.filename;
    console.log(imgName);
 
    var dirname = require('path').dirname(__dirname)+'/examples/uploads';
    var filename = imgName;
     
      
    var read_stream =  fs.createReadStream(dirname + '/' + filename);

    var file = Grid.model;
   
    file.write({
     		filename: filename
     	},
     	read_stream,
     	function(error, createdFile) {
     		if(error) {
     			console.log(error);
     		} 
     		if (createdFile) {
     			console.log(createdFile);
                imgId = createdFile._id;
     			res.json(imgId);
     		}
     	}
    );
});


app.get('/img/download/:id', function(req,res){
    console.log('download1')
      var picId = req.params.id;  // pic_id is the objectid of the image in MongoDB
      var file=Grid.model;
      console.log("download");
 
       file.readById(picId, function (err, data) {
        console.log("Downloading Image " + picId);
        if (err) {
            res.json(err);
        }
        if (data.length > 0) {
            //console.log(data);
            res.send(data);
            
        } else {
            res.json('File Not Found!');
        }
    });
});


app.listen(80);
console.log("api starts working!")

