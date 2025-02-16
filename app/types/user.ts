type User = {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  petName: string;
  healthPoints: number;
  mood: "happy" | "sad" | "neutral";
};

type RegisterInput = {
  email: string;
  firstName: string;
  lastName: string;
  petName: string;
};
