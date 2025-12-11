function ensureLoggedIn(req, res, next) {
    if (!req.session.user) {
      req.session.flash = { type: "error", message: "You must be logged in." };
      return res.redirect('/login');
    }
    next();
  }
  
  module.exports = { ensureLoggedIn };
  