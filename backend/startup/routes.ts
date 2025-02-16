import authRoutes from "../routes/auth";
import stateRoutes from "../routes/state";
import todoRoutes from "../routes/todo";

const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/state", stateRoutes);
  app.use("/api/todo", todoRoutes);
};

export default setupRoutes;
