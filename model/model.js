import {
  createNewTaskElement,
  clear_form_elements,
  updateTaskCountUI,
  screenImportantAlert,
  setLastSavedText,
} from "../app/app.js";

// Data
export let uncompleteTasks = [];
export let completedTasks = [];
let savedTaskData = null;
let goldCounter = 0;
let userCategories = [];

// References
let localStorageName = "stardewtodo";
let createTaskFormResponseText = "#createTaskForm--responseText";

// Logic for reading and parsing saved data.
export function getSavedData() {
  let storageData = localStorage.getItem(localStorageName);
  if (storageData != null && storageData != undefined && storageData != "") {
    savedTaskData = JSON.parse(storageData);
    return savedTaskData;
  } else {
    return;
  }
}

// Actually load the content based on our saved data.
export function loadFromSavedData() {
  let savedData = getSavedData();
  if (savedData == null) {
    console.log("loadFromSaveData aborted as no save data was found.");
    setLastSavedText("no save data");
    return;
  }
  setLastSavedText("loading saved data...");
  console.log("Loaded Save Data:", savedData);

  uncompleteTasks = savedData.uncompleteTasks;
  completedTasks = savedData.completedTasks;
  updateGoldCounter(savedData.stats.gold);
  let saveDate = new Date(savedData.stats.saveDate);
  setLastSavedText(saveDate.toLocaleString());
  reloadTaskList();
}
function reloadTaskList() {
  $("#uncompleted-tasks-count").html("[?]");
  $("#completed-tasks-count").html("[?]");
  $("#uncompleted-tasks-list").html("");
  $("#completed-tasks-list").html("");
  uncompleteTasks.forEach((taskObject) => {
    // console.log(taskObject);
    createNewTaskElement(taskObject);
  });
  completedTasks.forEach((taskObject) => {
    // console.log(taskObject);
    createNewTaskElement(taskObject, true);
  });
}

export function saveData() {
  let saveDateButton = "#settings-saveBtn";
  let curDate = new Date();

  savedTaskData = {
    uncompleteTasks: uncompleteTasks,
    completedTasks: completedTasks,
    stats: {
      saveDate: curDate.getTime(),
      gold: goldCounter,
    },
  };
  console.log("data just saved: ", savedTaskData);

  let jsonSavedData = JSON.stringify(savedTaskData);
  localStorage.setItem(localStorageName, jsonSavedData);

  // Update UI
  $(saveDateButton).attr("disabled", true);
  $(saveDateButton).attr("value", "Data Saved!");
  setTimeout(function (e) {
    $(saveDateButton).attr("disabled", false);
    $(saveDateButton).attr("value", "Save Data");
  }, 2000);
  let date = new Date();
  setLastSavedText(date.toLocaleString());
  screenImportantAlert("Data Saved!", 1);
}

export function deleteSaveData() {
  if (
    confirm(
      "Delete Saved Data? This action can not be undone once you leave the page."
    )
  ) {
    screenImportantAlert("Data Deleted!", 2);
    localStorage.removeItem(localStorageName);
    setLastSavedText("Saved data deleted.");
  }
}

// Code for creating a new category.
export function createNewCategory(categoryName) {
  console.log("CREATE NEW CATEGORY: ", categoryName);
  userCategories.push(categoryName);
}

// Logic for when the CreateTask form's submit button is pressed. Checks required forms.
export function submitCreateTaskForm(
  form,
  alertResponse = createTaskFormResponseText,
  createTask = true
) {
  let formArray = form.serializeArray();
  let taskDataObj = {};

  if (
    formArray[0].value.trim().length === 0 ||
    formArray[2].value.trim().length === 0
  ) {
    $(alertResponse).css("color", "red");
    $(alertResponse).html(
      `<p style="color=red">Please fill all required information</p>`
    );
    setTimeout(() => {
      $(alertResponse).html(`<p></p>`);
    }, 2000);
    return;
  }

  $(formArray).each(function (i, field) {
    switch (field.name) {
      case "dueDate":
        console.log("caught", field.value);

        taskDataObj["dueDate"] = new Date(field.value).getTime();
        taskDataObj["dueDateFormatted"] = new Date(field.value)
          .toISOString()
          .replace(/(?:\.\d{1,3})?Z$/, "");
        console.log(taskDataObj["dueDate"]);

        break;

      default:
        taskDataObj[field.name] = field.value;
        break;
    }
  });
  let starRating = taskDataObj["starRating"];
  taskDataObj["taskReward"] = Number(starRating) * 100;
  if (createTask) {
    createNewTask(taskDataObj);
  } else {
    return taskDataObj;
  }
}

// add task to our task list variable.
function createNewTask(taskDataObj) {
  uncompleteTasks.push(taskDataObj);
  uncompleteTasks = sortArrayByDueDate(uncompleteTasks);

  // console.log("== New Task Created ==");
  createNewTaskElement(taskDataObj);

  clear_form_elements("#createTaskForm");
  let ref = $("#createTaskMenu .starRating")
    .find(">:first-child")
    .children("input");
  ref.prop("checked", "true");
  ref.trigger("change");
  $(createTaskFormResponseText).css("color", "black");
  $(createTaskFormResponseText).html(
    `<p style="oolor='red'">Task Added Successfully!</p>`
  );
  setTimeout(() => {
    $(createTaskFormResponseText).html(``);
  }, 2000);
  saveData();

  return readTaskList();
}

let currentlyEditing = null;
export function cancelEditingTask() {
  currentlyEditing = null;
  $("#editNoTaskSelected").css("display", "flex");
  $("#editTaskForm").css("display", "none");
}
function containsObject(obj, list) {
  var x;
  for (x in list) {
    if (deepEqual(list[x], obj)) {
      return x;
    }
  }
  return -1;
}
function deepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
        ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}
export function finishEditingTask() {
  let newTaskData = submitCreateTaskForm(
    $("#editTaskForm"),
    $("#editTaskForm--responseText"),
    false
  );
  if (newTaskData == undefined || newTaskData == null) {
    console.log("finishEditing ABORTED");
  }
  console.log(newTaskData);
  let index = -1;
  if (containsObject(currentlyEditing, uncompleteTasks) != -1) {
    index = containsObject(currentlyEditing, uncompleteTasks);
    uncompleteTasks[index] = newTaskData;
  } else if (containsObject(currentlyEditing, completedTasks) != -1) {
    index = containsObject(currentlyEditing, completedTasks);
    completedTasks[index] = newTaskData;
  } else {
    console.error("TASK TO EDIT NOT FOUND. ABORTING");
  }
  reloadTaskList();
  cancelEditingTask();
  saveData();
}
export function beginEditingTask(taskData) {
  if (taskData == undefined || taskData == null) return;
  let taskDataParsed = JSON.parse(taskData);
  currentlyEditing = taskDataParsed;
  $("#editNoTaskSelected").css("display", "none");
  $("#editTaskForm").css("display", "block");
  $("#editTask").click();

  // Begin populating the field.
  $("#editTaskForm").find("#edit--taskTitle").val(taskDataParsed.taskTitle);
  $("#editTaskForm")
    .find("#edit--taskDescription")
    .val(taskDataParsed.taskDescription);
  $("#editTaskForm")
    .find("#edit--dueDate")
    .val(taskDataParsed.dueDateFormatted);
  $("#editTaskForm").find("#edit--category").val(taskDataParsed.category);
  $("#editTaskForm")
    .find(".starRating")
    .children()
    .eq(parseInt(taskDataParsed.starRating) - 1)
    .find("input")
    .click();
}

// Used to sort our tasks by their due dates.
function sortArrayByDueDate(taskArray) {
  taskArray.sort(function (a, b) {
    return parseInt(a["dueDate"]) - parseInt(b["dueDate"]);
  });
  return taskArray;
}
// Simple log of current task data.
export function readTaskList() {
  console.log("Uncomplete", uncompleteTasks);
  console.log("Completed!", completedTasks);
}

// Called when a task complete button is pressed, moves task to completedTasks and calls for DOM changes and gold upgrade.
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
  saveData();
  return readTaskList();
}
// Called when a task UNcomplete button is pressed. Same as complete task, but the opposite.
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
  saveData();
  return readTaskList();
}

// Function for adding / updating / subtracting gold from the counter.
function updateGoldCounter(difference = 0) {
  goldCounter = goldCounter + parseInt(difference);
  $("#goldDisplayCount").html(goldCounter);
}
updateGoldCounter();
