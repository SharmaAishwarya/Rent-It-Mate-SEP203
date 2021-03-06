const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const profile = require('../../models/Profile');
const users = require('../../models/Users');
const { check, validationResult } = require('express-validator');
const formidable = require('formidable');
var FormData = require('form-data');
var fs = require('fs');

// @route GET api/profile/me
// @desc get current user profile
// @access Private

router.get('/me', auth, async (req, res) => {
  try {
    console.log(req.user.id, ' getprofiles');
    const userProfile = await profile
      .findOne({ user: req.user.id })
      .populate('users', ['name', 'email']);
    if (!userProfile) {
      console.log('inside no user profile');
      return res
        .status(400)
        .json({ msg: 'You are yet to create your profile' });
    }
    /* istanbul ignore next */
    return res.json(userProfile);
  }
  /* istanbul ignore next */ 
  catch (err) {
    //console.log(err.message);
    /* istanbul ignore next */
    res.status(500).send('server error');
  }
});

// @route GET api/profile
// @desc get all profiles
// @access admin

router.get('/', auth, async (req, res) => {
  try {
    const user = await users.findOne({_id:req.user.id})
    if(user.username == 'admin'){
      const profiles = await Profile.find().populate('users', ['name', 'email']);
      res.json(profiles);
    }
    else
    {
      return res
      .status(400)
      .json({ msg: 'Access is allowed only to admin' });    }
   
  } catch (err) {
   // console.error(err.message);
    /* istanbul ignore next */
    res.status(500).send('Server Error');
  }
});

// @route GET api/profile/admin/:user_id
// @desc get profile of particular user
// @access admin

router.get('/admin/:user_id', async(req,res) => {
  try{
    const profile = await Profile.findOne({user:req.params.user_id}).populate('users', ['name', 'email']);
    if(!profile){
      return res.status(400).json({ msg: 'Profile not found' });
    }
    return res.json(profile);

  }
  catch(err){
   // console.error(err.message);
    /* istanbul ignore next */
    res.status(500).send('Server Error');
  }
  
});

// @route  POST api/profile/update-profile along with form data
// @desc   This is called through axios after user adds a product for rent-- This route adds the product name, start date,
//           end date to user's profile under addedProducts history for future reference
// @access Private

router.post('/update-profile',auth, async(req,res) => {
    let form = new formidable.IncomingForm();
    let result = await Profile.find({user:req.user.id});
    let addHistory, productName,startDate,endDate;
    var formFields = await new Promise(function(resolve,reject) {
      form.parse(req,(err,fields) => {
        const userId = req.user.id;
        const {name, fromDate,toDate} = fields;
        productName = name;
        startDate = fromDate;
        endDate = toDate;
        if(!name || !fromDate || !toDate){
          return res.status(400).json({error: 'All fields are required'});
        }
        resolve(fields);
      });
    })
      //let profile = new Profile(fields);
     const profileValue = Object.assign({},result);
     if(productName !== undefined && startDate !== undefined && endDate !== undefined){
       if(Object.keys(profileValue).length === 0){
         const profileFields = {};
         profileFields.user = req.user.id;
         profileFields.history = {};
         profileFields.history.addedProducts= [];
         profileFields.history.addedProducts = [{name: productName, fromDate :startDate, toDate : endDate}];
         const profile = new Profile(profileFields); 
         addHistory = await profile.save();
       }
       else{
        if(profileValue[Object.keys(profileValue)[0]].history.addedProducts !== null){
          addHistory = await Profile.updateMany({user:req.user.id},
              {$push : {'history.addedProducts' : [
                                { name:productName, 
                                  fromDate: startDate,
                                  toDate: endDate}
                ] }
              });
          }
      // else{
      //   console.log('inside no history opresent for the user')
      //   addHistory =  await Profile.updateMany({user:req.user.id},
      //     {$set: {history: {addedProducts : {
      //                           name:productName,
      //                           fromDate:startDate,
      //                           toDate:endDate
      //     }}}});
      // }
       }
        
     }
      res.json(addHistory);
  }) 


// @route Post api/profile
// @desc Add or update it to profile database
// @access Private

router.post(
  '/',
  [
    auth,
    [
      check('address1', 'Atleast one address line is required')
        .not()
        .isEmpty(),
      check('city', 'City is required')
        .not()
        .isEmpty(),
      check('state', 'State is required')
        .not()
        .isEmpty(),
      check('country', 'Country is required')
        .not()
        .isEmpty(),
      check('zipcode', 'Zipcode is required')
        .not()
        .isEmpty(),
      //check('HomePhone','Mobile number is required').not().isEmpty(),
      check(
        'homePhone',
        'Mobile number has to be exact 10-digit number'
      ).isLength({ max: 10, min: 10 })
      //check('role','Role is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      address1,
      address2,
      city,
      state,
      country,
      zipcode,
      homePhone,
      mobilePhone,
      alternateEmail
    } = req.body;

    // Preparing profile object
    const profileFields = {};
    profileFields.user = req.user.id;

    //Build Address object
    profileFields.address = {};
    if (address1) {
      profileFields.address.address1 = address1;
    }
    /* istanbul ignore next */
    if (address2) {
      profileFields.address.address2 = address2;
    }
    if (city) {
      profileFields.address.city = city;
    }
    if (state) {
      profileFields.address.state = state;
    }
    if (country) {
      profileFields.address.country = country;
    }
    if (zipcode) {
      profileFields.address.zipcode = zipcode;
    }

    if (homePhone) {
      profileFields.homePhone = homePhone;
    }
    if (mobilePhone) {
      profileFields.mobilePhone = mobilePhone;
    }
    if (alternateEmail) {
      profileFields.alternateEmail = alternateEmail;
    }

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      //if profile exists, update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }
      //Else create new profile
      profile = new Profile(profileFields);

      await profile.save();
      return res.json(profile);
    } 
    catch (err) {
     // console.log(err.message);

    /* istanbul ignore next */
      res.status(500).send('server error');
    }
  }
);

// @route delete api/profile
// @desc delete particular profile
// @access Private

router.delete('/', auth, async(req,res) => {
    try{
        const userProfile = await Profile.findOne({user:req.user.id});
        if(userProfile){
            await Profile.deleteOne(userProfile);
        }
        const user = await User.findOne({_id: req.user.id});
        if(user){
            await User.deleteOne(user);
        }
        res.json({msg: 'User removed'});

    }
    catch(err){
      //  console.log(err.message);

    /* istanbul ignore next */
        res.status(500).send('server error');  
    }  
});

module.exports = router;
