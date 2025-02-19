import { useContext } from "react";
import { AuthContext } from "@/contexts/authContext";
import ProgressBar from "@/components/ProgressBar";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { ToDoContext } from "@/contexts/todoContext";

export default function TodosScreen() {
  const { todos, completeTodo, addTodo } = useContext(ToDoContext);
  const [text, setText] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>To-Do List</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter task..."
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          addTodo(text);
          setText("");
        }}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      <FlatList
        data={todos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.todoItem}>
            <Text style={styles.todoText}>{item.description}</Text>
            <TouchableOpacity
              onPress={() => {
                console.log(item._id);
                completeTodo(item._id);
              }}
              disabled={item.completed}
            >
              <Text style={styles.removeText}>
                {item.completed ? "✅" : "⏳"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  addButton: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: { color: "white", fontSize: 16 },
  todoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
  },
  todoText: { fontSize: 18 },
  removeText: { color: "red", fontSize: 18 },
});
