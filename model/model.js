import {
  createNewTaskElement,
  clear_form_elements,
  updateTaskCountUI,
} from "../app/app.js";

export let uncompleteTasks = [];
export let completedTasks = [];
let userCategories = [];
let createTaskFormResponseText = "#createTaskForm--responseText";
let goldCounter = 0;
let savedTaskData = [];

function getSavedData() {
  savedTaskData = localStorage.getItem("stardewtodo-taskdata");
  return savedTaskData;
}

export function saveData() {
  let saveDateButton = "#settings-saveBtn";
  let lastSavedText = "#lastsavedtext";

  savedTaskData = [uncompleteTasks, completedTasks];

  // Update UI
  $(saveDateButton).attr("disabled", true);
  $(this).attr("value", "Data Saved!");
  setTimeout(function (e) {
    $(saveDateButton).attr("disabled", false);
    $(saveDateButton).attr("value", "Save Data");
  }, 1000);
  let date = new Date();
  $(lastSavedText).html(date.toLocaleString());
}

export function createNewCategory(categoryName) {
  console.log("CREATE NEW CATEGORY: ", categoryName);
  userCategories.push(categoryName);
}

export function submitCreateTaskForm(form) {
  let formArray = form.serializeArray();
  let taskDataObj = {};

  $(formArray).each(function (i, field) {
    taskDataObj[field.name] = field.value;
  });
  if (
    taskDataObj["taskTitle"].toString().trim().length === 0 ||
    taskDataObj["dueDate"].toString().trim().length === 0
  ) {
    $(createTaskFormResponseText).css("color", "red");
    $(createTaskFormResponseText).html(
      `<p style="color=red">Please fill all required information</p>`
    );
    setTimeout(() => {
      $(createTaskFormResponseText).html(`<p></p>`);
    }, 2000);
    return;
  }

  let starRating = taskDataObj["starRating"];

  taskDataObj["taskReward"] = Number(starRating) * 100;
  taskDataObj["dueDate"] = new Date(taskDataObj["dueDate"]).getTime();

  console.log();

  createNewTask(taskDataObj);
}

function createNewTask(taskDataObj) {
  uncompleteTasks.push(taskDataObj);
  uncompleteTasks = sortArrayByDueDate(uncompleteTasks);

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

function sortArrayByDueDate(taskArray) {
  taskArray.sort(function (a, b) {
    return parseInt(a["dueDate"]) - parseInt(b["dueDate"]);
  });
  return taskArray;
}

export function readTaskList() {
  console.log("Uncomplete", uncompleteTasks);
  console.log("Completed!", completedTasks);
}

// Complete task
export function completeTask(taskElement) {
  // console.log("completeTaskCalled ", taskElement);
  let taskElementIndex = taskElement.index();
  // console.log("completedTaskIndex:", taskElementIndex);

  var newlyCompletedTask = uncompleteTasks.splice(taskElementIndex, 1)[0];
  taskElement.remove();

  completedTasks.push(newlyCompletedTask);

  createNewTaskElement(newlyCompletedTask, true);
  updateGoldCounter(newlyCompletedTask["taskReward"]);

  // update count
  updateTaskCountUI();

  return readTaskList();
}
export function uncompleteTask(taskElement) {
  // console.log("completeTaskCalled ", taskElement);
  let taskElementIndex = taskElement.index();
  // console.log("completedTaskIndex:", taskElementIndex);

  var newlyUnCompletedTask = completedTasks.splice(taskElementIndex, 1)[0];
  taskElement.remove();

  uncompleteTasks.push(newlyUnCompletedTask);

  createNewTaskElement(newlyUnCompletedTask, false);
  updateGoldCounter(parseInt(newlyUnCompletedTask["taskReward"]) * -1);

  // update count
  updateTaskCountUI();

  return readTaskList();
}

function updateGoldCounter(difference = 0) {
  goldCounter = goldCounter + parseInt(difference);
  $("#goldDisplayCount").html(goldCounter);
}
updateGoldCounter();

export function getArrayValue(array, objectName) {
  return array.find((x) => x.name === objectName).value;
}
