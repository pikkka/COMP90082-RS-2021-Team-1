const User = require('../proxies/user');
const Subject = require('../proxies/subject');
const Tool = require('../proxies/tool')
const jwt = require('jsonwebtoken');
const TOKEN_SECRET = 'THIS_IS_SECRET'

const aws = require('aws-sdk');
const fs = require('fs');


/**
 * post upload image single 
 * @param req
 * @param res
 
 */

exports.upload= function(req, res){
  const spacesEndpoint = new aws.Endpoint('https://nyc3.digitaloceanspaces.com');
  const authtoken = req.header('auth-token');
  var mtoken = jwt.decode(authtoken);
  
    aws.config.setPromisesDependency();
    aws.config.update({
      accessKeyId: process.env.ACCESSKEYID,
      secretAccessKey: process.env.SECRETACCESSKEY,
     
    });
    
    const s3 = new aws.S3({
      endpoint: spacesEndpoint
    });
    var params = {
      ACL: 'public-read',
      Bucket: "soft-repo-team",
      Body: fs.createReadStream(req.file.path),
      Key: `${mtoken._id}/${req.file.originalname}`
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.log('Error occured while trying to upload to S3 bucket', err);
      }

      if (data) {
      
        fs.unlinkSync(req.file.path); // Empty temp folder
        const locationUrl = data.Location;
        
        console.log(locationUrl);
      
      User.updateImage(mtoken._id,{ "images": locationUrl },
      function (err, raw) {
                if (err) 
                console.log('The raw response from Mongo was ', raw);
                res.json(`success: false , error:${raw}`);
            })
      
      responsejson = {success: true,
        imageurl:locationUrl};
        res.json(responsejson);
      }
    });
  }

  /**
 * get all uploaded images of current user
 * @param req
 * @param res
 
 */
exports.getAllImages = function(req,res){
  User.getUserById(req.user._id,  function (err, user) {

    var responsejson = {
      success:true,
      images :user.images
    };
    res.json(responsejson);
  })
  
}
/**
 * get subscribed tools and subjects
 * @param req
 * @param res
 * @param next
 */

exports.getUserHomePage = async function (req, res) {
    User.getUserHomePage(req.user._id, (err, result) => {
      if(err){
        return res.json({ success: false, error: err});
      } else {
        return res.json({ success: true, user: result});
      }
    })
}

exports.getAllUsers = function (req, res) {
    User.getAllUsers(function (err, users) {
        if (err) {
            res.json({ success: false, error: 'failed to get all users'});
        } else {
            let userMap = {};

            users.forEach(function (user) {
                userMap[user._id] = user;
            });
            res.send(userMap);
        }
    })

}

exports.subscribe_subject = function(req, res) {
  let subjectid = req.body.subjbect_id
  User.updateSubscribedSubject(subjectid, req.user._id, (error, result) => {
    if(error){
      res.json({ success: false, error: 'failed to subscribe the subject' + error })
    } else {
      res.json({ success: true, user: result })
    }
  })
}


exports.addUser = function (req, res) {
  // if(!req.user._admin){
  //     return res.json({success: false, error : 'You are not an Admin'})
  // }

  User.newAndSave(req.body, function (err, user) {
      if (err) {
          res.json({ success: false, error: 'failed to add user', error: err });
      } else {
          return res.json({ success: true, user: user });
      }
  });
};


exports.studentRegister = function(req, res) {

    if(req.body.password == null || req.body.username ==null || req.body.studentId == null){
        res.json({ success: false, error_info: 'empty username or password or student id'});
    }
    else{
        var name = req.body.name;
        var account = req.body.username;
        var password = req.body.password;
        var student_number = req.body.studentId;
        var is_moderator = false;


        User.newAndSave2(name, account, student_number, password, is_moderator, function (err, user) {
            if (err) {
                res.json({ success: false, error_info: 'duplicate username or student id', error: err });
            } else {
                return res.json({ success: true, user: user });
            }
        });
    }
}


