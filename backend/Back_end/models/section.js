var mongoose  = require('mongoose')
var Schema    = mongoose.Schema


var SectionSchema = new Schema({
    subject_code: {type: String},
    name: {type: String, required: true},
    type: {type: String, required: true},
    tools: [{ type: Schema.Types.ObjectId, ref: 'Tool' }],
    articles: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    description:{type:String},
    owner: {type: Schema.Types.ObjectId, required: true}
  })



// SectionSchema.post('save', async function(next) {
//     let subject = await Subject.findById(this.owner)
//     subject.sections = subject.sections.push(this._id)
//     console.log(subject)
//     await subject.save()
//     next()
// })




module.exports = mongoose.model('Section', SectionSchema);