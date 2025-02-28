import authRoutes from "../routes/auth.js";
import stateRoutes from "../routes/state.js";
import petRoutes from "../routes/pet.js";
import foodRoutes from "../routes/food.js";
import mlRoutes from "../routes/ml.js";
import todoRoutes from "../routes/todo.js";
const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/state", stateRoutes);
  app.use("/api/pet", petRoutes);
  app.use("/api/food", foodRoutes);
  app.use("/api/ml", mlRoutes);
  app.use("/api/todoRoutes", todoRoutes);
};

export default setupRoutes;
