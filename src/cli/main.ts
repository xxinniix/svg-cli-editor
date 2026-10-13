import { exit } from "node:process";
import { Editor } from "../app/Editor.js";
import { CommandRunner } from "./CommandRunner.js";
import { createInterface } from "node:readline";

const reader = createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "svg> ",
});

const runner = new CommandRunner(new Editor());

console.log("svg-editor 0.1 — type 'help' for commands");
reader.prompt();

reader.on("line", (input) => {
  const command = input.trim();

  if (command === "exit" || command === "quit") {
    reader.close();
    return;
  }

  if (command.startsWith("#")) {
    reader.prompt();
    return;
  }

  const output = runner.execute(command);

  if (output !== "") {
    console.log(output);
  }

  reader.prompt();
});

reader.on("close", () => {
  console.log("bye");
});
exit