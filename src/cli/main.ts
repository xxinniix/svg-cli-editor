import { createInterface } from "node:readline";

const reader = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "svg> ",
});

console.log("svg-editor 0.1 — type 'help' for commands");

reader.prompt();

reader.on("line", (input) => {
  const command = input.trim();

  if (command === "exit" || command === "quit") {
    reader.close();
    return;
  }

  if (command === "help") {
    console.log("Available commands: help, exit");
  } else if (command !== "") {
    console.log(`error: unknown command: ${command}`);
  }

  reader.prompt();
});

reader.on("close", () => {
  console.log("bye");
});