const express = require('express');
const router = express.Router({ mergeParams: true });

const catchAsync = require('../utils/catchAsync');
const expressError = require('../utils/expressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewschema } = require('../schemas.js');


const validateReview = (req, res, next) => {
    const { error } = reviewschema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new expressError(msg, 400)
    } else {
        next();
    }
}


router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Your Review was Added!!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: reviewId });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Deleted!!!');
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;