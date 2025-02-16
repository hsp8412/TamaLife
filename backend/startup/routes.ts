import authRoutes from "../routes/auth.js";
import stateRoutes from "../routes/state.js";
import petRoutes from "../routes/pet.js";

const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/state", stateRoutes);
  app.use("/api/pet", petRoutes);
};

export default setupRoutes;
