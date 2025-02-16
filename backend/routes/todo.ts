import {Router, Request, Response} from "express";
import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../repos/todoRepo.js";
import {auth} from "../middleware/auth"; // Ensures user authentication

const router = Router();

// ✅ Get all todos for the logged-in user
router.get("/", auth, async (req, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id; // `req.user` is ensured by middleware
    if (!userId) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }

    const todos = await getTodos(userId);
    res.json(todos);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// ✅ Get a specific todo
router.get("/:id", auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }

    const todo = await getTodoById(String(req.params.id), userId);
    if (!todo) {
      res.status(404).json({message: "Not found"});
      return;
    }

    res.json(todo);
  } catch (error) {
    res.status(500).json({error: error.message});
  }
});

// ✅ Create a new todo
router.post("/", auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }

    const {description} = req.body;
    if (!description) {
      res.status(400).json({error: "Description is required"});
      return;
    }

    const newTodo = await createTodo(userId, description);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// ✅ Update a todo's completed status
router.put("/:id", auth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({error: "Unauthorized"});
      return;
    }

    const {completed} = req.body;
    if (typeof completed !== "boolean") {
      res.status(400).json({error: "Invalid completion status"});
      return;
    }

    const id = String(req.params.id);
    const response = await updateTodo(id, userId, completed);

    res.json(response);
  } catch (error) {
    res.status(400).json({error: error.message});
  }
});

// ✅ Delete a todo
router.delete(
  "/:id",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({error: "Unauthorized"});
        return;
      }

      const id = String(req.params.id);
      const response = await deleteTodo(id, userId);

      res.json(response);
    } catch (error) {
      res.status(400).json({error: error.message});
    }
  }
);

export default router;
