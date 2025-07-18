import mongoose from 'mongoose'

const PitchSchema = new mongoose.Schema({
  userId: String,
  idea: String,
  response: Object,
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Pitch || mongoose.model('Pitch', PitchSchema)
