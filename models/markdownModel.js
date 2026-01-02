const mongoose = require('mongoose');
const slugify = require('slugify');

const markdownSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A markdown document must have a title'],
    trime: true,
  },
  slug: {
    type: String,
  },
  content: {
    type: String,
    required: [true, 'A markdown document must have content'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A markdown document must belong to at least one user'],
    },
  ],
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
markdownSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
});

markdownSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'users',
    select: '-__v, -passwordChangedAt',
  });
});

const Markdown = mongoose.model('Markdown', markdownSchema);

module.exports = Markdown;

/*
// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });



tourSchema.pre('save', async function(next) {
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  this.guides = await Promise.all(guidesPromises);
  next();
});

tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});
 */
