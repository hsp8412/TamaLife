import mongoose, {Schema, Document} from "mongoose";

// Define the structure of a To-Do item
interface ITodo extends Document {
  userId: string; // Link to the user who created the todo
  description: string; // Task description
  completed: boolean; // Whether the task is done
  createdAt: Date; // Timestamp for sorting/filtering
}

// Define the Mongoose Schema
const TodoSchema = new Schema<ITodo>(
  {
    userId: {type: String, required: true}, // Every todo must belong to a user
    description: {type: String, required: true},
    completed: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now}, // Automatically sets the creation date
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  }
);

// Create the Mongoose Model
export default mongoose.model<ITodo>("Todo", TodoSchema);
