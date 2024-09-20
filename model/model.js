import { createNewTaskElement, clear_form_elements } from "../app/app.js";

export function getArrayValue(array, objectName) {
  return array.find((x) => x.name === objectName).value;
}

export function submitCreateTaskForm(form) {
  let formArray = form.serializeArray();
  let taskDataObj = {};

  $(formArray).each(function (i, field) {
    taskDataObj[field.name] = field.value;
  });
  let starRating = taskDataObj["starRating"];

  taskDataObj["taskReward"] = Number(starRating) * 100;

  createNewTask(taskDataObj);
}

// ToDo List
let uncompleteTasks = [];
let completedTasks = [];
let createTaskFormResponseText = "#createTaskForm--responseText";

const isWhitespaceString = (taskTitle) => !taskTitle.replace(/\s/g, "").length;

function createNewTask(taskDataObj) {
  if (
    isWhitespaceString(taskDataObj.taskTitle) ||
    isWhitespaceString(taskDataObj.dueDate)
  ) {
    $(createTaskFormResponseText).css("color", "red");
    $(createTaskFormResponseText).html(
      `<p style="color=red">Please fill all required information</p>`
    );
    return;
  }

  uncompleteTasks.push(taskDataObj);
  // console.log("== New Task Created ==");
  createNewTaskElement(taskDataObj);

  clear_form_elements("#createTaskForm");
  $(createTaskFormResponseText).css("color", "black");
  $(createTaskFormResponseText).html(
    `<p style="oolor='red'">Task Added Successfully!</p>`
  );
  setTimeout(() => {
    $(createTaskFormResponseText).html(``);
  }, 2000);
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
