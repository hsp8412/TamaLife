import authRoutes from "../routes/auth.js";

const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
};

export default setupRoutes;
