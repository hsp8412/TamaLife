import authRoutes from "../routes/auth.js";
import stateRoutes from "../routes/state.js";
import foodRoutes from "../routes/food.js";
const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/state", stateRoutes);
  app.use("/api/food", foodRoutes);
};

export default setupRoutes;
