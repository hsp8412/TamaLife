import authRoutes from "../routes/auth.js";
import stateRoutes from "../routes/state.js";

const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/state", stateRoutes);
};

export default setupRoutes;
