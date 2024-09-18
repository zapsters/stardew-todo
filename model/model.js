import { updateStarDifficultyUi, clear_form_elements } from "../app/app.js";

export function getArrayValue(array, objectName) {
  return array.find((x) => x.name === objectName).value;
}

export function submitCreateTaskForm(form) {
  let formResponse = form.serializeArray();
  let starRating = getArrayValue(formResponse, "starRating");
  formResponse.push({ name: "taskReward", value: starRating * 100 });

  console.log(createNewTask(formResponse));
  updateStarDifficultyUi();
}

// ToDo List
let uncompleteTasks = [];
let completedTasks = [];
let createTaskFormResponseText = "#createTaskForm--responseText";

const isWhitespaceString = (taskTitle) => !taskTitle.replace(/\s/g, "").length;

function createNewTask(taskObject) {
  let taskTitle = getArrayValue(taskObject, "taskTitle");

  if (isWhitespaceString(taskTitle)) {
    console.error("CreateNewTask Error! no task title!");
    $(createTaskFormResponseText).css("color", "red");
    $(createTaskFormResponseText).html(
      `<p style="oolor='red'">Please fill all required information</p>`
    );
    return;
  }

  uncompleteTasks.push(taskObject);
  clear_form_elements("#createTaskForm");
  console.log("== New Task Created ==");

  $(createTaskFormResponseText).css("color", "black");
  $(createTaskFormResponseText).html(
    `<p style="oolor='red'">Task Added Successfully!</p>`
  );
  return readTaskList();
}

export function readTaskList() {
  console.log("Uncomplete", uncompleteTasks);
  console.log("Completed!", completedTasks);
}

// Cookies
// console.log(Cookies.get());

function deleteCookies() {
  Cookies.remove("todo_task_array");
}

function readCookies() {
  console.log(Cookies.get());
}

function setCookie(input) {
  Cookies.set("todo_task_array", input);
}
