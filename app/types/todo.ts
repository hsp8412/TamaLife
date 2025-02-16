type Todo = {
  _id: string;
  userId: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type NewTodoInput = {
  description: string;
};
