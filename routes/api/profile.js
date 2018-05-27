//
// ─── LOCATION BIO EXPERIENCES EDUCATION SOCIAL NETWORK LINKS PROFILE MODEL ──────
//

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
var passport = require("passport"); //passport for protected routes
// Load Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");

//load Profile model
const Profile = require("../../models/Profile");
//load User profile
const User = require("../../models/User");

// @route GET api/profile/test
// @desc Tests profile route
// @access Public

router.get("/test", (req, res) =>
  res.json({
    msg: "Profile Works"
  })
);

// ────────────────────────────────────────────── GET CURRENT USER PROFILE ─────
// @route  GET api/profile
// @desc Get current user's profile
// @access Private

router.get(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const errors = {};

    Profile.findOne({
      user: req.user.id
    })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for this user";
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// ────────────────────────────────────────────── GET ALL PROFILES ─────
//@route            GET api/profile/all
//what this does... Get all profiles
//@access           Public

router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = "There are no profiles";
        return res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err =>
      res.status(404).json({
        profile: "There are no profiles :( "
      })
    );
});

// ────────────────────────────────────────────── GET PROFILE BY HANDLE ─────
// @route GET api/profile/handle/:handle (backend route)
// @desc Get profile by handle
// @access Public

router.get("/handle/:handle", (req, res) => {
  //<<< placeholder
  const errors = {};
  //  Find by handle vvv    vvv get handle from url by...req.params.handle
  Profile.findOne({
    handle: req.params.handle
  }) //<<< use our Profile model
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      } else {
        res.json(profile);
      }
    })
    .catch(err => res.status(404).json(err));
});

// ────────────────────────────────────────────── GET PROFILE OR USER BY ID ─────
// @route GET api/profile/user/:user_id
// @desc Get profile by user id
// @access Public

router.get("/user/:user_id", (req, res) => {
  const errors = {};
  // Find by user_id vvv        vvv get handle from url by...req.params.user_id
  Profile.findOne({
    user: req.params.user_id
  })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({
        profile: "There is no profile for this user"
      })
    );
});

// ────────────────────────────────────────────── CREATE OR EDIT USER PROFILE ─────
// @route POST api/profile
// @desc Create or edit user profile
// @access Private

router.post(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    //Check validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    //GET fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.trails) profileFields.trails = req.body.trails;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.handle) profileFields.handle = req.body.handle;
    
    //Skills - Split into Array using split() method
    if (typeof req.body.skills !== "undefined") {
      profileFields.skills = req.body.skills.split(",");
    }

    //Social
    profileFields.social = {};

    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.linkedin) profileFields.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.instagram = req.body.instagram;

    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          {
            user: req.user.id
          },
          {
            $set: profileFields
          },
          {
            new: true
          }
        ).then(profile => res.json(profile));
      } else {
        //Create

        //Check if handle exists
        Profile.findOne({
          handle: profileFields.handle
        }).then(profile => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json(errors);
          }

          //Save profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// ────────────────────────────────────────────────────────── POST EXPERIENCE ─────
// @route Post api/profile/experience
// @desc Add experience to profile
// @access Private

router.post(
  "/experience",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    //Check validation
    if (!isValid) {
      //Return any errors with 400 status
      return res.status(400).json(errors);
    }
    // Find by user >>>         // user comes from our token
    Profile.findOne({
      user: req.user.id
    }).then(profile => {
      const newExp = {
        // From form
        title: req.body.title,
        trails: req.body.trails,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      //add to exprience array
      profile.experience.unshift(newExp); // <<< unshift puts to the beginning

      profile.save().then(profile => res.json(profile));
    });
  }
);

// ─────────────────────────────────────────────────────────── POST EDUCATION ─────
// @route POST api/profile/education
// @desc  Add education to profile
// @access Private


// ───────────────────────────────────────────────────────── DELETE EDUCATION ─────
// @route DELETE api/profile/education/:edu_id
// @desc delete education from profile
// @access Private

router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    })
      .then(profile => {
        //Get remove index
        const removeIndex = profile.education
          // Map array to item id <<< Only gets information
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        //Splice out of array
        profile.education.splice(removeIndex, 1);

        //Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// ──────────────────────────────────────────────────────── DELETE EXPERIENCE ─────
// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private

router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOne({
      user: req.user.id
    })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// ────────────────────────────────────────────────── DELETE USER AND PROFILE ─────
// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private

router.delete(
  "/",
  passport.authenticate("jwt", {
    session: false
  }),
  (req, res) => {
    Profile.findOneAndRemove({
      user: req.user.id
    }).then(() => {
      User.findOneAndRemove({
        _id: req.user.id
      }).then(() =>
        res.json({
          success: true
        })
      );
    });
  }
);

module.exports = router;
