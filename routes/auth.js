const express = require('express');
const router = express.Router();
const passport = require('passport');


router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    }),
    function (req, res) {
    
});

router.get('/google/callback',
    passport.authenticate('google',
         {successRedirect: '/profile',
          failureRedirect: '/',
        }),
        function (req, res) {}
);

router.get('/profile', (req, res) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`<h1>Profile</h1><pre>${JSON.stringify(req.user, null, 2)}</pre>`);
});

router.post('/logout', (req, res,next) => {
    req.logout(function(err) {
        if (err) {
             return next(err); 
            }
        res.redirect('/');
    });
});


module.exports = router;